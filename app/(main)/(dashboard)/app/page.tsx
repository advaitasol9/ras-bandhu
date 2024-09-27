"use client";

import { FC, useEffect, useState } from "react";
import { MainNav } from "@/components/demo-dashboard/main-nav";
import { RecentHistory } from "@/components/demo-dashboard/recent-history";

import Link from "next/link";
import { useUserContext } from "@/components/context/user-provider";
import { Button } from "@/components/ui/button";
import CreateNewAns from "@/components/demo-dashboard/create-new-ans";
import { useRouter } from "next/navigation";
import { useDailyEvaluation } from "@/components/context/daily-eval-provider";
import { emptyDailyEvaluationSubscription } from "@/lib/types";
import { UserPlanDetail } from "@/components/plans-static/user-plan-detail";

const Dashboard: FC = () => {
  const [currentTab, setCurrentTab] = useState("evaluations");

  const { subscriptionData, hasActiveSubscription } = useDailyEvaluation();
  const { isMentor, isAdmin, userData } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (isMentor) router.replace("/mentor");
    else if (isAdmin) router.replace("/admin");
    else {
      if (userData && (!userData?.name || !userData?.email))
        router.replace("/app/profile");
    }
  }, [isMentor, isAdmin, userData]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-3xl leading-5 font-bold tracking-tight text-[rgb(var(--primary-text))]">
          Dashboard
        </h2>
      </div>
      <div className="flex h-16 items-center bg-[rgb(var(--muted))] px-6 rounded-xl w-full">
        <MainNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>
      <div className="flex-1 space-y-4 pt-6">
        {currentTab == "evaluations" ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 w-full">
            <CreateNewAns
              hasActiveSubscription={hasActiveSubscription}
              subscriptionData={
                subscriptionData || emptyDailyEvaluationSubscription
              }
            />
            <RecentHistory />
          </div>
        ) : hasActiveSubscription ? (
          <UserPlanDetail
            index={0}
            subscriptionData={
              subscriptionData || emptyDailyEvaluationSubscription
            }
          />
        ) : (
          <div className="flex flex-col items-center w-full">
            <h1 className="font-medium text-[rgb(var(--primary-text))]">
              No Active Subscription
            </h1>
            <Link href="/daily-evaluation">
              <Button size="lg" variant="link">
                View Evaluation Plans &rarr;
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
