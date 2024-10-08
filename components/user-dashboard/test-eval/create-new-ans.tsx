import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SubmitAnswerButton from "../submit-ans-buttons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DailyEvaluationSubscription,
  TestEvaluationSubscription,
} from "@/lib/types";

const CreateNewAns = ({
  hasActiveSubscription,
  subscriptionData,
}: {
  hasActiveSubscription: boolean;
  subscriptionData: DailyEvaluationSubscription | TestEvaluationSubscription;
}) => {
  return (
    <Card className="col-span-3 flex flex-col items-center bg-[rgb(var(--background))] text-[rgb(var(--primary-text))]">
      <CardHeader>
        <CardTitle>
          {hasActiveSubscription ? "Create New" : "No Active Subscription"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasActiveSubscription ? (
          <div>
            {subscriptionData?.creditsRemaining ? (
              <SubmitAnswerButton
                title="Submit Test"
                linkTo="/app/test-evaluations/submit-answer"
              />
            ) : (
              <Link href="/test-evaluation">
                <Button size="lg" variant="link" className="text-base">
                  Buy Credits &rarr;
                </Button>
              </Link>
            )}
            <p className="mt-2 text-center text-[rgb(var(--primary-text))]">
              {subscriptionData?.creditsRemaining || 0} credits remaining
            </p>
          </div>
        ) : (
          <Link href="/test-evaluation">
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
