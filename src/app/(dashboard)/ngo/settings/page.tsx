import { requireNgo } from "@/lib/auth";
import { isDemoMode } from "@/lib/data";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/forms/profile-form";

export const metadata = {
  title: "Settings",
};

export default async function NgoSettingsPage() {
  const profile = await requireNgo();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PageHeader
        title="Settings"
        description="Manage how your organization appears to food donors on LastPlate."
      />
      <ProfileForm profile={profile} demo={isDemoMode} />
    </div>
  );
}
