export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Approximate city centres used when an organization or donation has not been
 * pinned on the map yet. The list is intentionally small: it only covers the
 * cities used by the sample workspace and common Indian launch cities.
 */
const CITY_CENTRES: Record<string, Coordinates> = {
  bengaluru: { latitude: 12.9716, longitude: 77.5946 },
  bangalore: { latitude: 12.9716, longitude: 77.5946 },
  mumbai: { latitude: 19.076, longitude: 72.8777 },
  delhi: { latitude: 28.6139, longitude: 77.209 },
  "new delhi": { latitude: 28.6139, longitude: 77.209 },
  chennai: { latitude: 13.0827, longitude: 80.2707 },
  hyderabad: { latitude: 17.385, longitude: 78.4867 },
  pune: { latitude: 18.5204, longitude: 73.8567 },
  kolkata: { latitude: 22.5726, longitude: 88.3639 },
  ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
  jaipur: { latitude: 26.9124, longitude: 75.7873 },
};

export const DEFAULT_CENTRE: Coordinates = {
  latitude: 12.9716,
  longitude: 77.5946,
};

export function isValidLatitude(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(
  value: number | null | undefined,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  );
}

export function cityCentre(city: string): Coordinates {
  return CITY_CENTRES[city.trim().toLowerCase()] ?? DEFAULT_CENTRE;
}

/**
 * Returns stored coordinates when they are usable, otherwise falls back to the
 * city centre. Callers can use `hasCoordinates` first when they need to know
 * whether a location was actually pinned.
 */
export function resolveCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
  city: string,
): Coordinates {
  if (isValidLatitude(latitude) && isValidLongitude(longitude)) {
    return { latitude, longitude };
  }

  return cityCentre(city);
}

export function hasCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): boolean {
  return isValidLatitude(latitude) && isValidLongitude(longitude);
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance in kilometres. */
export function distanceKm(from: Coordinates, to: Coordinates): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}
