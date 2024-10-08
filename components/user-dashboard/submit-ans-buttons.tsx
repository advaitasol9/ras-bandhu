import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaPlus } from "react-icons/fa"; // Import the Plus icon from react-icons

const SubmitAnswerButton = ({ title = "", linkTo = "" }) => {
  return (
    <Link href={linkTo}>
      <Button
        className="w-40 h-40 bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] flex flex-col items-center justify-center rounded-lg hover:bg-[rgb(var(--primary-foreground))] transition duration-300 ease-in-out"
        size="lg"
      >
        <div className="flex flex-col items-center">
          <div className="bg-[rgb(var(--button-text))] text-[rgb(var(--primary))] p-4 rounded-full mb-2">
            {/* Replaced with react-icons */}
            <FaPlus className="h-8 w-8" />
          </div>
          <span className="mt-2 text-[rgb(var(--button-text))] font-medium">
            {title}
          </span>
        </div>
      </Button>
    </Link>
  );
};

export default SubmitAnswerButton;
