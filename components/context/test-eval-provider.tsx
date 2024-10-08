"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useFirestore, useUser as useAuthUser } from "reactfire";
import { doc, onSnapshot } from "firebase/firestore";
import { TestEvaluationSubscription } from "@/lib/types"; // Adjust type to TestEvaluationSubscription

interface TestEvaluationContextProps {
  subscriptionData: TestEvaluationSubscription | null;
  creditsLeft: number;
  hasActiveSubscription: boolean;
}

// Initialize the context
const TestEvaluationContext = createContext<TestEvaluationContextProps>({
  subscriptionData: null,
  creditsLeft: 0,
  hasActiveSubscription: false,
});

// Custom hook to use the context
export const useTestEvaluation = () => useContext(TestEvaluationContext);

// Provider component
export const TestEvaluationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { data: user } = useAuthUser();
  const firestore = useFirestore();

  const [subscriptionData, setSubscriptionData] =
    useState<TestEvaluationSubscription | null>(null);

  const currentTime = new Date();
  const subscriptionExpiry = subscriptionData
    ? new Date(subscriptionData?.subscriptionExpiry)
    : null;

  const hasActiveSubscription =
    !!subscriptionExpiry && currentTime < subscriptionExpiry;
  const creditsLeft = subscriptionData?.creditsRemaining || 0;
  console.log("aaa", subscriptionData);
  useEffect(() => {
    if (!user?.uid) {
      setSubscriptionData(null);
      return;
    }

    const subscriptionRef = doc(firestore, "TestEvalSubscriptions", user.uid);

    const unsubscribe = onSnapshot(
      subscriptionRef,
      (subscriptionSnap) => {
        if (subscriptionSnap.exists()) {
          const data = subscriptionSnap.data() as TestEvaluationSubscription;
          setSubscriptionData({
            ...data,
            subInfo: { ...data.subInfo, id: data.subscriptionPlan },
          });
        }
      },
      (error) => {
        console.error(
          "Error fetching test subscription data in real-time:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, [user?.uid, firestore]);

  return (
    <TestEvaluationContext.Provider
      value={{
        subscriptionData,
        creditsLeft,
        hasActiveSubscription,
      }}
    >
      {children}
    </TestEvaluationContext.Provider>
  );
};
