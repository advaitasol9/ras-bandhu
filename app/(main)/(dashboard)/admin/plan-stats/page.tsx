"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { Plan } from "@/lib/types";
import { useSubscriptionPlans } from "@/components/context/subscription-provider";
import { useRouter } from "next/navigation";
import ParentTab from "@/components/parent-tab";

const SubscriptionStats = () => {
  const { dailyEvaluationPlans, testEvaluationPlans } = useSubscriptionPlans();
  const router = useRouter();

  const [currentMetric, setCurrentMetric] = useState("revenue");
  const [selectedMedium, setSelectedMedium] = useState("All");
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  var plansToShow: Plan[] = [];
  if (currentTab == "dailyEval") plansToShow = dailyEvaluationPlans;
  if (currentTab == "testEval") plansToShow = testEvaluationPlans;

  const filteredPlans = plansToShow.filter((plan: Plan) => {
    if (selectedMedium === "All") return true;
    return plan.medium === selectedMedium.toLowerCase();
  });

  const chartData = filteredPlans.map((plan: Plan) => ({
    name: `${plan.name}-${plan.medium.charAt(0).toUpperCase()}`,
    medium: plan.medium.charAt(0).toUpperCase() + plan.medium.slice(1),
    seatsLeft: plan.seatsLeft,
    admissions: plan.admissions,
    revenue: plan.revenue,
    planId: plan.id, // Assuming `plan.id` exists
  }));

  const handleMetricChange = (metric: string) => {
    setCurrentMetric(metric);
  };

  const handleMediumChange = (medium: string) => {
    setSelectedMedium(medium);
  };

  const handleBarClick = (data: any) => {
    router.push(
      `/admin/plan-stats/user-list?planId=${data.planId}&parent=${currentTab}`
    );
  };

  const CustomTick = (props: any) => {
    const { x, y, payload } = props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="rgb(var(--primary-text))"
          transform="rotate(-45)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const getButtonStyles = (isActive: boolean) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
      isActive ? "bg-primary text-white" : "bg-muted text-primary-text"
    }`;

  return (
    <div>
      <div className="flex justify-center">
        <ParentTab currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>
      <div
        className={`mt-4 mx-auto p-6 bg-card rounded-lg shadow-lg w-full ${
          filteredPlans.length <= 2
            ? "max-w-md"
            : filteredPlans.length <= 4
            ? "max-w-lg"
            : "max-w-3xl"
        }`}
      >
        <h2 className="text-xl font-bold text-primary-text mb-6 text-center">
          Subscription Plans Statistics
        </h2>

        <div className="flex justify-center mb-6 space-x-4">
          {["All", "English", "Hindi"].map((medium) => (
            <button
              key={medium}
              className={getButtonStyles(selectedMedium === medium)}
              onClick={() => handleMediumChange(medium)}
            >
              {medium}
            </button>
          ))}
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex justify-center mb-6 space-x-4">
          {["revenue", "admissions", "seatsLeft"].map((metric) => (
            <button
              key={metric}
              className={getButtonStyles(currentMetric === metric)}
              onClick={() => handleMetricChange(metric)}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>

        {/* Responsive Container for Bar Chart */}
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              onClick={(event) => {
                if (event && event.activePayload) {
                  const clickedData = event.activePayload[0].payload;
                  handleBarClick(clickedData);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={<CustomTick />}
                height={80}
                interval={0}
              />
              <YAxis>
                <LabelList dataKey={currentMetric} position="insideLeft" />
              </YAxis>
              <Tooltip />
              <Legend />
              <Bar dataKey={currentMetric} fill="rgb(var(--primary))">
                <LabelList dataKey={currentMetric} position="top" />
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    cursor="pointer"
                    onClick={() => handleBarClick(entry)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStats;
