"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useFirestore } from "reactfire";
import { collection, getDocs } from "firebase/firestore";
import { Plan } from "@/lib/types";

interface SubscriptionContextType {
  dailyEvaluationPlans: Plan[];
  testEvaluationPlans: Plan[];
  testSeriesPlans: Plan[];
}

const SubscriptionPlansContext = createContext<SubscriptionContextType>({
  dailyEvaluationPlans: [],
  testEvaluationPlans: [],
  testSeriesPlans: [],
});

export const useSubscriptionPlans = () => useContext(SubscriptionPlansContext);

export const SubscriptionPlansProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const firestore = useFirestore();

  const [dailyEvaluationPlans, setDailyEvaluationPlans] = useState<Plan[]>([]);
  const [testEvaluationPlans, setTestEvaluationPlans] = useState<Plan[]>([]);
  const [testSeriesPlans, setTestSeriesPlans] = useState<Plan[]>([]);

  const fetchSubscriptionPlans = async () => {
    try {
      const plansRef = collection(firestore, "SubscriptionPlans");

      const plansSnapshot = await getDocs(plansRef);
      const allPlans = plansSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Plan[];

      const dailyEvaluation = allPlans.filter(
        (plan) => plan.parentSection === "dailyEvaluation"
      );
      const testEvaluation = allPlans.filter(
        (plan) => plan.parentSection === "testEvaluation"
      );
      const testSeries = allPlans.filter(
        (plan) => plan.parentSection === "testSeries"
      );

      setDailyEvaluationPlans(
        dailyEvaluation.sort((a, b) => a.price - b.price)
      );
      setTestEvaluationPlans(testEvaluation);
      setTestSeriesPlans(testSeries);
    } catch (error) {
      console.error("Error fetching subscription plans: ", error);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  return (
    <SubscriptionPlansContext.Provider
      value={{
        dailyEvaluationPlans,
        testEvaluationPlans,
        testSeriesPlans,
      }}
    >
      {children}
    </SubscriptionPlansContext.Provider>
  );
};
