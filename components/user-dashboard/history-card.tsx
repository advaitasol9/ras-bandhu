import React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Evaluation, TestEvaluation } from "@/lib/types";
import { Star } from "lucide-react";

interface Card {
  item: Evaluation | TestEvaluation;
  index: number;
  linkTo: string | null;
}

const paperMapping: { [key: string]: string } = {
  Paper1: "P1",
  Paper2: "P2",
  Paper3: "P3",
  Paper4: "P4",
};

const HistoryCard = ({ item, index, linkTo }: Card) => {
  return (
    <Link key={index} href={linkTo || ""} passHref legacyBehavior>
      <a className="block bg-card py-4 px-2 md:px-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
        <div className="flex items-center">
          <Avatar className="flex h-9 w-9 items-center justify-center space-y-0 border border-edge">
            <p className="text-primary-text">
              {typeof item?.subject === "string"
                ? item.subject
                : paperMapping[item?.paper || ""] || "Unknown"}
            </p>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none text-primary-text">
              {item.id}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()}{" "}
              {new Date(item.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div
            className={`ml-auto text-sm md:text-base font-medium mt-4 ${
              item.status === "Evaluated"
                ? "text-primary"
                : item.status === "Assigned"
                ? "text-edit"
                : item.status === "Pending"
                ? "text-primary-text"
                : "text-destructive"
            }`}
          >
            {item.status}
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary-text">
              {item.type === "test"
                ? `Subjects: ${item.subjects?.join(", ")}`
                : `No of Questions: ${item.numberOfAnswers}`}
            </p>
            {item?.review?.rating && (
              <div className="flex items-center">
                {[...Array(item.review.rating)].map((_, index) => (
                  <Star key={index} className="text-yellow-300" />
                ))}
              </div>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
};

export default HistoryCard;
