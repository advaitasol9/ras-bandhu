"use client";

import React, { useState, useEffect } from "react";
import { useFirestore } from "reactfire";
import { collection, query, where, getDocs } from "firebase/firestore";
import { PlanDetail } from "@/components/plans-static/daily-eval-plan-info";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plan } from "@/lib/types";

const AdminSubscriptions: React.FC = () => {
  const firestore = useFirestore();
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Plan[]>([]);
  const [selectedType, setSelectedType] = useState("dailyEvaluation");
  const [selectedMedium, setSelectedMedium] = useState("all");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      let q = query(collection(firestore, "SubscriptionPlans"));

      q = query(q, where("parentSection", "==", selectedType));

      if (selectedMedium !== "all") {
        q = query(q, where("medium", "==", selectedMedium));
      }

      const querySnapshot = await getDocs(q);
      const fetchedSubscriptions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Plan[];

      setSubscriptions(fetchedSubscriptions);
    };

    fetchSubscriptions();
  }, [firestore, selectedType, selectedMedium]);

  return (
    <div className="container mx-auto mt-12">
      <h1 className="text-2xl font-semibold mb-8 text-primary-text">
        Subscription Plans
      </h1>

      {/* Dropdowns for filtering */}
      <div className="flex space-x-4 mb-8">
        {/* Type Dropdown */}
        <div>
          <label htmlFor="typeFilter" className="block mb-2 text-primary-text">
            Type
          </label>
          <select
            id="typeFilter"
            className="px-3 py-2 border border-primary rounded-md bg-background text-primary-text"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="dailyEvaluation">Daily Evaluation</option>
            <option value="testEvaluation">Test Evaluation</option>
            <option value="testSeries">Test Series</option>
          </select>
        </div>

        {/* Medium Dropdown */}
        <div>
          <label
            htmlFor="mediumFilter"
            className="block mb-2 text-primary-text"
          >
            Medium
          </label>
          <select
            id="mediumFilter"
            className="px-3 py-2 border border-primary rounded-md bg-background text-primary-text"
            value={selectedMedium}
            onChange={(e) => setSelectedMedium(e.target.value)}
          >
            <option value="all">All Mediums</option>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
          </select>
        </div>
      </div>

      <Button
        className="mb-8 bg-primary text-button-text hover:bg-primary-foreground"
        onClick={() => router.push("/admin/subscriptions/add-new")}
      >
        Add New
      </Button>

      {/* Render the filtered subscriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.length > 0 ? (
          subscriptions.map((subscription: Plan, index: number) => (
            <PlanDetail
              key={index}
              index={index}
              plan={subscription}
              //@ts-ignore
              onSubscribe={() => {}}
            />
          ))
        ) : (
          <p className="text-primary-text">No subscription plans available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptions;
