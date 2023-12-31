import { Suspense } from "react";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { Info } from "../_components/Info";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ActivityList } from "./_components/ActivityList";
import { checkSubscription } from "@/lib/check-subscription";

export default async function ActivityPage() {
  const { orgId } = auth();

  if (!orgId) {
    redirect("/select-org");
  }

  const isPro = await checkSubscription();

  const activityLogs = await prismadb.activityLog.findMany({
    where: {
      orgId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="w-full">
      <Info isPro={isPro} />

      <Separator className="my-2" />

      <Suspense fallback={<ActivityList.Skeleton />}>
        <ActivityList activityLogs={activityLogs} />
      </Suspense>
    </div>
  );
}
