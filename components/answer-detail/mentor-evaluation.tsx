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
    <div className="p-4 bg-[rgb(var(--muted))] rounded-md mb-8">
      <h3 className="text-lg font-semibold mb-2 text-[rgb(var(--primary-text))]">
        Evaluator's comments
      </h3>
      <p className="text-[rgb(var(--primary-text))]">
        {submissionData.mentorComments || "No comments from the mentor."}
      </p>
      <Button
        className="mt-4 bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
        onClick={() => handleDownload(submissionData.mentorEvaluationUrl || "")}
      >
        Download Evaluated PDF
      </Button>
    </div>
  ) : null;

export default MentorEvaluation;
