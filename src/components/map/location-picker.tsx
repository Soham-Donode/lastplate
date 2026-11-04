"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import { LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (latitude: number, longitude: number) => void;
  className?: string;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  className,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const initial = useRef({ latitude, longitude });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    let map: Leaflet.Map | null = null;
    let tileLayer: Leaflet.TileLayer | null = null;
    let observer: MutationObserver | null = null;

    async function setup() {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const start = initial.current;
      map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([start.latitude, start.longitude], 15);

      const applyTiles = () => {
        if (!map) return;
        if (tileLayer) map.removeLayer(tileLayer);

        tileLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: "abc",
            maxZoom: 19,
          },
        ).addTo(map);
      };

      applyTiles();
      observer = new MutationObserver(applyTiles);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      const icon = L.divIcon({
        className: "lp-location-marker",
        html: '<span class="lp-location-pin"></span>',
        iconSize: [36, 46],
        iconAnchor: [18, 44],
      });

      const marker = L.marker([start.latitude, start.longitude], {
        draggable: true,
        keyboard: true,
        autoPan: true,
        icon,
        title: "Drag to adjust the pickup location",
      }).addTo(map);
      markerRef.current = marker;

      const update = (nextLatitude: number, nextLongitude: number) => {
        marker.setLatLng([nextLatitude, nextLongitude]);
        onChangeRef.current(nextLatitude, nextLongitude);
      };

      map.on("click", (event) => {
        update(event.latlng.lat, event.latlng.lng);
      });

      marker.on("dragend", () => {
        const point = marker.getLatLng();
        onChangeRef.current(point.lat, point.lng);
      });

      requestAnimationFrame(() => map?.invalidateSize());
    }

    void setup();

    return () => {
      cancelled = true;
      observer?.disconnect();
      map?.remove();
      map = null;
      tileLayer = null;
      markerRef.current = null;
    };
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus("This browser cannot share your location.");
      return;
    }

    setStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLatitude = position.coords.latitude;
        const nextLongitude = position.coords.longitude;
        markerRef.current?.setLatLng([nextLatitude, nextLongitude]);
        onChangeRef.current(nextLatitude, nextLongitude);
        setStatus("Location updated.");
      },
      () => {
        setStatus("We could not read your location. Tap the map instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="h-64 w-full overflow-hidden rounded-card border border-line sm:h-72"
        role="application"
        aria-label="Pickup location map. Tap the map or drag the pin to choose the exact spot."
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11.5px] leading-4 text-muted">
          Tap the map or drag the pin to set the exact pickup point.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={useMyLocation}
        >
          {status === "Locating…" ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <LocateFixed className="size-3.5" strokeWidth={1.8} />
          )}
          Use my location
        </Button>
      </div>
      {status && status !== "Locating…" && (
        <p className="mt-1 text-[11px] leading-4 text-muted" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
