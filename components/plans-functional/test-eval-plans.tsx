"use client";

import React, { useState } from "react";
import { PlanDetail } from "../plans-static/daily-eval-plan-info";
import { Plan } from "@/lib/types";
import { useUserContext } from "../context/user-provider";
import { useRouter } from "next/navigation";
import { useTestEvaluation } from "../context/test-eval-provider";
import { useSubscriptionPlans } from "../context/subscription-provider";
import MediumSelector from "../medium-selector";
import moment from "moment";

const TestEvalPlans = () => {
  const { user } = useUserContext();
  const { subscriptionData } = useTestEvaluation();
  const { testEvaluationPlans } = useSubscriptionPlans();
  const router = useRouter();

  const [selectedMedium, setSelectedMedium] = useState<string>("hindi");

  const filteredPlans = testEvaluationPlans.filter(
    (plan) => plan.medium === selectedMedium && plan.isVisible
  );

  const createTrialSubscription = async (planId: string): Promise<void> => {};

  const onSubscribe = async (planId: string) => {
    if (!user) router.push("/login");
    router.push(`/checkout/${planId}`);
  };

  const renderNote = () => {
    if (!subscriptionData) return null;

    const userSubMedium = subscriptionData.subInfo.medium;
    const expiryDate = moment(subscriptionData?.subscriptionExpiry);
    const isExpired = subscriptionData ? moment().isAfter(expiryDate) : true;

    return isExpired ? null : userSubMedium != selectedMedium ? (
      <p className="text-sm font-medium text-center text-destructive px-2">
        You are unable to purchase these plans because you currently have an
        active {subscriptionData.subInfo.medium} medium plan.
      </p>
    ) : (
      <p className="text-sm font-medium text-center text-primary-text px-2">
        Note: Purchasing a new plan will add credits to your existing balance.
        Expiry will extend if the new plan offers a longer duration.
      </p>
    );
  };

  return (
    <section className="space-y-6 mt-4 mb-8">
      <MediumSelector
        title="Test Evaluation Plans"
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
            />
          ))}
        </div>
      </div>
      {renderNote()}
    </section>
  );
};

export default TestEvalPlans;
