import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Star } from "lucide-react";
import { Evaluation, TestEvaluation } from "@/lib/types";

// FeedbackSection Component
const FeedbackSection = ({
  submissionData,
  rating,
  setRating,
  feedback,
  setFeedback,
  handleFileChange,
  handleReviewSubmit,
  hasGivenFeedback,
  isMentor,
  handleDownload,
}: {
  submissionData: Evaluation | TestEvaluation;
  rating: number;
  setRating: (val: number) => void;
  feedback: string;
  setFeedback: (val: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReviewSubmit: () => void;
  hasGivenFeedback: boolean;
  isMentor: boolean;
  handleDownload: (url: string) => void;
}) =>
  isMentor && !hasGivenFeedback ? null : (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-primary-text">
        {hasGivenFeedback
          ? isMentor
            ? "Student's Feedback"
            : "Your Feedback on Evaluation"
          : "Tell us if you have any doubts or feedback"}
      </h2>

      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`cursor-pointer ${
              index < rating
                ? "text-yellow-300"
                : rating
                ? "text-muted"
                : "text-muted-foreground"
            }`}
            onClick={() => !hasGivenFeedback && setRating(index + 1)}
          />
        ))}
      </div>

      {hasGivenFeedback ? (
        <>
          <div className="bg-muted p-4 rounded-md">
            <p className="text-primary-text">{feedback}</p>
          </div>

          {/* Display feedback images */}
          {submissionData.review?.feedbackImages && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {submissionData.review.feedbackImages.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Feedback Image ${index + 1}`}
                  width={200}
                  height={200}
                  className="object-contain rounded-md cursor-pointer"
                  onClick={() => handleDownload(url)}
                />
              ))}
            </div>
          )}
        </>
      ) : isMentor ? null : (
        <>
          <textarea
            className="w-full border border-input rounded-md p-2"
            placeholder="Tell us how you liked the evaluation"
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          {/* File Upload for Feedback */}
          <div className="mt-4">
            <label
              htmlFor="fileUpload"
              className="block mb-2 text-primary-text"
            >
              Attach Photos (optional)
            </label>
            <input
              type="file"
              id="fileUpload"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="bg-input"
            />
          </div>

          <Button
            className="mt-4 bg-primary text-button-text hover:bg-primary-foreground"
            onClick={handleReviewSubmit}
          >
            Submit Review
          </Button>
        </>
      )}
    </div>
  );

export default FeedbackSection;
