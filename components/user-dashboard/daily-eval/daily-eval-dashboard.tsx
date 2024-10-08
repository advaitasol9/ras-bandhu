"use client";

import { FC, useState } from "react";
import { MainNav } from "@/components/user-dashboard/main-nav";
import CreateNewAns from "./create-new-ans";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDailyEvaluation } from "@/components/context/daily-eval-provider";
import { emptyDailyEvaluationSubscription } from "@/lib/types";
import { UserPlanDetail } from "@/components/plans-static/user-plan-detail";
import MentorshipCall from "@/components/user-dashboard/mentorship-call";
import { RecentHistory } from "./recent-history";

const DailyEvalDashboard: FC = () => {
  const [currentSection, setCurrentSection] = useState("evaluations");

  const { subscriptionData, hasActiveSubscription } = useDailyEvaluation();

  return (
    <div className="flex flex-col w-full">
      <div className="flex h-16 items-center bg-[rgb(var(--muted))] px-6 rounded-xl w-full">
        <MainNav
          currentTab={currentSection}
          setCurrentTab={setCurrentSection}
          showMentorshipCallBtn={hasActiveSubscription}
        />
      </div>

      <div className="flex-1 space-y-4 pt-6">
        {currentSection == "evaluations" && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 w-full">
            <CreateNewAns
              hasActiveSubscription={hasActiveSubscription}
              subscriptionData={
                subscriptionData || emptyDailyEvaluationSubscription
              }
            />
            <RecentHistory />
          </div>
        )}
        {currentSection == "myPlans" ? (
          hasActiveSubscription ? (
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
          )
        ) : null}
        {currentSection == "mentorshipCall" && <MentorshipCall />}
      </div>
    </div>
  );
};

export default DailyEvalDashboard;
