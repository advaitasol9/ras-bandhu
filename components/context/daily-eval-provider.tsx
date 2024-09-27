"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { useFunctions, useFirestore, useUser as useAuthUser } from "reactfire";
import { doc, onSnapshot } from "firebase/firestore";
import moment from "moment";
import { DailyEvaluationSubscription } from "@/lib/types";

interface DailyEvaluationContextProps {
  subscriptionData: DailyEvaluationSubscription | null;
  isTrialEligible: boolean;
  creditsLeft: number;
  hasActiveSubscription: boolean;
}

// Initialize the context
const DailyEvaluationContext = createContext<DailyEvaluationContextProps>({
  subscriptionData: null,
  isTrialEligible: false,
  creditsLeft: 0,
  hasActiveSubscription: false,
});

// Custom hook to use the context
export const useDailyEvaluation = () => useContext(DailyEvaluationContext);

// Provider component
export const DailyEvaluationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { data: user } = useAuthUser();
  const functions = useFunctions();
  const firestore = useFirestore();

  const [subscriptionData, setSubscriptionData] =
    useState<DailyEvaluationSubscription | null>(null);
  const [isTrialEligible, setIsTrialEligible] = useState(false);

  const currentTime = new Date();
  const subscriptionExpiry = subscriptionData
    ? new Date(subscriptionData?.subscriptionExpiry)
    : null;
  const hasActiveSubscription =
    !!subscriptionExpiry && currentTime < subscriptionExpiry;
  const creditsLeft = subscriptionData?.creditsRemaining || 0;

  useEffect(() => {
    if (!user?.uid) {
      setSubscriptionData(null);
      setIsTrialEligible(false);
      return;
    }

    const subscriptionRef = doc(firestore, "DailyEvalSubscriptions", user.uid);

    const unsubscribe = onSnapshot(
      subscriptionRef,
      (subscriptionSnap) => {
        if (subscriptionSnap.exists()) {
          const data = subscriptionSnap.data() as DailyEvaluationSubscription;
          setSubscriptionData({
            ...data,
            subInfo: { ...data.subInfo, id: data.subscriptionPlan },
          });
          setIsTrialEligible(false);
        } else setIsTrialEligible(true);
      },
      (error) => {
        console.error("Error fetching subscription data in real-time:", error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, firestore]);

  const resetCreditsIfNeeded = async () => {
    if (!subscriptionData) return;
    try {
      const currentTime = moment();
      const lastCreditReset = subscriptionData.lastCreditReset
        ? moment(subscriptionData.lastCreditReset)
        : null;

      if (!lastCreditReset || !lastCreditReset.isSame(currentTime, "day")) {
        await httpsCallable(functions, "checkAndResetDailyCredits")();
      }
    } catch (err) {
      console.error("Error resetting credits:", err);
    }
  };

  useEffect(() => {
    if (user?.uid && hasActiveSubscription) resetCreditsIfNeeded();
  }, [user, hasActiveSubscription]);

  return (
    <DailyEvaluationContext.Provider
      value={{
        subscriptionData,
        isTrialEligible,
        creditsLeft,
        hasActiveSubscription,
      }}
    >
      {children}
    </DailyEvaluationContext.Provider>
  );
};
