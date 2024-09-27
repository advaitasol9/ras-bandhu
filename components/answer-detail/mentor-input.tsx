import React, { useState, useEffect } from "react";
import { useFirestore, useStorage } from "reactfire";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUserContext } from "@/components/context/user-provider";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import moment from "moment";
import { Evaluation } from "@/lib/types";

const MentorInput = ({
  submissionData,
  handleDownload,
}: {
  submissionData: Evaluation;
  handleDownload: (url: string) => void;
}) => {
  const { user } = useUserContext();
  const firestore = useFirestore();
  const storage = useStorage();

  const [mentorComments, setMentorComments] = useState(
    submissionData.mentorComments || ""
  );
  const [evaluationFile, setEvaluationFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const isDocumentValid = evaluationFile?.name
    ? evaluationFile.name.includes(submissionData.id)
    : true;

  useEffect(() => {
    setMentorComments(submissionData.mentorComments || "");
  }, [submissionData]);

  const handleAssignToMentor = async () => {
    if (submissionData.status !== "Pending") return;
    const submissionRef = doc(
      firestore,
      "DailyEvalRequests",
      submissionData.id
    );
    await updateDoc(submissionRef, {
      mentorAssigned: user?.uid,
      assignedAt: moment().toISOString(),
      status: "Assigned",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.files &&
      e.target.files.length &&
      e.target.files[0]?.type === "application/pdf"
    ) {
      setEvaluationFile(e.target.files[0]);
    } else {
      alert("Only PDF files are allowed.");
    }
  };

  const handleSubmit = async () => {
    if (!mentorComments || !evaluationFile) {
      alert("Please provide comments and upload the evaluation PDF.");
      return;
    }

    if (!isDocumentValid) {
      return alert("Upload a valid PDF.");
    }

    setIsSubmitting(true);

    try {
      // Upload evaluation PDF to Firebase Storage
      const fileRef = ref(
        storage,
        `daily-eval-requests/${submissionData.id}/mentor/${evaluationFile.name}`
      );
      const snapshot = await uploadBytes(fileRef, evaluationFile);
      const evaluationUrl = await getDownloadURL(snapshot.ref);

      // Update Firestore document
      const submissionRef = doc(
        firestore,
        "DailyEvalRequests",
        submissionData.id
      );
      await updateDoc(submissionRef, {
        mentorComments,
        mentorEvaluationUrl: evaluationUrl,
        evaluatedAt: moment().toISOString(),
        status: "Evaluated",
      });

      alert("Evaluation submitted successfully!");
    } catch (error) {
      console.error("Error submitting evaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      const submissionRef = doc(
        firestore,
        "DailyEvalRequests",
        submissionData.id
      );
      await updateDoc(submissionRef, {
        status: "Rejected",
        rejectReason,
        rejectedAt: moment().toISOString(),
      });

      alert("Submission rejected successfully.");
      setShowRejectReason(false);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting submission:", error);
    }
  };

  return (
    <div className="container mx-auto my-8 bg-[rgb(var(--muted))] p-6 rounded-lg">
      <h1 className="text-2xl font-semibold text-[rgb(var(--primary-text))]">
        Submit or Edit Evaluation
      </h1>
      {submissionData.status !== "Evaluated" && (
        <p className="text-md text-[rgb(var(--primary-text))] mt-1">
          Time remaining:{" "}
          {Math.max(
            0,
            48 - moment().diff(moment(submissionData.createdAt), "hours")
          )}{" "}
          hours
        </p>
      )}

      {/* Mentor Actions */}
      {submissionData.status === "Pending" && (
        <Button
          onClick={handleAssignToMentor}
          className="my-4 bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
        >
          Assign to Me
        </Button>
      )}

      {(submissionData.status === "Assigned" ||
        submissionData.status === "Evaluated") && (
        <div className="bg-[rgb(var(--muted-foreground))]/10 p-4 rounded-md">
          {!!submissionData?.mentorEvaluationUrl && (
            <div className="flex flex-col items-center mb-8">
              <div className="flex flex-col items-center">
                <Image
                  src="/pdf_icon.svg"
                  alt="PDF Icon"
                  width={100}
                  height={100}
                />
                <Button
                  className="mt-4 bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
                  onClick={() =>
                    handleDownload(submissionData?.mentorEvaluationUrl || "")
                  }
                >
                  Download Evaluated PDF
                </Button>
              </div>
            </div>
          )}

          {/* Mentor Comments */}
          <textarea
            className="w-full border border-[rgb(var(--input))] rounded-md p-2 mb-4"
            placeholder="Enter mentor comments"
            value={mentorComments}
            onChange={(e) => setMentorComments(e.target.value)}
            rows={4}
          />

          {/* Evaluation File Upload */}
          <div className="mb-4">
            <label
              htmlFor="fileUpload"
              className="block mb-2 text-[rgb(var(--primary-text))]"
            >
              Upload Evaluated PDF
            </label>
            <input
              type="file"
              id="fileUpload"
              accept="application/pdf"
              onChange={handleFileChange}
              className="text-[rgb(var(--primary-text))]"
            />
            {!isDocumentValid && (
              <p className="text-sm text-[rgb(var(--destructive))] mt-1">
                Please verify that you have uploaded the correct PDF. The name
                on the document does not match the document ID.
              </p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
          >
            {isSubmitting ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </div>
      )}

      {submissionData.status === "Evaluated" && (
        <div className="p-4 bg-[rgb(var(--green))]/10 rounded-md mt-4 text-[rgb(var(--primary-text))]">
          <p>
            This submission has been evaluated. You can still edit your comments
            or replace the PDF.
          </p>
        </div>
      )}

      {/* Reject Submission */}
      {submissionData.status !== "Evaluated" &&
        submissionData.status !== "Rejected" && (
          <div className="mt-2">
            {!showRejectReason ? (
              <Button
                onClick={() => setShowRejectReason(true)}
                className="bg-[rgb(var(--destructive))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--destructive-foreground))]"
              >
                Reject
              </Button>
            ) : (
              <div>
                <textarea
                  className="w-full border border-[rgb(var(--input))] rounded-md p-2 mb-4"
                  placeholder="Enter reason for rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleReject}
                  className="bg-[rgb(var(--destructive))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--destructive-foreground))] mb-2"
                >
                  Submit Rejection
                </Button>
                <Button
                  onClick={() => setShowRejectReason(false)}
                  className="bg-[rgb(var(--muted))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--muted-foreground))]"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

      {/* Rejection Status */}
      {submissionData.status === "Rejected" && (
        <div className="p-4 rounded-md mt-4 text-[rgb(var(--destructive))]">
          <p>
            This submission was rejected. Reason:{" "}
            <span className="font-semibold">{submissionData.rejectReason}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default MentorInput;
