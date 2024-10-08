"use client";

import { FC, useEffect, useState } from "react";
import MentorRoute from "./mentor-route";
import DailyEvalMentorDashboard from "@/components/mentor-dashboard/daily-eval-dashboard";
import TestEvalMentorDashboard from "@/components/mentor-dashboard/test-eval-dashboard";
import ParentTab from "@/components/parent-tab";

const Dashboard: FC = () => {
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  useEffect(() => {
    const savedTab = localStorage.getItem("mentor-dashboard-tab");
    if (savedTab) {
      setCurrentTab(savedTab);
    } else {
      setCurrentTab("dailyEval");
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    localStorage.setItem("mentor-dashboard-tab", tab);
  };

  if (!currentTab) {
    return null;
  }

  return (
    <MentorRoute>
      <div className="flex flex-col w-full space-y-6 px-4 md:px-8 lg:px-12 mt-8">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-[rgb(var(--primary-text))]">
            Dashboard
          </h2>
        </div>
        <ParentTab currentTab={currentTab} handleTabChange={handleTabChange} />
        <div>
          {currentTab === "dailyEval" ? (
            <DailyEvalMentorDashboard />
          ) : (
            <TestEvalMentorDashboard />
          )}
        </div>
      </div>
    </MentorRoute>
  );
};

export default Dashboard;
