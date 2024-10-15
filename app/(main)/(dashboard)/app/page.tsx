"use client";

import { FC, useState } from "react";
import DailyEvalDashboard from "@/components/user-dashboard/daily-eval/daily-eval-dashboard";
import TestEvalDashboard from "@/components/user-dashboard/test-eval/test-eval-dashboard";
import UserRoute from "./user-route";
import ParentTab from "@/components/parent-tab";

const Dashboard: FC = () => {
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  return (
    <UserRoute>
      <div className="flex flex-col w-full space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-primary-text">
            Dashboard
          </h2>
        </div>
        <ParentTab currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <div>
          {currentTab === "dailyEval" && <DailyEvalDashboard />}
          {currentTab == "testEval" && <TestEvalDashboard />}
        </div>
      </div>
    </UserRoute>
  );
};

export default Dashboard;
