"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type * as Leaflet from "leaflet";
import type { DonationWithDonor } from "@/types";
import {
  distanceKm,
  formatDistance,
  hasCoordinates,
  resolveCoordinates,
} from "@/lib/geo";

interface DonationMapProps {
  donations: DonationWithDonor[];
  latitude: number | null;
  longitude: number | null;
  city: string;
  radiusKm?: number;
  hrefBase: string;
  className?: string;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

function safeImageUrl(url: string | null) {
  if (!url) return null;
  if (url.startsWith("/")) return url;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? url
      : null;
  } catch {
    return null;
  }
}

function markerHtml(donation: DonationWithDonor, imageUrl: string | null) {
  const image = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="" class="lp-map-pin__image" />`
    : `<span class="lp-map-pin__fallback" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </span>`;

  return `<span class="lp-map-pin">${image}</span>
    <span class="lp-map-pin__label">${escapeHtml(donation.title)}</span>`;
}

export function DonationMap({
  donations,
  latitude,
  longitude,
  city,
  radiusKm = 10,
  hrefBase,
  className,
}: DonationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let map: Leaflet.Map | null = null;
    let tileLayer: Leaflet.TileLayer | null = null;
    let observer: MutationObserver | null = null;

    async function setup() {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const centre = resolveCoordinates(latitude, longitude, city);
      map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([centre.latitude, centre.longitude], 13);

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

      const circle = L.circle([centre.latitude, centre.longitude], {
        radius: radiusKm * 1000,
        color: "#27864A",
        weight: 1.5,
        opacity: 0.9,
        fillColor: "#27864A",
        fillOpacity: 0.06,
        dashArray: "6 7",
        interactive: false,
      }).addTo(map);

      L.circleMarker([centre.latitude, centre.longitude], {
        radius: 5,
        color: "#ffffff",
        weight: 2,
        fillColor: "#27864A",
        fillOpacity: 1,
        interactive: false,
      })
        .addTo(map)
        .bindTooltip(`${escapeHtml(city)} base`, {
          direction: "top",
          offset: [0, -8],
        });

      const markers = donations
        .filter((donation) =>
          hasCoordinates(donation.latitude, donation.longitude),
        )
        .map((donation) => ({
          donation,
          point: resolveCoordinates(
            donation.latitude,
            donation.longitude,
            donation.city,
          ),
        }))
        .filter(
          ({ point }) => distanceKm(centre, point) <= radiusKm,
        )
        .sort(
          (a, b) =>
            distanceKm(centre, a.point) - distanceKm(centre, b.point),
        );

      for (const { donation, point } of markers) {
        const icon = L.divIcon({
          className: "lp-map-marker",
          html: markerHtml(donation, safeImageUrl(donation.imageUrl)),
          iconSize: [168, 76],
          iconAnchor: [84, 48],
        });

        const marker = L.marker([point.latitude, point.longitude], {
          icon,
          title: donation.title,
          alt: `${donation.title} — ${formatDistance(distanceKm(centre, point))}`,
          keyboard: true,
          riseOnHover: true,
        });

        marker.on("click", () => {
          router.push(`${hrefBase}/${donation.id}`);
        });

        marker.addTo(map);
      }

      map.fitBounds(circle.getBounds(), {
        padding: [28, 28],
        maxZoom: 14,
      });

      // Leaflet needs a moment after the panel is laid out.
      requestAnimationFrame(() => map?.invalidateSize());
    }

    void setup();

    return () => {
      cancelled = true;
      observer?.disconnect();
      map?.remove();
      map = null;
      tileLayer = null;
    };
  }, [donations, latitude, longitude, city, radiusKm, hrefBase, router]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="region"
      aria-label={`Map of donations within ${radiusKm} kilometres of ${city}`}
    />
  );
}
