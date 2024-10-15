"use client";

import { FC, useState } from "react";
import MentorRoute from "./mentor-route";
import DailyEvalMentorDashboard from "@/components/mentor-dashboard/daily-eval-dashboard";
import TestEvalMentorDashboard from "@/components/mentor-dashboard/test-eval-dashboard";
import ParentTab from "@/components/parent-tab";

const Dashboard: FC = () => {
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  return (
    <MentorRoute>
      <div className="flex flex-col w-full space-y-6 px-4 md:px-8 lg:px-12 mt-8">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-[rgb(var(--primary-text))]">
            Dashboard
          </h2>
        </div>
        <ParentTab currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <div>
          {currentTab === "dailyEval" && <DailyEvalMentorDashboard />}
          {currentTab == "testEval" && <TestEvalMentorDashboard />}
        </div>
      </div>
    </MentorRoute>
  );
};

export default Dashboard;
