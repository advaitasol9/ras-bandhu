import { Plan } from "@/lib/types";
import React from "react";
import { FaCheck } from "react-icons/fa";

const PlanBasicDetails = ({ plan }: { plan: Plan }) => {
  return (
    <>
      {/* Plan Name */}
      <h3 className="font-semibold text-xl mb-4 text-primary-text">
        {plan.name}
      </h3>

      {/* Highlighting Medium */}
      <div className="mb-8">
        <span className="bg-[#468585] text-button-text px-4 py-2 rounded-lg text-sm font-semibold tracking-wide shadow-sm">
          {plan.medium === "english" ? "English Medium" : "Hindi Medium"}
        </span>
      </div>

      {/* Features List */}
      <ul className="text-left space-y-2 mb-6 text-muted-foreground">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center">
            <FaCheck className="w-4 h-4 text-primary mr-2" />
            {feature}
          </li>
        ))}
      </ul>

      {!!plan.openForAdmission && (
        <div className="text-left mb-6 space-y-2 p-1 px-2 bg-accent rounded-md shadow-inner">
          <p className="text-sm  font-normal text-primary-text">
            Seats Left:
            <span
              className={`ml-1 font-bold ${
                plan.seatsLeft > 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {plan.seatsLeft}
            </span>
          </p>
        </div>
      )}

      {/* Pricing Details */}
      <div className="text-center mb-6">
        {plan.discountedPrice && plan.discountedPrice < plan.price ? (
          <>
            <p className="text-3xl font-extrabold text-primary-text">
              ₹ {plan.discountedPrice}
            </p>
            <p className="text-xl font-bold text-muted-foreground line-through">
              ₹ {plan.price}
            </p>
          </>
        ) : (
          <p className="text-3xl font-extrabold text-primary-text">
            ₹ {plan.price}
          </p>
        )}
      </div>
    </>
  );
};

export default PlanBasicDetails;
