"use client";

import { FC, useEffect, useState } from "react";
import DailyEvalDashboard from "@/components/user-dashboard/daily-eval/daily-eval-dashboard";
import TestEvalDashboard from "@/components/user-dashboard/test-eval/test-eval-dashboard";
import UserRoute from "./user-route";
import ParentTab from "@/components/parent-tab";

const Dashboard: FC = () => {
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  useEffect(() => {
    const savedTab = localStorage.getItem("user-dashboard-tab");
    if (savedTab) {
      setCurrentTab(savedTab);
    } else {
      setCurrentTab("dailyEval");
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    localStorage.setItem("user-dashboard-tab", tab);
  };

  if (!currentTab) {
    return null;
  }

  return (
    <UserRoute>
      <div className="flex flex-col w-full space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-[rgb(var(--primary-text))]">
            Dashboard
          </h2>
        </div>
        <ParentTab currentTab={currentTab} handleTabChange={handleTabChange} />
        <div>
          {currentTab === "dailyEval" ? (
            <DailyEvalDashboard />
          ) : (
            <TestEvalDashboard />
          )}
        </div>
      </div>
    </UserRoute>
  );
};

export default Dashboard;
