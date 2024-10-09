import React, { useState, useEffect } from "react";
import { useFirestore, useStorage } from "reactfire";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUserContext } from "@/components/context/user-provider";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import moment from "moment";
import { Evaluation } from "@/lib/types";
import Alert from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

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
      Alert.alert("Error", "Only PDF files are allowed.");
    }
  };

  const handleSubmit = async () => {
    if (!mentorComments || !evaluationFile)
      return Alert.alert(
        "Error",
        "Please provide comments and upload the evaluation PDF."
      );

    if (!isDocumentValid) return Alert.alert("Error", "Upload a valid PDF.");

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

      toast({
        title: "Success",
        description: "Evaluation submitted successfully!",
        variant: "success",
      });
    } catch (error) {
      console.error("Error submitting evaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason)
      return Alert.alert("Error", "Please provide a reason for rejection.");

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

      toast({
        title: "Success",
        description: "Submission rejected.",
      });
      setShowRejectReason(false);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting submission:", error);
    }
  };

  return (
    <div className="container mx-auto my-8 bg-muted p-6 rounded-lg">
      <h1 className="text-2xl font-semibold text-primary-text">
        Submit or Edit Evaluation
      </h1>
      {submissionData.status !== "Evaluated" && (
        <p className="text-md text-primary-text mt-1">
          Time remaining:{" "}
          {Math.max(
            0,
            24 - moment().diff(moment(submissionData.createdAt), "hours")
          )}{" "}
          hours
        </p>
      )}

      {/* Mentor Actions */}
      {submissionData.status === "Pending" && (
        <Button
          onClick={handleAssignToMentor}
          className="my-4 bg-primary text-button-text hover:bg-primary-foreground"
        >
          Assign to Me
        </Button>
      )}

      {(submissionData.status === "Assigned" ||
        submissionData.status === "Evaluated") && (
        <div className="bg-muted-foreground/10 p-4 rounded-md">
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
                  className="mt-4 bg-primary text-button-text hover:bg-primary-foreground"
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
            className="w-full border border-input rounded-md p-2 mb-4"
            placeholder="Enter mentor comments"
            value={mentorComments}
            onChange={(e) => setMentorComments(e.target.value)}
            rows={4}
          />

          {/* Evaluation File Upload */}
          <div className="mb-4">
            <label
              htmlFor="fileUpload"
              className="block mb-2 text-primary-text"
            >
              Upload Evaluated PDF
            </label>
            <input
              type="file"
              id="fileUpload"
              accept="application/pdf"
              onChange={handleFileChange}
              className="text-primary-text"
            />
            {!isDocumentValid && (
              <p className="text-sm text-destructive mt-1">
                Please verify that you have uploaded the correct PDF. The name
                on the document does not match the document ID.
              </p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-button-text hover:bg-primary-foreground"
          >
            {isSubmitting ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </div>
      )}

      {submissionData.status === "Evaluated" && (
        <div className="p-4 bg-[rgb(var(--green))]/10 rounded-md mt-4 text-primary-text">
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
                className="bg-destructive text-button-text hover:bg-destructive-foreground"
              >
                Reject
              </Button>
            ) : (
              <div>
                <textarea
                  className="w-full border border-input rounded-md p-2 mb-4"
                  placeholder="Enter reason for rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleReject}
                  className="bg-destructive text-button-text hover:bg-destructive-foreground mb-2"
                >
                  Submit Rejection
                </Button>
                <Button
                  onClick={() => setShowRejectReason(false)}
                  className="bg-muted text-button-text hover:bg-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

      {/* Rejection Status */}
      {submissionData.status === "Rejected" && (
        <div className="p-4 rounded-md mt-4 text-destructive">
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
