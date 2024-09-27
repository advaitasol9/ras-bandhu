"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaInstagram } from "react-icons/fa";
import { FiYoutube } from "react-icons/fi";
import emailjs from "@emailjs/browser";
import { toast } from "../ui/use-toast";

const Footer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage(""); // Reset the submission message

    try {
      // Check for missing fields before submitting
      if (
        !formData.name ||
        !formData.email ||
        !formData.mobile ||
        !formData.message
      ) {
        return toast({
          title: "Error",
          description: "Please fill in all required fields.",
        });
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        return toast({
          title: "Error",
          description: "Please enter a valid email address.",
        });
      }

      const mobilePattern = /^[0-9]{10}$/;
      if (!mobilePattern.test(formData.mobile)) {
        return toast({
          title: "Error",
          description: "Please enter a valid 10-digit mobile number.",
        });
      }

      const form = e.target as HTMLFormElement;

      const result = await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "",
        form,
        process.env.NEXT_PUBLIC_EMAILJS_KEY
      );

      if (result.status === 200) {
        setSubmissionMessage("Your message has been sent successfully!");
        setFormData({
          name: "",
          email: "",
          mobile: "",
          message: "",
        });
      } else {
        throw new Error("An error occurred while sending the email.");
      }
    } catch (error: any) {
      // Display error messages
      setSubmissionMessage(
        error?.message || "Something went wrong. Please try again."
      );
      console.error("EmailJS error:", error);
    } finally {
      setIsSubmitting(false); // End the submission process
    }
  };

  return (
    <footer className="bg-gradient-to-r from-[rgb(var(--background))]/20 to-[rgb(var(--background))] py-16">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* About Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-[rgb(var(--primary-text))]">
            RAS Bandhu
          </h2>
          <p className="text-[rgb(var(--muted-foreground))] mb-6 leading-relaxed">
            RAS Bandhu is an online platform designed to support RAS aspirants
            in achieving their Civil Services goals. Created by a group of
            individuals just like you, it aims to address the unmet needs of
            candidates by offering a complete approach and the necessary skills
            to succeed in this exam.
          </p>
          <h3 className="text-lg font-semibold mb-3 text-[rgb(var(--primary-text))]">
            Follow Us
          </h3>
          <div className="flex space-x-3 mb-6">
            <Link
              target="_blank"
              href="https://youtube.com/@rasbandhu?si=nKIIZmX30Yc9_VjX"
            >
              <FiYoutube className="w-8 h-8 hover:opacity-80 transition" />
            </Link>
            <Link
              target="_blank"
              href="https://www.instagram.com/ras_bandhu?igsh=Ym16cDd6Zm5taTV5"
            >
              <FaInstagram className="w-8 h-8 hover:opacity-80 transition" />
            </Link>
          </div>
          <h3 className="text-lg font-semibold mb-3 text-[rgb(var(--primary-text))]">
            Quick Links
          </h3>
          <ul className="space-y-2 text-[rgb(var(--muted-foreground))]">
            <li>
              <Link
                href="/terms-and-conditions"
                className="hover:text-[rgb(var(--primary))] transition"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-[rgb(var(--primary))] transition"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/refund-policy"
                className="hover:text-[rgb(var(--primary))] transition"
              >
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Message Section */}
        <div className="bg-card pt-2 rounded-md">
          <div className="px-2">
            <h3 className="text-2xl font-semibold mb-4 text-[rgb(var(--primary-text))]">
              Send Us a Message
            </h3>
            <p className="text-[rgb(var(--muted-foreground))] mb-6">
              We would love to hear your feedback about this program to make it
              more effective for upcoming batches.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-4 border border-[rgb(var(--input))] rounded-lg focus:outline-none focus:border-[rgb(var(--primary))]"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-4 border border-[rgb(var(--input))] rounded-lg focus:outline-none focus:border-[rgb(var(--primary))]"
                required
              />
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full p-4 border border-[rgb(var(--input))] rounded-lg focus:outline-none focus:border-[rgb(var(--primary))]"
                required
              />
              <textarea
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full p-4 border border-[rgb(var(--input))] rounded-lg h-32 focus:outline-none focus:border-[rgb(var(--primary))]"
                required
              ></textarea>
              {submissionMessage && (
                <p className="text-[rgb(var(--primary-text))]">
                  {submissionMessage}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-[rgb(var(--primary))] text-[rgb(var(--button-text))] hover:bg-[rgb(var(--primary-foreground))] transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </div>
        </div>

        {/* Contact Details Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-[rgb(var(--primary-text))]">
            Contact Us
          </h3>
          <p className="text-[rgb(var(--muted-foreground))] mb-6">
            For any further information, feel free to reach out to us at:
          </p>
          <p className="text-[rgb(var(--muted-foreground))] font-semibold mb-2">
            Email:{" "}
            <a
              href="mailto:info@rasbandhu.com"
              className="text-[rgb(var(--primary))] hover:underline"
            >
              info@rasbandhu.com
            </a>
          </p>
          <p className="text-[rgb(var(--muted-foreground))] font-semibold">
            Phone:{" "}
            <a
              href="tel:+919636935848"
              className="text-[rgb(var(--primary))] hover:underline"
            >
              +91 9636935848
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
