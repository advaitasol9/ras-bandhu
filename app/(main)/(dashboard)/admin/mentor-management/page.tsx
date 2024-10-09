"use client";

import React, { useState, useEffect } from "react";
import { useFirestore, useFunctions } from "reactfire";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import { useUserContext } from "@/components/context/user-provider";

const MentorManagement = () => {
  const firestore = useFirestore();
  const functions = useFunctions();
  const { appData } = useUserContext(); // Access appData containing mentors list

  const [mentors, setMentors] = useState<User[]>([]);
  const [newMentorId, setNewMentorId] = useState("");
  const [addLoading, setAddLoading] = useState(false); // Loading for adding a mentor
  const [removingMentorId, setRemovingMentorId] = useState<string | null>(null); // Track mentor being removed
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const updateMentorRole = httpsCallable(functions, "updateMentorRole");

  useEffect(() => {
    const fetchMentors = async () => {
      if (appData?.mentors && appData.mentors.length > 0) {
        try {
          const mentorDetails = await Promise.all(
            appData.mentors.map(async (mentorId: string) => {
              const mentorDocRef = doc(firestore, "Users", mentorId);
              const mentorDoc = await getDoc(mentorDocRef);
              if (mentorDoc.exists()) {
                return { id: mentorId, ...mentorDoc.data() };
              }
              return null;
            })
          );
          setMentors(mentorDetails.filter(Boolean));
        } catch (error) {
          setError("Error fetching mentor details.");
        }
      }
    };

    fetchMentors();
  }, [appData, firestore]);

  const handleAddMentor = async () => {
    if (!newMentorId) {
      setError("Please enter a valid mentor ID.");
      return;
    }

    setAddLoading(true); // Start loading only for the add button
    setError("");
    setMessage("");

    try {
      await updateMentorRole({ userId: newMentorId, action: "add" });
      setMessage("Mentor added successfully.");
      setNewMentorId(""); // Clear input
      setMentors((prevMentors) => [
        ...prevMentors,
        { id: newMentorId, name: "New Mentor" }, // Optimistic UI update
      ]);
    } catch (error) {
      setError("Failed to add mentor. Please try again.");
    } finally {
      setAddLoading(false); // Stop loading after add is complete
    }
  };

  const handleRemoveMentor = async (mentorId: string) => {
    setRemovingMentorId(mentorId); // Track which mentor is being removed
    setError("");
    setMessage("");

    try {
      await updateMentorRole({ userId: mentorId, action: "remove" });
      setMessage("Mentor removed successfully.");
      setMentors((prevMentors) =>
        prevMentors.filter((mentor) => mentor.id !== mentorId)
      );
    } catch (error) {
      setError("Failed to remove mentor. Please try again.");
    } finally {
      setRemovingMentorId(null); // Reset after removing is done
    }
  };

  return (
    <div className="container mx-auto p-6 bg-background rounded-lg shadow-lg max-w-2xl">
      <h1 className="text-3xl font-semibold mb-6 text-primary-text">
        Mentor Management
      </h1>

      {error && <p className="text-destructive mb-4">{error}</p>}
      {message && <p className="text-[rgb(var(--positive))] mb-4">{message}</p>}

      <h2 className="text-xl font-semibold mb-4 text-primary-text">
        Current Mentors
      </h2>

      {mentors.length > 0 ? (
        <ul className="list-none mb-4 space-y-4">
          {mentors.map((mentor: User) => (
            <li
              key={mentor.id}
              className="flex items-center justify-between p-4 bg-muted rounded-md"
            >
              <span className="text-primary-text">
                {mentor?.name || mentor.id}
              </span>
              <Button
                size="sm"
                className="bg-destructive text-button-text hover:bg-destructive-foreground transition"
                onClick={() => handleRemoveMentor(mentor.id)}
                disabled={removingMentorId === mentor.id} // Disable only the relevant button
              >
                {removingMentorId === mentor.id ? "Removing..." : "Remove"}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-primary-text">No mentors found.</p>
      )}

      <h2 className="text-xl font-semibold mb-4 text-primary-text">
        Add New Mentor
      </h2>

      <div className="flex items-center space-x-4 mb-6">
        <input
          type="text"
          value={newMentorId}
          onChange={(e) => setNewMentorId(e.target.value)}
          placeholder="Enter mentor user ID"
          className="p-3 w-full border border-input rounded-md focus:ring-primary focus:border-primary"
        />
        <Button
          size="sm"
          className="bg-primary text-button-text hover:bg-primary-foreground transition"
          onClick={handleAddMentor}
          disabled={addLoading} // Disable only the add button
        >
          {addLoading ? "Adding..." : "Add Mentor"}
        </Button>
      </div>
    </div>
  );
};

export default MentorManagement;
