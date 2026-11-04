import { requireDonor } from "@/lib/auth";
import { DonationForm } from "@/components/donations/donation-form";

export const metadata = {
  title: "Create donation",
};

export default async function NewDonationPage() {
  const profile = await requireDonor();
  return <DonationForm profile={profile} />;
}
