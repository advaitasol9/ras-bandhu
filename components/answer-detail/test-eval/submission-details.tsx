import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { TestEvaluation } from "@/lib/types";

const SubmissionDetails = ({
  submissionData,
  handleDownload,
}: {
  submissionData: TestEvaluation;
  handleDownload: (url: string) => void;
}) => {
  return (
    <div className="flex flex-col items-center mb-8 space-y-6">
      <div className="text-center">
        <p className="mt-4 text-lg text-[rgb(var(--primary-text))] font-medium">
          {submissionData.paper}
        </p>
        <p className="text-[rgb(var(--primary-text))]">
          Subjects: {submissionData.subjects.join(", ")}
        </p>
        <p className="text-[rgb(var(--primary-text))]">
          Contains PYQ: {submissionData.containsPyq}
        </p>
      </div>

      <div className="flex flex-col items-center text-center">
        <Image src="/pdf_icon.svg" alt="PDF Icon" width={100} height={100} />
        <Button
          className="mt-4 bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
          onClick={() => handleDownload(submissionData.file.url)}
        >
          Download Submission
        </Button>
      </div>

      {!!submissionData?.studentComment && (
        <div className="w-full mt-4">
          <h3 className="font-medium text-lg text-[rgb(var(--primary-text))]">
            Student's Comment:
          </h3>
          <p className="text-[rgb(var(--primary-text))] mt-2">
            {submissionData.studentComment}
          </p>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetails;
