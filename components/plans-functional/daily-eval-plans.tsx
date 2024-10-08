"use client";

import React, { useState } from "react";
import { PlanDetail } from "../plans-static/daily-eval-plan-info";
import { Plan } from "@/lib/types";
import { useUserContext } from "../context/user-provider";
import { useRouter } from "next/navigation";
import { useDailyEvaluation } from "../context/daily-eval-provider";
import { useSubscriptionPlans } from "../context/subscription-provider";
import { httpsCallable } from "firebase/functions";
import { useFunctions } from "reactfire";
import MediumSelector from "../medium-selector";
import moment from "moment";
import Alert from "../ui/alert";
import { toast } from "../ui/use-toast";

const DailyEvalPlans = () => {
  const { user } = useUserContext();
  const functions = useFunctions();
  const { subscriptionData } = useDailyEvaluation();
  const { dailyEvaluationPlans } = useSubscriptionPlans();
  const router = useRouter();

  const [buyingPlan, setBuyingPlan] = useState<string>("");
  const [selectedMedium, setSelectedMedium] = useState<string>("hindi");

  const filteredPlans = dailyEvaluationPlans.filter(
    (plan) => plan.medium === selectedMedium && plan.isVisible
  );

  const createTrialSubscription = async (planId: string): Promise<void> => {
    if (!user || !user.uid)
      return Alert.alert("Error", "You must be logged in to subscribe.");

    try {
      setBuyingPlan(planId);
      const result: any = await httpsCallable(
        functions,
        "createTrialSubscription"
      )({
        planId,
        userId: user.uid,
      });

      if (result?.data?.success) {
        toast({
          title: "Success",
          description: "Your trial subscription is active now",
        });
        router.push("/app");
      } else {
        Alert.alert("Error", "Please try again later");
      }
    } catch (error) {
      console.error("Error creating trial subscription:", error);
      Alert.alert(
        "Error",
        "Error occurred while creating subscription. Please try again."
      );
    } finally {
      setBuyingPlan("");
    }
  };

  const onSubscribe = async (planId: string) => {
    if (buyingPlan) return;

    if (!user) router.push("/login");

    const plan = dailyEvaluationPlans.find((plan) => plan.id == planId);
    if (plan?.isTrial) await createTrialSubscription(planId);
    else router.push(`/checkout/${planId}`);
  };

  const renderNote = () => {
    if (!subscriptionData) return null;

    const userSubMedium = subscriptionData.subInfo.medium;
    const expiryDate = moment(subscriptionData?.subscriptionExpiry);
    const isExpired = subscriptionData ? moment().isAfter(expiryDate) : true;

    return isExpired ? null : userSubMedium != selectedMedium ? (
      <p className="text-sm font-medium text-center text-[rgb(var(--destructive))] px-2">
        You are unable to purchase these plans because you currently have an
        active {subscriptionData.subInfo.medium} medium plan.
      </p>
    ) : (
      <p className="text-sm font-medium text-center text-[rgb(var(--primary-text))] px-2">
        Note: Purchasing a new plan will extend your current plan's expiry by
        the duration of the new plan.
      </p>
    );
  };

  return (
    <section className="space-y-6 mt-4 mb-8">
      <MediumSelector
        title="Daily Evaluation Plans"
        selectedMedium={selectedMedium}
        setSelectedMedium={setSelectedMedium}
      />
      <div className="container mx-auto flex justify-center">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(
            filteredPlans.length,
            3
          )} gap-6 justify-center`}
        >
          {filteredPlans.map((plan: Plan, index: number) => (
            <PlanDetail
              key={index}
              plan={plan}
              index={index}
              createTrialSubscription={createTrialSubscription}
              onSubscribe={onSubscribe}
              userSub={subscriptionData}
              buyingPlan={buyingPlan}
            />
          ))}
        </div>
      </div>
      {renderNote()}
    </section>
  );
};

export default DailyEvalPlans;
