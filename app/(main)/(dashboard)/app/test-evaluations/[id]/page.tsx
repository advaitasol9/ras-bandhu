"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useFirestore, useStorage } from "reactfire";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUserContext } from "@/components/context/user-provider";
import SubmissionDetails from "@/components/answer-detail/test-eval/submission-details";
import MentorEvaluation from "@/components/answer-detail/mentor-evaluation";
import FeedbackSection from "@/components/answer-detail/feedback-section";
import { TestEvaluation } from "@/lib/types";

const SubmissionStatus = ({
  submissionData,
}: {
  submissionData: TestEvaluation;
}) => {
  const statusColors: Record<string, string> = {
    Pending: "text-[rgb(var(--edit))]",
    Rejected: "text-[rgb(var(--destructive))]",
    Assigned: "text-[rgb(var(--primary-text))]",
    Evaluated: "text-[rgb(var(--muted-foreground))]",
  };

  const statusMessage: Record<string, string> = {
    Pending: "Your submission is pending review. Please check back later.",
    Assigned:
      "Your submission has been assigned to a mentor. You will receive feedback once the evaluation is completed.",
    Evaluated: "",
  };

  return (
    <div className="p-4 rounded-md mt-4">
      {submissionData.status === "Rejected" ? (
        <p className={statusColors["Rejected"]}>
          This submission was rejected. Reason:{" "}
          <span className="font-semibold">{submissionData.rejectReason}</span>
        </p>
      ) : (
        <p className={`text-center ${statusColors[submissionData.status]}`}>
          {statusMessage[submissionData.status] || ""}
        </p>
      )}
    </div>
  );
};

// Main Component
const MyAnswerDetail = () => {
  const params = useParams();
  const id: any = params?.id || "";
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUserContext();

  const [submissionData, setSubmissionData] = useState<TestEvaluation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);

  // Fetch submission data on load
  useEffect(() => {
    if (!id || !user) return;
    const submissionRef = doc(firestore, "TestEvalRequests", id);

    const unsubscribe = onSnapshot(submissionRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as TestEvaluation;
        setSubmissionData({
          ...data,
          id,
        });
        if (data.review) {
          setHasGivenFeedback(true);
          setRating(data.review.rating);
          setFeedback(data.review.feedback);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, firestore, user]);

  const handleDownload = (url: string) => window.open(url, "_blank");

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // Upload feedback images to Firebase Storage
  const uploadFeedbackImages = async (): Promise<string[]> => {
    const uploadedImageUrls: string[] = [];
    for (const file of selectedFiles) {
      const fileRef = ref(
        storage,
        `test-eval-requests/${id}/feedback/${file.name}`
      );
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      uploadedImageUrls.push(downloadUrl);
    }
    return uploadedImageUrls;
  };

  // Submit feedback along with attachments
  const handleReviewSubmit = async () => {
    if (!id || hasGivenFeedback) return;

    if (feedback || rating) {
      try {
        const imageUrls = await uploadFeedbackImages();
        const submissionRef = doc(firestore, "TestEvalRequests", id);
        await updateDoc(submissionRef, {
          review: {
            rating,
            feedback,
            feedbackImages: imageUrls,
          },
        });
        setHasGivenFeedback(true);
        alert("Review submitted!");
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    } else {
      return alert("Enter Feedback");
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;

  if (!submissionData)
    return <div className="text-center">No submission data found</div>;

  const isEvaluated = submissionData.status === "Evaluated";

  return (
    <div className="container mx-auto mt-12">
      <h1 className="text-2xl font-semibold mb-8">Answer Details</h1>

      <SubmissionDetails
        submissionData={submissionData}
        handleDownload={handleDownload}
      />

      <MentorEvaluation
        submissionData={submissionData}
        handleDownload={handleDownload}
      />

      {isEvaluated && (
        <FeedbackSection
          submissionData={submissionData}
          rating={rating}
          setRating={setRating}
          feedback={feedback}
          setFeedback={setFeedback}
          handleFileChange={handleFileChange}
          handleReviewSubmit={handleReviewSubmit}
          hasGivenFeedback={hasGivenFeedback}
          isMentor={false}
          handleDownload={handleDownload}
        />
      )}

      {submissionData.status !== "Evaluated" && (
        <SubmissionStatus submissionData={submissionData} />
      )}
    </div>
  );
};

export default MyAnswerDetail;
