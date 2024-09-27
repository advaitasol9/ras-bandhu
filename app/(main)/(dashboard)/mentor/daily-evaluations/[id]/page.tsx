"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useFirestore, useStorage } from "reactfire";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUserContext } from "@/components/context/user-provider";
import SubmissionDetails from "@/components/answer-detail/submission-details";
import FeedbackSection from "@/components/answer-detail/feedback-section";
import MentorInput from "@/components/answer-detail/mentor-input";
import MentorRoute from "../../mentor-route";
import { Evaluation } from "@/lib/types";

// Main Component
const MyAnswerDetail = () => {
  const params = useParams();
  const id: any = params?.id || "";
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUserContext();

  const [submissionData, setSubmissionData] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);

  // Fetch submission data on load
  useEffect(() => {
    if (!id || !user) return;
    const submissionRef = doc(firestore, "DailyEvalRequests", id);

    const unsubscribe = onSnapshot(submissionRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as Evaluation;
        setSubmissionData({ ...data, id });
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
      const fileRef = ref(storage, `feedback/${id}/${file.name}`);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      uploadedImageUrls.push(downloadUrl);
    }
    return uploadedImageUrls;
  };

  // Submit feedback along with attachments
  const handleReviewSubmit = async () => {
    if (!feedback || !id || hasGivenFeedback) return;

    try {
      const imageUrls = await uploadFeedbackImages();
      const submissionRef = doc(firestore, "DailyEvalRequests", id);
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
  };

  if (loading) return <div>Loading...</div>;

  if (!submissionData) return <div>No submission data found</div>;

  const isEvaluated = submissionData.status === "Evaluated";

  return (
    <MentorRoute>
      <div className="container mx-auto mt-12">
        <h1 className="text-2xl font-semibold mb-8">Answer Details</h1>

        <SubmissionDetails
          submissionData={submissionData}
          handleDownload={handleDownload}
        />

        <MentorInput
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
            isMentor={true}
            handleDownload={handleDownload}
          />
        )}
      </div>
    </MentorRoute>
  );
};

export default MyAnswerDetail;
