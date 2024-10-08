"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/components/context/user-provider";
import { useFirestore, useStorage } from "reactfire";
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useTestEvaluation } from "@/components/context/test-eval-provider";
import Alert from "@/components/ui/alert";

interface FileObject {
  type: string;
  name: string;
  file: File;
}

const SubmitAnswerForm: React.FC = () => {
  const [selectedPaper, setSelectedPaper] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [studentComment, setStudentComment] = useState<string>("");
  const [file, setFile] = useState<FileObject | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { user, appData, userData } = useUserContext();
  const { hasActiveSubscription, subscriptionData } = useTestEvaluation();
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
    if (!isPdf)
      return Alert.alert("Error", "Only PDF files are allowed for submission.");

    setFile({
      type: newFile.type,
      name: newFile.name,
      file: newFile,
    });
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubjectSelection = (subjectCode: string) => {
    if (selectedSubjects.includes(subjectCode)) {
      setSelectedSubjects(
        selectedSubjects.filter((subject) => subject !== subjectCode)
      );
    } else {
      setSelectedSubjects([...selectedSubjects, subjectCode]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!subscriptionData || !hasActiveSubscription)
      return Alert.alert("Error", "You don't have an active subscription");
    if (!creditsRemaining)
      return Alert.alert("Error", "You have 0 credits left");
    if (!selectedSubjects.length)
      return Alert.alert("Error", "Please select at least one subject.");
    if (!file)
      return Alert.alert("Error", "Please select a PDF file to upload");

    setIsSubmitting(true);

    try {
      const submissionRef = doc(collection(firestore, "TestEvalRequests"));
      const submissionId = submissionRef.id;
      const namePrefix = userData.name.replace(" ", "-");

      const fileExtension = file.file.name.split(".").pop();
      const fileName = `${namePrefix}_${submissionId}.${fileExtension}`;

      const fileRef = ref(
        storage,
        `test-eval-requests/${submissionId}/${fileName}`
      );
      await uploadBytes(fileRef, file.file);
      const downloadUrl = await getDownloadURL(fileRef);

      await setDoc(submissionRef, {
        userId: user?.uid,
        paper: selectedPaper,
        subjects: selectedSubjects,
        medium: subscriptionData.subInfo.medium,
        type: "test",
        studentComment,
        file: {
          name: fileName,
          url: downloadUrl,
          type: file.type,
        },
        status: "Pending",
        createdAt: moment().toISOString(),
      });

      setFile(null);
      setSelectedSubjects([]);
      setStudentComment("");
      router.push("/app");
    } catch (error) {
      console.error("Error uploading files and creating document: ", error);
      Alert.alert(
        "Error",
        "There was an error processing your request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h1 className="text-2xl font-semibold mb-8 text-[rgb(var(--primary-text))]">
        Submit Test Evaluation
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
            <label className="block text-sm font-medium text-[rgb(var(--primary-text))] mb-2">
              Select Subjects
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects.map((subject: any, ind: number) => (
                <label
                  key={ind}
                  className="flex items-center p-3 bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))] transition-colors duration-300 ease-in-out rounded-lg cursor-pointer border border-[rgb(var(--border))]"
                >
                  <input
                    type="checkbox"
                    value={subject.code}
                    checked={selectedSubjects.includes(subject.code)}
                    onChange={() => handleSubjectSelection(subject.code)}
                    className="form-checkbox h-5 w-5 text-[rgb(var(--primary))] border-[rgb(var(--input))] focus:ring-[rgb(var(--primary))] rounded transition duration-200"
                  />
                  <span className="ml-3 text-[rgb(var(--primary-text))] font-medium">
                    {subject.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--primary-text))]">
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
          {file ? (
            <div className="relative inline-block border border-[rgb(var(--input))] rounded-lg">
              <div className="flex flex-col items-center p-4">
                <img
                  src="/pdf_icon.svg"
                  alt="PDF Icon"
                  className="w-16 h-16 mb-2"
                />
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {file.name}
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-0 right-2 bg-[rgb(var(--destructive))] text-[rgb(var(--button-text))] rounded-full w-6 h-6 flex items-center justify-center"
              >
                &times;
              </button>
            </div>
          ) : (
            <label htmlFor="fileUpload" className="cursor-pointer">
              <input
                id="fileUpload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf"
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
                  Add PDF
                </p>
              </div>
            </label>
          )}
        </div>

        <div>
          <Button
            size="lg"
            type="submit"
            className="w-full bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </Button>
        </div>

        <div className="mt-4 p-4 border-t border-[rgb(var(--input))] text-sm text-[rgb(var(--muted-foreground))]">
          <p>
            <strong>Note:</strong>
          </p>
          <ul className="list-disc pl-5">
            <li>Upload single PDF</li>
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
