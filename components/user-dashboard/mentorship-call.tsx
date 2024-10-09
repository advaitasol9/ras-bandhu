"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import emailjs from "@emailjs/browser";
import { toast } from "@/components/ui/use-toast";
import { format, addDays } from "date-fns";
import { useUserContext } from "@/components/context/user-provider";

const MentorshipRequestForm: React.FC = () => {
  const { userData } = useUserContext(); // Fetch name, email, phone from context
  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  const timeSlots = ["9AM-12PM", "12PM-3PM", "3PM-6PM"];

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage("");

    try {
      if (!formData.date || !formData.timeSlot) {
        return toast({
          title: "Error",
          description: "Please select a date and time slot.",
        });
      }

      const form = e.target as HTMLFormElement;
      const result = await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_CALL_TEMPLATE_ID || "",
        form,
        process.env.NEXT_PUBLIC_EMAILJS_KEY
      );

      if (result.status === 200) {
        setSubmissionMessage(
          "Your mentorship request has been sent successfully!"
        );
        setFormData({ date: "", timeSlot: "" });
      } else {
        throw new Error(
          "An error occurred while sending the mentorship request."
        );
      }
    } catch (error: any) {
      setSubmissionMessage(
        error?.message || "Something went wrong. Please try again."
      );
      console.error("EmailJS error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = format(addDays(new Date(), 1), "yyyy-MM-dd");

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-primary-text text-center">
        Request a Mentorship Call
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden Inputs for name, email, and phone */}
        <input type="hidden" name="name" value={userData.name || ""} />
        <input type="hidden" name="email" value={userData.email || ""} />
        <input type="hidden" name="phone" value={userData.phone || ""} />

        {/* Date Selection */}
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full p-4 border border-input rounded-lg"
          min={minDate}
          required
        />

        {/* Time Slot Selection */}
        <select
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleInputChange}
          className="w-full p-4 border border-input rounded-lg"
          required
        >
          <option value="">Select Time Slot</option>
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>

        {submissionMessage && (
          <p className="text-primary-text text-center">{submissionMessage}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full bg-primary text-button-text hover:bg-primary-foreground transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
};

export default MentorshipRequestForm;
