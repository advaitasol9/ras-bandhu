"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useFirestore, useStorage } from "reactfire";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUserContext } from "@/components/context/user-provider";
import SubmissionDetails from "@/components/answer-detail/test-eval/submission-details";
import FeedbackSection from "@/components/answer-detail/feedback-section";
import MentorInput from "@/components/answer-detail/test-eval/mentor-input";
import MentorRoute from "../../mentor-route";
import MentorEvaluation from "@/components/answer-detail/mentor-evaluation";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { TestEvaluation } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

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
      const submissionRef = doc(firestore, "TestEvalRequests", id);
      await updateDoc(submissionRef, {
        review: {
          rating,
          feedback,
          feedbackImages: imageUrls,
        },
      });
      setHasGivenFeedback(true);
      toast({ title: "Success", description: "Review submitted!" });
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;

  if (!submissionData)
    return <div className="text-center">No submission data found</div>;

  const isEvaluated = submissionData.status === "Evaluated";

  return (
    <MentorRoute>
      <div className="container mx-auto mt-12">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Answer Details</h1>
          <p className="text-[rgb(var(--primary-text))] font-normal ml-2 pt-1">
            (ID: {submissionData.id})
          </p>
        </div>
        <Link
          href={`/user-info?userId=${submissionData.userId}`}
          className="flex items-center mb-4"
        >
          View Previos Submissions{" "}
          <FaArrowRight className="w-3 h-3 hover:opacity-80 transition ml-1" />
        </Link>

        <SubmissionDetails
          submissionData={submissionData}
          handleDownload={handleDownload}
        />

        {submissionData.status == "Pending" ||
        user?.uid == submissionData.mentorAssigned ? (
          <MentorInput
            submissionData={submissionData}
            handleDownload={handleDownload}
          />
        ) : (
          <MentorEvaluation
            submissionData={submissionData}
            handleDownload={handleDownload}
          />
        )}

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
