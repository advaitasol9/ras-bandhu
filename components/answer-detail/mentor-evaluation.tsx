import React from "react";
import { Button } from "@/components/ui/button";
import { Evaluation, TestEvaluation } from "@/lib/types";

const MentorEvaluation = ({
  submissionData,
  handleDownload,
}: {
  submissionData: Evaluation | TestEvaluation;
  handleDownload: (url: string) => void;
}) =>
  submissionData.status === "Evaluated" ? (
    <div className="p-4 bg-muted rounded-md mb-8">
      <h3 className="text-lg font-semibold mb-2 text-primary-text">
        Evaluator's comments
      </h3>
      <p className="text-primary-text">
        {submissionData.mentorComments || "No comments from the mentor."}
      </p>
      <Button
        className="mt-4 bg-primary text-button-text hover:bg-primary-foreground"
        onClick={() => handleDownload(submissionData.mentorEvaluationUrl || "")}
      >
        Download Evaluated PDF
      </Button>
    </div>
  ) : null;

export default MentorEvaluation;
