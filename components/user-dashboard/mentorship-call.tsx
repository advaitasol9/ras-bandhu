"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import emailjs from "@emailjs/browser";
import { toast } from "@/components/ui/use-toast";
import { addDays, isSaturday, isSunday } from "date-fns";
import { useUserContext } from "@/components/context/user-provider";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MentorshipRequestForm: React.FC = () => {
  const { userData } = useUserContext(); // Fetch name, email, phone from context
  const [formData, setFormData] = useState<{
    date: Date | null;
    timeSlot: string;
  }>({
    date: null,
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

  const handleDateChange = (date: Date | null) => {
    setFormData({ ...formData, date });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage("");

    try {
      if (!formData.date || !formData.timeSlot) {
        setIsSubmitting(false);
        return toast({
          title: "Error",
          description: "Please select a date and time slot.",
        });
      }

      const formattedDate = formData.date.toISOString().split("T")[0];

      const templateParams = {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        date: formattedDate,
        timeSlot: formData.timeSlot,
      };

      const result = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_CALL_TEMPLATE_ID || "",
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_KEY || ""
      );

      if (result.status === 200) {
        setSubmissionMessage(
          "Your mentorship request has been sent successfully!"
        );
        setFormData({ date: null, timeSlot: "" });
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

  // Disable today and tomorrow
  const minDate = addDays(new Date(), 3);

  // Filter function to allow only Saturdays and Sundays
  const isWeekend = (date: Date) => {
    return isSaturday(date) || isSunday(date);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-card rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-primary-text text-center">
        Request a Mentorship Call
      </h2>

      <p className="text-sm text-muted-foreground text-center mb-4">
        Mentorship calls are only available on{" "}
        <span className="font-medium">Saturdays and Sundays</span>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="name" value={userData.name || ""} />
        <input type="hidden" name="email" value={userData.email || ""} />
        <input type="hidden" name="phone" value={userData.phone || ""} />

        {/* Date Selection */}
        <div className="w-full border border-input rounded-lg overflow-hidden bg-white">
          <DatePicker
            selected={formData.date}
            onChange={handleDateChange}
            filterDate={isWeekend}
            minDate={minDate}
            dateFormat="yyyy-MM-dd"
            calendarStartDay={1}
            placeholderText="Select a Date"
            className={`p-4 placeholder:text-secondary-text focus:outline-none focus:ring-0 ${
              formData.date ? "" : "text-secondary-text"
            }`}
            required
          />
        </div>

        {/* Time Slot Selection */}
        <select
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleInputChange}
          className={`w-full p-4 border border-input rounded-lg ${
            formData.timeSlot ? "" : "text-secondary-text"
          }`}
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
