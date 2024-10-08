"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DailyEvaluationSubscription,
  Plan,
  TestEvaluationSubscription,
} from "@/lib/types";
import { useUserContext } from "../context/user-provider";
import moment from "moment";
import Loader from "../ui/loader";
import { useDailyEvaluation } from "../context/daily-eval-provider";
import PlanBasicDetails from "./plan-basic-details";

type PlanDetailProps = {
  plan: Plan;
  index: number;
  userSub?: DailyEvaluationSubscription | TestEvaluationSubscription | null;
  createTrialSubscription: (planId: string) => Promise<void>;
  onSubscribe: (planId: string) => Promise<void>;
  buyingPlan?: string;
};

export const PlanDetail: React.FC<PlanDetailProps> = ({
  plan,
  index,
  userSub,
  createTrialSubscription,
  onSubscribe,
  buyingPlan = "",
}) => {
  const { user, isAdmin, isMentor } = useUserContext();
  const { isTrialEligible } = useDailyEvaluation();

  const expiryDate = moment(userSub?.subscriptionExpiry);
  const isExpired = userSub ? moment().isAfter(expiryDate) : true;

  const renderButton = () => {
    if (!user)
      return (
        <Link href="/login" className="mt-5">
          <Button
            size="lg"
            className="bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
          >
            Start Now
          </Button>
        </Link>
      );

    if (isAdmin)
      return (
        <Link
          href={`/admin/subscriptions/add-new?id=${plan.id}`}
          className="mt-5"
        >
          <Button
            size="lg"
            className="mt-5 bg-[rgb(var(--edit))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--edit-foreground))]"
          >
            Edit
          </Button>
        </Link>
      );

    if (isMentor) return null;

    if (!plan.openForAdmission)
      return (
        <Button size="lg" className="mt-5 bg-gray-300 text-gray-600" disabled>
          Not Taking New Admissions
        </Button>
      );

    if (!plan.seatsLeft)
      return (
        <Button size="lg" className="mt-5 bg-gray-300 text-gray-600" disabled>
          No Seats Available
        </Button>
      );

    if (plan.isTrial) {
      return isTrialEligible ? (
        buyingPlan == plan.id ? (
          <Loader />
        ) : (
          <Button
            size="lg"
            className={`mt-5 bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]`}
            onClick={() => createTrialSubscription(plan.id)}
          >
            Subscribe
          </Button>
        )
      ) : null;
    }

    if (
      userSub?.subInfo?.medium &&
      userSub.subInfo.medium != plan.medium &&
      !isExpired
    )
      return null;

    return (
      <Button
        size="lg"
        className={`mt-5 bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]`}
        onClick={() => onSubscribe(plan.id)}
      >
        Subscribe
      </Button>
    );
  };

  return (
    <div
      key={index}
      className="flex flex-col items-center bg-[rgb(var(--card))] shadow-md border border-[rgb(var(--border))] p-8 rounded-xl w-full max-w-lg"
    >
      <PlanBasicDetails plan={plan} />
      {userSub?.subscriptionPlan === plan.id ? (
        <div className="text-center">
          <h1 className={isExpired ? "text-destructive" : "text-primary"}>
            {isExpired ? "Plan Expired" : "Current Plan"}
          </h1>
          <p className="font-light text-[rgb(var(--muted-foreground))]">
            {isExpired
              ? `Expired on - ${expiryDate.format("ll")}`
              : `Valid till - ${expiryDate.format("ll")}`}
          </p>
        </div>
      ) : null}
      {renderButton()}
    </div>
  );
};
