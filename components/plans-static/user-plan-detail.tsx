import React from "react";
import {
  DailyEvaluationSubscription,
  TestEvaluationSubscription,
} from "@/lib/types";
import moment from "moment";
import { FaCheck } from "react-icons/fa";

type PlanDetailProps = {
  subscriptionData: DailyEvaluationSubscription | TestEvaluationSubscription;
  index: number;
};

export const UserPlanDetail: React.FC<PlanDetailProps> = ({
  subscriptionData,
  index,
}) => {
  const plan = subscriptionData.subInfo;
  const expiryDate = moment(subscriptionData.subscriptionExpiry);
  const isExpired = moment().isAfter(expiryDate);

  return (
    <div
      key={index}
      className="flex flex-col items-center bg-card shadow-md border border-edge p-8 rounded-xl w-full max-w-lg"
    >
      <h3 className="font-semibold text-xl mb-4 text-primary-text">
        {plan.name}
      </h3>

      <div className="mb-8">
        <span className="bg-[#468585] text-button-text px-4 py-2 rounded-lg text-sm font-semibold tracking-wide shadow-sm">
          {plan.medium === "english" ? "English Medium" : "Hindi Medium"}
        </span>
      </div>

      <ul className="text-left space-y-2 mb-6 text-muted-foreground">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center">
            <FaCheck className="w-4 h-4 text-primary mr-2" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="text-center mb-6">
        <p className="text-3xl font-extrabold text-primary-text">
          ₹ {plan.price}
        </p>
      </div>

      <div className="text-center mt-4">
        <h1 className={isExpired ? "text-destructive" : "text-primary"}>
          {isExpired ? "Plan Expired" : "Current Plan"}
        </h1>
        <p className="font-light text-muted-foreground">
          {isExpired
            ? `Expired on - ${expiryDate.format("ll")}`
            : `Valid till - ${expiryDate.format("ll")}`}
        </p>
      </div>
    </div>
  );
};
