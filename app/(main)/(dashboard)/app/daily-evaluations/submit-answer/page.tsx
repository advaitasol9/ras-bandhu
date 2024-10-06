"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/components/context/user-provider";
import { useFirestore, useStorage } from "reactfire";
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useDailyEvaluation } from "@/components/context/daily-eval-provider";

interface FileObject {
  type: string;
  name: string;
  file: File;
}

const SubmitAnswerForm: React.FC = () => {
  const [selectedPaper, setSelectedPaper] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [numberOfAnswers, setNumberOfAnswers] = useState<number>(1);
  const [studentComment, setStudentComment] = useState<string>("");
  const [containsPyq, setContainsPyq] = useState<string>("");
  const [files, setFiles] = useState<FileObject[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { user, appData, userData } = useUserContext();
  const { hasActiveSubscription, subscriptionData } = useDailyEvaluation();
  const papers = Object.keys(appData?.subjectsByPaper || {}).sort();
  const subjects = selectedPaper
    ? appData?.subjectsByPaper?.[selectedPaper]
    : [];
  const creditsRemaining = subscriptionData?.creditsRemaining || 0;
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files?.[0];
    if (!newFile) return;

    const isPdf = newFile.type === "application/pdf";

    // Prevent adding more files if a PDF is already uploaded
    if (isPdf && files.length > 0) {
      alert("You cannot upload a PDF when images are already selected.");
      return;
    }

    // Prevent adding more images if a PDF is already uploaded
    if (!isPdf && files.some((file) => file.type === "application/pdf")) {
      alert("You cannot upload images when a PDF is already selected.");
      return;
    }

    // Restrict to only one PDF
    if (isPdf && files.some((file) => file.type === "application/pdf")) {
      alert("Only one PDF can be uploaded.");
      return;
    }

    setFiles([
      ...files,
      { type: newFile.type, name: newFile.name, file: newFile },
    ]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!subscriptionData || !hasActiveSubscription)
      return alert("You don't have an active subscription");
    if (!creditsRemaining) return alert("You have 0 credits left");
    if (creditsRemaining < numberOfAnswers)
      return alert(
        `You can submit a maximum of ${creditsRemaining} questions.`
      );
    if (!selectedPaper) return alert("Select paper");
    if (!selectedSubject) return alert("Select subject");
    if (!numberOfAnswers || numberOfAnswers < 0)
      return alert("Enter valid number of answers you are submitting");
    if (!files.length) return alert("Please select images/pdf to upload");
    if (!containsPyq)
      return alert("Please select if question is from Daily Question Bank");

    setIsSubmitting(true);

    try {
      const submissionRef = doc(collection(firestore, "DailyEvalRequests"));
      const submissionId = submissionRef.id;
      const namePrefix = userData.name.replace(" ", "-");

      // Upload files to Firebase Storage with correct naming convention
      const fileUploadPromises = files.map(async (fileObj, index) => {
        const fileExtension = fileObj.file.name.split(".").pop();
        const fileName =
          fileObj.type === "application/pdf"
            ? `${namePrefix}_${submissionId}.pdf`
            : `${namePrefix}_${submissionId}-${String.fromCharCode(
                97 + index
              )}.${fileExtension}`;

        const fileRef = ref(
          storage,
          `daily-eval-requests/${submissionId}/${fileName}`
        );

        await uploadBytes(fileRef, fileObj.file);
        const downloadUrl = await getDownloadURL(fileRef);
        return {
          name: fileName,
          url: downloadUrl,
          type: fileObj.type,
        };
      });

      // Wait for all file uploads to complete and get their URLs
      const uploadedFiles = await Promise.all(fileUploadPromises);

      // Now create the document in Firestore with all data including the uploaded files
      await setDoc(submissionRef, {
        userId: user?.uid,
        type: selectedPaper,
        paper: selectedPaper,
        subject: selectedSubject,
        medium: subscriptionData.subInfo.medium,
        studentComment,
        numberOfAnswers,
        containsPyq,
        files: uploadedFiles,
        status: "Pending",
        createdAt: moment().toISOString(),
      });

      // Reset form fields
      setFiles([]);
      setSelectedSubject("");
      setNumberOfAnswers(0);
      setContainsPyq("no");
      router.push("/app");
    } catch (error) {
      console.error("Error uploading files and creating document: ", error);
      alert("There was an error processing your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h1 className="text-2xl font-semibold mb-8 text-[rgb(var(--primary-text))]">
        Submit Answer
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-[rgb(var(--card))] p-8 rounded-lg shadow-lg space-y-6"
      >
        <div>
          <label
            htmlFor="paper"
            className="block text-sm font-medium text-[rgb(var(--primary-text))]"
          >
            Paper
          </label>
          <select
            id="paper"
            value={selectedPaper}
            onChange={(e) => setSelectedPaper(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-[rgb(var(--input))] rounded-md shadow-sm focus:outline-none focus:ring-[rgb(var(--primary))] focus:border-[rgb(var(--primary))] sm:text-sm"
          >
            <option value="">Select Paper</option>
            {papers.map((paper: string, ind: number) => (
              <option value={paper} key={`${ind}`}>
                {paper}
              </option>
            ))}
          </select>
        </div>

        {!!selectedPaper && (
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-[rgb(var(--primary-text))]"
            >
              Subject
            </label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-[rgb(var(--input))] rounded-md shadow-sm focus:outline-none focus:ring-[rgb(var(--primary))] focus:border-[rgb(var(--primary))] sm:text-sm"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject: any, ind: number) => (
                <option value={subject.code} key={`${ind}`}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="numberOfAnswers"
            className="block text-sm font-medium text-[rgb(var(--primary-text))]"
          >
            No. of answers submitted
          </label>
          <input
            type="number"
            id="numberOfAnswers"
            value={numberOfAnswers}
            onChange={(e) => setNumberOfAnswers(parseInt(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-[rgb(var(--input))] rounded-md shadow-sm focus:outline-none focus:ring-[rgb(var(--primary))] focus:border-[rgb(var(--primary))] sm:text-sm bg-[rgb(var(--input))]"
          />
        </div>

        <div>
          <label
            htmlFor="studentComment"
            className="block text-sm font-medium text-[rgb(var(--primary-text))]"
          >
            Comment
          </label>
          <textarea
            className="w-full border border-[rgb(var(--input))] rounded-md p-2 mb-4"
            placeholder="Enter comment"
            value={studentComment}
            onChange={(e) => setStudentComment(e.target.value)}
            rows={4}
          />
        </div>

        {/* File Upload */}
        <div className="border-dashed border-2 border-[rgb(var(--input))] rounded-lg p-4">
          {files.some((file) => file.type === "application/pdf") ? null : (
            <label htmlFor="fileUpload" className="cursor-pointer">
              <input
                id="fileUpload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf"
              />
              <div className="flex flex-col items-center">
                <div className="bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] p-4 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
                  Add Image/PDF
                </p>
              </div>
            </label>
          )}

          <div className="flex flex-row space-x-4 mt-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative border border-[rgb(var(--input))] rounded-lg"
              >
                {file.type === "application/pdf" ? (
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <img
                      src="/pdf_icon.svg"
                      alt="PDF Icon"
                      className="w-16 h-16 mb-2"
                    />
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {file.name}
                    </p>
                  </div>
                ) : (
                  <img
                    src={URL.createObjectURL(file.file)}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-0 right-0 bg-[rgb(var(--destructive))] text-[rgb(var(--button-text))] rounded-full px-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--primary-text))]">
            Is this from Daily Question Bank
          </label>
          <div className="mt-2 space-x-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="containsPyq"
                value="yes"
                checked={containsPyq === "yes"}
                onChange={(e) => setContainsPyq(e.target.value)}
                className="form-radio focus:ring-[rgb(var(--primary))] focus:border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
              />
              <span className="ml-2 text-[rgb(var(--primary-text))]">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="containsPyq"
                value="no"
                checked={containsPyq === "no"}
                onChange={(e) => setContainsPyq(e.target.value)}
                className="form-radio focus:ring-[rgb(var(--primary))] focus:border-[rgb(var(--primary))] text-[rgb(var(--primary))]"
              />
              <span className="ml-2 text-[rgb(var(--primary-text))]">No</span>
            </label>
          </div>
        </div>

        <div>
          <Button
            size="lg"
            type="submit"
            className="w-full bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Answer"}
          </Button>
        </div>

        <div className="mt-4 p-4 border-t border-[rgb(var(--input))] text-sm text-[rgb(var(--muted-foreground))]">
          <p>
            <strong>Note:</strong>
          </p>
          <ul className="list-disc pl-5">
            <li>Upload multiple images or a single PDF</li>
            <li>
              Please note that handwriting mismatch from previously submitted
              answers will lead to subscription being cancelled without any
              refund
            </li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default SubmitAnswerForm;
