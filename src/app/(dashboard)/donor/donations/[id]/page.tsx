import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  Info,
  Inbox,
  MapPin,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { requireDonor } from "@/lib/auth";
import { getDonorRepository } from "@/lib/data";
import {
  CATEGORY_LABELS,
  FOOD_TYPE_LABELS,
} from "@/lib/constants";
import {
  formatDateTime,
  formatQuantity,
  formatRelative,
  getDeadlineState,
  cn,
} from "@/lib/utils";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DonationStatusBadge,
  RequestStatusBadge,
} from "@/components/dashboard/status-badge";
import { RequestActions } from "@/components/requests/request-actions";
import { MarkCollectedButton } from "@/components/donations/mark-collected";

export const metadata = {
  title: "Donation details",
};

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2.5 last:border-0 last:pb-0">
      <span className="text-[11.5px] text-muted">{label}</span>
      <span className="text-right text-[12px] font-medium text-ink">
        {children}
      </span>
    </div>
  );
}

export default async function DonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireDonor();
  const detail = await getDonorRepository().getDonationDetail(profile.id, id);

  if (!detail) notFound();

  const { donation, requests } = detail;
  const pendingRequests = requests.filter(
    (request) => request.status === "pending",
  );
  const deadlineState = getDeadlineState(donation.pickupDeadline);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/donor/donations"
          className="inline-flex items-center gap-1.5 rounded-control text-[12px] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.8} />
          Back to donations
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <DonationStatusBadge status={donation.status} />
            <span className="text-[11px] text-muted">
              {CATEGORY_LABELS[donation.category]}
            </span>
            <span aria-hidden="true" className="text-line-strong">
              ·
            </span>
            <span className="text-[11px] text-muted">
              {FOOD_TYPE_LABELS[donation.foodType]}
            </span>
          </div>
          <h1 className="text-[26px] font-semibold leading-8 tracking-[-0.03em] text-ink sm:text-[30px]">
            {donation.title}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            {formatQuantity(donation.quantity, donation.quantityUnit)} available
            · Pickup {formatRelative(donation.pickupDeadline)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Link
            href="/donor/requests"
            className={buttonStyles({ variant: "secondary" })}
          >
            <Inbox className="size-4" strokeWidth={1.8} />
            All requests
          </Link>
          <Link
            href="/donor/donations/new"
            className={buttonStyles({ variant: "secondary" })}
          >
            <UtensilsCrossed className="size-4" strokeWidth={1.8} />
            New donation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <Card className="overflow-hidden">
            {donation.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={donation.imageUrl}
                alt={donation.title}
                className="h-56 w-full object-cover"
              />
            )}
            <div className="p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold text-ink">
                About this donation
              </h2>
              <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-secondary">
                {donation.description}
              </p>

              {donation.additionalInstructions && (
                <div className="mt-4 rounded-control border border-line bg-canvas p-4">
                  <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink">
                    <Info className="size-3.5 text-muted" strokeWidth={1.8} />
                    Pickup instructions
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-[12px] leading-5 text-muted">
                    {donation.additionalInstructions}
                  </p>
                </div>
              )}

              {donation.allergens && (
                <p className="mt-4 text-[11.5px] leading-5 text-muted">
                  <span className="font-medium text-secondary">
                    Allergens:
                  </span>{" "}
                  {donation.allergens}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-ink">
                Collection requests
              </h2>
              {pendingRequests.length > 0 && (
                <span className="text-[11.5px] text-muted">
                  {pendingRequests.length} awaiting your review
                </span>
              )}
            </div>

            {requests.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No requests yet"
                description="Verified NGOs can see this listing and request a collection while it is available."
                className="mt-4 py-8"
              />
            ) : (
              <ul className="mt-2 divide-y divide-line">
                {requests.map((request) => (
                  <li key={request.id} className="py-4 first:pt-2 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={request.ngo?.organizationName ?? "NGO"}
                        size="sm"
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-ink">
                              {request.ngo?.organizationName ?? "NGO"}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted">
                              {request.ngo?.city ?? "—"} · Requested{" "}
                              {formatQuantity(
                                request.requestedQuantity,
                                donation.quantityUnit,
                              )}{" "}
                              · {formatRelative(request.createdAt)}
                            </p>
                          </div>
                          <RequestStatusBadge status={request.status} />
                        </div>

                        {request.message && (
                          <p className="mt-2 rounded-control bg-canvas px-3 py-2 text-[12px] leading-5 text-secondary">
                            “{request.message}”
                          </p>
                        )}

                        {request.status === "pending" && (
                          <RequestActions requestId={request.id} />
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold text-ink">
              Listing summary
            </h2>
            <div className="mt-2">
              <DetailRow label="Status">
                <DonationStatusBadge status={donation.status} />
              </DetailRow>
              <DetailRow label="Quantity">
                {formatQuantity(donation.quantity, donation.quantityUnit)}
              </DetailRow>
              <DetailRow label="Category">
                {CATEGORY_LABELS[donation.category]}
              </DetailRow>
              <DetailRow label="Food type">
                {FOOD_TYPE_LABELS[donation.foodType]}
              </DetailRow>
              <DetailRow label="Published">
                {formatDateTime(donation.createdAt)}
              </DetailRow>
              {donation.assignedNgo && (
                <DetailRow label="Assigned NGO">
                  {donation.assignedNgo.organizationName}
                </DetailRow>
              )}
            </div>

            {donation.status === "assigned" && (
              <div className="mt-4 border-t border-line pt-4">
                <MarkCollectedButton donationId={donation.id} />
              </div>
            )}

            {donation.status === "available" && (
              <p className="mt-4 rounded-control bg-green-light px-3 py-2.5 text-[11.5px] leading-4 text-green-dark">
                This listing is visible to verified NGOs. Accept a request to
                assign the collection.
              </p>
            )}

            {donation.status === "expired" && (
              <p className="mt-4 rounded-control bg-surface px-3 py-2.5 text-[11.5px] leading-4 text-secondary">
                This listing passed its safe-consumption deadline and is no
                longer visible to NGOs.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-semibold text-ink">
              Pickup details
            </h2>
            <div className="mt-3 space-y-3 text-[12px] leading-5">
              <p className="flex items-start gap-2 text-secondary">
                <MapPin
                  className="mt-0.5 size-3.5 shrink-0 text-muted"
                  strokeWidth={1.8}
                />
                <span>
                  {donation.pickupAddress}
                  <span className="mt-0.5 block text-muted">
                    {donation.city}
                  </span>
                </span>
              </p>
              <p className="flex items-start gap-2 text-secondary">
                <CalendarClock
                  className="mt-0.5 size-3.5 shrink-0 text-muted"
                  strokeWidth={1.8}
                />
                <span>
                  Pickup by {formatDateTime(donation.pickupDeadline)}
                  <span
                    className={cn(
                      "mt-0.5 block text-[11px]",
                      deadlineState === "overdue"
                        ? "text-muted"
                        : deadlineState === "soon"
                          ? "text-green-dark"
                          : "text-muted",
                    )}
                  >
                    {formatRelative(donation.pickupDeadline)}
                  </span>
                </span>
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
              <ShieldCheck className="size-4 text-green-text" strokeWidth={1.8} />
              Food safety
            </h2>
            <div className="mt-2">
              <DetailRow label="Prepared at">
                {formatDateTime(donation.preparedAt)}
              </DetailRow>
              <DetailRow label="Safe until">
                {formatDateTime(donation.safeUntil)}
              </DetailRow>
              <DetailRow label="Allergens">
                {donation.allergens || "Not provided"}
              </DetailRow>
            </div>
            <p className="mt-4 flex items-start gap-1.5 text-[10.5px] leading-4 text-muted">
              <Clock3
                className="mt-0.5 size-3 shrink-0"
                strokeWidth={1.8}
              />
              LastPlate coordinates collections and does not certify food
              safety. Follow applicable local regulations.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
