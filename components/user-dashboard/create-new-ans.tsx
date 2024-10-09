import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SubmitAnswerButton from "./submit-ans-buttons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DailyEvaluationSubscription,
  TestEvaluationSubscription,
} from "@/lib/types";

const CreateNewAns = ({
  title = "",
  linkTo = "",
  hasActiveSubscription,
  subscriptionData,
  showBuyButton = false,
}: {
  title: string;
  linkTo: string;
  hasActiveSubscription: boolean;
  subscriptionData: DailyEvaluationSubscription | TestEvaluationSubscription;
  showBuyButton?: boolean;
}) => {
  return (
    <Card className="col-span-3 flex flex-col items-center bg-background text-primary-text">
      <CardHeader>
        <CardTitle>
          {hasActiveSubscription ? "Create New" : "No Active Subscription"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasActiveSubscription ? (
          <div>
            {!!subscriptionData?.creditsRemaining && (
              <SubmitAnswerButton title={title} linkTo={linkTo} />
            )}
            <p className="mt-2 text-center text-primary-text">
              {subscriptionData?.creditsRemaining || 0} credits remaining
            </p>
            {showBuyButton && (
              <Link href="/test-evaluation">
                <Button size="lg" variant="link" className="text-base">
                  Buy Credits &rarr;
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Link href="/daily-evaluation">
            <Button size="lg" variant="link">
              View Evaluation Plans &rarr;
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateNewAns;
