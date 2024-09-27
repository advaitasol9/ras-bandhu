import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SubmitAnswerButton = () => {
  return (
    <Link href="/app/daily-evaluations/submit-answer">
      <Button
        className="w-40 h-40 bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] flex flex-col items-center justify-center rounded-lg hover:bg-[rgb(var(--primary-foreground))] transition duration-300 ease-in-out"
        size="lg"
      >
        <div className="flex flex-col items-center">
          <div className="bg-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))] text-[rgb(var(--primary))] p-4 rounded-full mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <span className="mt-2 text-[rgb(var(--button-text))] font-medium">
            Submit Answer
          </span>
        </div>
      </Button>
    </Link>
  );
};

export default SubmitAnswerButton;
