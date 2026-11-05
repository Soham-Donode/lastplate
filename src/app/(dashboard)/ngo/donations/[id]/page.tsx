import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  Info,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { requireNgo } from "@/lib/auth";
import { getNgoRepository } from "@/lib/data";
import {
  CATEGORY_LABELS,
  FOOD_TYPE_LABELS,
} from "@/lib/constants";
import {
  cn,
  formatDateTime,
  formatQuantity,
  formatRelative,
  getDeadlineState,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  CategoryIcon,
  DonationStatusBadge,
  RequestStatusBadge,
} from "@/components/dashboard/status-badge";
import { CollectionRequestForm } from "@/components/requests/collection-request-form";
import { CancelRequestButton } from "@/components/requests/cancel-request-button";
import { ConfirmCollectionButton } from "@/components/donations/confirm-collection";

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

export default async function NgoDonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireNgo();
  const detail = await getNgoRepository().getDonationDetail(profile.id, id);

  if (!detail) notFound();

  const { donation, myRequest } = detail;
  const assignedToMe =
    donation.status === "assigned" && donation.assignedNgoId === profile.id;
  const deadlineState = getDeadlineState(donation.pickupDeadline);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/ngo/explore"
          className="inline-flex items-center gap-1.5 rounded-control text-[12px] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.8} />
          Back to explore
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
            href="/ngo/requests"
            className={buttonStyles({ variant: "secondary" })}
          >
            My requests
          </Link>
          <Link
            href="/ngo/explore"
            className={buttonStyles({ variant: "secondary" })}
          >
            Explore more
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
              <div className="flex items-center gap-2.5">
                <CategoryIcon category={donation.category} />
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold text-ink">
                    About this donation
                  </h2>
                  <p className="text-[11px] text-muted">
                    {CATEGORY_LABELS[donation.category]} ·{" "}
                    {FOOD_TYPE_LABELS[donation.foodType]}
                  </p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-[13px] leading-6 text-secondary">
                {donation.description}
              </p>

              {donation.additionalInstructions && (
                <div className="mt-4 glass-well rounded-control p-4">
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
            <h2 className="text-[15px] font-semibold text-ink">
              About the donor
            </h2>
            <div className="mt-3 flex items-start gap-3">
              <Avatar
                name={donation.donor?.organizationName ?? "Food donor"}
                size="md"
                className="mt-0.5"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink">
                  {donation.donor?.organizationName ?? "Food donor"}
                </p>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  {donation.donor?.city ?? donation.city}
                </p>
                <p className="mt-2 text-[11.5px] leading-5 text-muted">
                  Contact details are shared by the donor after a collection
                  request is accepted.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="p-5">
            <h2 className="text-[15px] font-semibold text-ink">
              {myRequest ? "Your request" : "Request this donation"}
            </h2>

            {myRequest ? (
              <div className="mt-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11.5px] text-muted">Status</p>
                    <div className="mt-1">
                      <RequestStatusBadge status={myRequest.status} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11.5px] text-muted">Requested</p>
                    <p className="tabular mt-1 text-[12px] font-medium text-ink">
                      {formatQuantity(
                        myRequest.requestedQuantity,
                        donation.quantityUnit,
                      )}
                    </p>
                  </div>
                </div>

                {myRequest.message && (
                  <p className="mt-3 glass-well rounded-control px-3 py-2 text-[12px] leading-5 text-secondary">
                    “{myRequest.message}”
                  </p>
                )}

                <p className="mt-3 text-[10.5px] text-muted">
                  Sent {formatRelative(myRequest.createdAt)}
                </p>

                {myRequest.status === "pending" && (
                  <div className="mt-4 border-t border-line pt-4">
                    <CancelRequestButton requestId={myRequest.id} />
                  </div>
                )}

                {myRequest.status === "accepted" && assignedToMe && (
                  <div className="mt-4 border-t border-line pt-4">
                    <p className="mb-3 rounded-control bg-accent-soft px-3 py-2.5 text-[11.5px] leading-4 text-accent-strong">
                      Your request was accepted. Collect the food before the
                      pickup deadline, then confirm the collection.
                    </p>
                    <ConfirmCollectionButton donationId={donation.id} />
                  </div>
                )}

                {myRequest.status === "rejected" && (
                  <p className="mt-4 glass-well rounded-control px-3 py-2.5 text-[11.5px] leading-4 text-secondary">
                    The donor chose another organization for this donation.
                  </p>
                )}

                {myRequest.status === "completed" && (
                  <p className="mt-4 rounded-control bg-accent-soft px-3 py-2.5 text-[11.5px] leading-4 text-accent-strong">
                    This collection is complete and recorded in your
                    collections history.
                  </p>
                )}

                {myRequest.status === "cancelled" && (
                  <p className="mt-4 glass-well rounded-control px-3 py-2.5 text-[11.5px] leading-4 text-secondary">
                    You cancelled this request. The donation may still be
                    available.
                  </p>
                )}
              </div>
            ) : donation.status === "available" ? (
              <div className="mt-3">
                <p className="text-[11.5px] leading-5 text-muted">
                  Tell the donor how much you can collect and how you plan to
                  distribute it.
                </p>
                <div className="mt-4">
                  <CollectionRequestForm
                    donationId={donation.id}
                    availableQuantity={donation.quantity}
                    unit={donation.quantityUnit}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-3 glass-well rounded-control px-3 py-2.5 text-[11.5px] leading-4 text-secondary">
                This donation is no longer open for new requests.
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
                      deadlineState === "soon"
                        ? "font-medium text-accent-strong"
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
              <ShieldCheck className="size-4 text-accent-ink" strokeWidth={1.8} />
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
              <DetailRow label="Food type">
                <Badge
                  tone={
                    donation.foodType === "vegetarian" ? "accent" : "outline"
                  }
                >
                  {FOOD_TYPE_LABELS[donation.foodType]}
                </Badge>
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
