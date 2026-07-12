import { getActivityFeed } from "@/lib/activity";
import { PageHeader } from "@/components/ui/PageHeader";
import { ActivityFeed } from "@/components/activity/ActivityFeed";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const events = await getActivityFeed(50);

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Organization"
        title="Activity Feed"
        icon="Activity"
        accent="#A1A1AA"
        description="A live pulse of everything happening across the platform - approvals, badges, redemptions, new carbon, and anomalies."
      />
      <ActivityFeed events={events} />
    </div>
  );
}
