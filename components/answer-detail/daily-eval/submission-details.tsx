import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Evaluation } from "@/lib/types";

const SubmissionDetails = ({
  submissionData,
  handleDownload,
}: {
  submissionData: Evaluation;
  handleDownload: (url: string) => void;
}) => {
  const isPdf =
    submissionData.files.length === 1 &&
    submissionData.files[0].type === "application/pdf";

  return (
    <div className="flex flex-col items-center mb-8 space-y-6">
      <div className="text-center">
        <p className="mt-4 text-lg text-primary-text font-medium">
          Subject: {submissionData.subject}
        </p>
        <p className="text-primary-text">
          No of Questions: {submissionData.numberOfAnswers}
        </p>
        <p className="text-primary-text">
          Contains DQB: {submissionData.containsPyq}
        </p>
      </div>
      {isPdf ? (
        <div className="flex flex-col items-center text-center">
          <Image src="/pdf_icon.svg" alt="PDF Icon" width={100} height={100} />
          <Button
            className="mt-4 bg-primary text-button-text hover:bg-primary-foreground"
            onClick={() => handleDownload(submissionData.files[0].url)}
          >
            Download Submission
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissionData.files.map((file, index) => (
            <Image
              key={index}
              src={file.url}
              alt={`Submission ${index + 1}`}
              width={200}
              height={200}
              className="object-contain rounded-md cursor-pointer border border-edge"
              onClick={() => handleDownload(file.url)}
            />
          ))}
        </div>
      )}

      {!!submissionData?.studentComment && (
        <div className="w-full mt-4">
          <h3 className="font-medium text-lg text-primary-text">
            Student's Comment:
          </h3>
          <p className="text-primary-text mt-2">
            {submissionData.studentComment}
          </p>
        </div>
      )}
    </div>
  );
};

export default SubmissionDetails;
