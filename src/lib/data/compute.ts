import type {
  ActivityPoint,
  CollectionRecord,
  CollectionRequest,
  CollectionRequestCounts,
  Donation,
  DonationStatusCounts,
  DonationWithDonor,
  DonorOverview,
  NgoOverview,
} from "@/types";
import { dateKey, formatWeekday, percent } from "@/lib/utils";

export function deriveStatusCounts(donations: Donation[]): DonationStatusCounts {
  return donations.reduce<DonationStatusCounts>(
    (counts, donation) => {
      counts[donation.status] += 1;
      return counts;
    },
    { available: 0, assigned: 0, collected: 0, expired: 0, cancelled: 0 },
  );
}

export function buildActivity(
  donations: Donation[],
  days = 7,
  now = new Date(),
): ActivityPoint[] {
  const points: ActivityPoint[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    points.push({
      date: dateKey(date),
      label: formatWeekday(date).slice(0, 1),
      count: 0,
    });
  }

  const index = new Map(points.map((point) => [point.date, point]));

  for (const donation of donations) {
    const point = index.get(dateKey(donation.createdAt));
    if (point) point.count += 1;
  }

  return points;
}

export function buildDonorOverview(
  donations: Donation[],
  pendingRequests: number,
  now = new Date(),
): Omit<DonorOverview, "recentRequests"> {
  const statusCounts = deriveStatusCounts(donations);
  const active = donations.filter(
    (donation) =>
      (donation.status === "available" || donation.status === "assigned") &&
      new Date(donation.pickupDeadline).getTime() > now.getTime(),
  );

  const collected = donations.filter(
    (donation) => donation.status === "collected",
  );

  const foodRescued = collected
    .filter((donation) => donation.quantityUnit === "kg")
    .reduce((total, donation) => total + donation.quantity, 0);

  const upcomingDeadlines = [...active]
    .sort(
      (a, b) =>
        new Date(a.pickupDeadline).getTime() -
        new Date(b.pickupDeadline).getTime(),
    )
    .slice(0, 3);

  return {
    totalDonations: donations.length,
    activeDonations: active.length,
    pendingRequests,
    collectionsCompleted: collected.length,
    foodRescued,
    recentDonations: [...donations]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5),
    upcomingDeadlines,
    activity: buildActivity(donations, 7, now),
    statusCounts,
  };
}

export function collectionRate(statusCounts: DonationStatusCounts) {
  const considered =
    statusCounts.collected +
    statusCounts.available +
    statusCounts.assigned +
    statusCounts.expired;
  return percent(statusCounts.collected, considered);
}

export function deriveRequestCounts(
  requests: CollectionRequest[],
): CollectionRequestCounts {
  return requests.reduce<CollectionRequestCounts>(
    (counts, request) => {
      counts[request.status] += 1;
      return counts;
    },
    { pending: 0, accepted: 0, rejected: 0, cancelled: 0, completed: 0 },
  );
}

export function buildRequestActivity(
  requests: CollectionRequest[],
  days = 7,
  now = new Date(),
): ActivityPoint[] {
  const points: ActivityPoint[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(date.getDate() - offset);
    points.push({
      date: dateKey(date),
      label: formatWeekday(date).slice(0, 1),
      count: 0,
    });
  }

  const index = new Map(points.map((point) => [point.date, point]));
  for (const request of requests) {
    const point = index.get(dateKey(request.createdAt));
    if (point) point.count += 1;
  }

  return points;
}

export function buildNgoOverview(
  requests: CollectionRequest[],
  collections: CollectionRecord[],
  availableDonations: number,
  nearbyDonations: DonationWithDonor[],
  upcomingPickups: DonationWithDonor[],
  now = new Date(),
): NgoOverview {
  const requestCounts = deriveRequestCounts(requests);
  const foodCollected = collections
    .filter((record) => record.quantityUnit === "kg")
    .reduce((total, record) => total + record.collectedQuantity, 0);

  return {
    availableDonations,
    pendingRequests: requestCounts.pending,
    acceptedRequests: requestCounts.accepted,
    completedCollections: collections.length,
    foodCollected,
    recentRequests: [...requests]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4),
    upcomingPickups: [...upcomingPickups]
      .sort(
        (a, b) =>
          new Date(a.pickupDeadline).getTime() -
          new Date(b.pickupDeadline).getTime(),
      )
      .slice(0, 3),
    nearbyDonations: nearbyDonations.slice(0, 3),
    mapDonations: nearbyDonations,
    activity: buildRequestActivity(requests, 7, now),
    requestCounts,
  };
}
