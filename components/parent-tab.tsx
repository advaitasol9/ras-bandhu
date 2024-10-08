import React from "react";
import { Button } from "./ui/button";

const ParentTab = ({
  currentTab,
  handleTabChange,
}: {
  currentTab: string;
  handleTabChange: (val: string) => void;
}) => {
  return (
    <div className="flex space-x-4">
      <Button
        variant={currentTab === "dailyEval" ? "default" : "outline"}
        onClick={() => handleTabChange("dailyEval")}
        className={`px-4 py-2 ${
          currentTab === "dailyEval"
            ? "text-[rgb(var(--button-text))]"
            : "text-[rgb(var(--primary-text))]"
        }`}
      >
        Daily Evaluation
      </Button>
      <Button
        variant={currentTab === "testEval" ? "default" : "outline"}
        onClick={() => handleTabChange("testEval")}
        className={`px-4 py-2 ${
          currentTab === "testEval"
            ? "text-[rgb(var(--button-text))]"
            : "text-[rgb(var(--primary-text))]"
        }`}
      >
        Test Evaluation
      </Button>
    </div>
  );
};

export default ParentTab;
