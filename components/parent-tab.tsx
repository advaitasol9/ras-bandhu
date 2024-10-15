"use client";

import React, { useEffect } from "react";
import { Button } from "./ui/button";

const ParentTab = ({
  currentTab,
  setCurrentTab,
}: {
  currentTab: string | null;
  setCurrentTab: (val: string) => void;
}) => {
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    localStorage.setItem("parent-tab", tab);
  };

  useEffect(() => {
    const savedTab = localStorage.getItem("parent-tab");
    if (savedTab) {
      setCurrentTab(savedTab);
    } else {
      setCurrentTab("dailyEval");
    }
  }, []);

  return (
    <div className="flex space-x-4">
      <Button
        variant={currentTab === "dailyEval" ? "default" : "outline"}
        onClick={() => handleTabChange("dailyEval")}
        className={`px-4 py-2 ${
          currentTab === "dailyEval" ? "text-button-text" : "text-primary-text"
        }`}
      >
        Daily Evaluation
      </Button>
      <Button
        variant={currentTab === "testEval" ? "default" : "outline"}
        onClick={() => handleTabChange("testEval")}
        className={`px-4 py-2 ${
          currentTab === "testEval" ? "text-button-text" : "text-primary-text"
        }`}
      >
        Test Evaluation
      </Button>
    </div>
  );
};

export default ParentTab;
