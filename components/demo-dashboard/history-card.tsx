import React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Evaluation } from "@/lib/types";

interface Card {
  item: Evaluation;
  index: number;
  linkTo: string | null;
}

const HistoryCard = ({ item, index, linkTo }: Card) => {
  return (
    <Link key={index} href={linkTo || ""} passHref legacyBehavior>
      <a className="block bg-[rgb(var(--card))] py-4 px-2 md:px-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center">
          <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border border-[rgb(var(--border))]">
            <p className="text-[rgb(var(--primary-text))]">{item.subject}</p>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none text-[rgb(var(--primary-text))]">
              {item.id}
            </p>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              {new Date(item.createdAt).toLocaleDateString()}{" "}
              {new Date(item.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div
            className={`ml-auto text-sm md:text-base font-medium mt-4 ${
              item.status === "Evaluated"
                ? "text-[rgb(var(--primary))]"
                : item.status === "Assigned"
                ? "text-[rgb(var(--edit))]"
                : item.status === "Pending"
                ? "text-[rgb(var(--primary-text))]"
                : "text-[rgb(var(--destructive))]"
            }`}
          >
            {item.status}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-[rgb(var(--primary-text))]">
            {item.type === "Test"
              ? "Test"
              : `No of Questions: ${item.numberOfAnswers}`}
          </p>
        </div>
      </a>
    </Link>
  );
};

export default HistoryCard;
