import React from "react";

const RefundPolicy = () => {
  return (
    <div className="container mx-auto mt-8 max-w-4xl p-6 bg-[rgb(var(--background))] rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-[rgb(var(--primary-text))]">
        Refund Policy
      </h1>

      <p className="mb-4 text-[rgb(var(--primary-text))]">
        At RAS Bandhu, we strive to provide the best possible service. Please
        note that all purchases of our subscription plans are final, and no
        refunds will be issued once a plan is purchased.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-[rgb(var(--primary-text))]">
        1. No Refunds
      </h2>
      <p className="mb-4 text-[rgb(var(--primary-text))]">
        Once a subscription plan is purchased, it cannot be refunded. We
        encourage users to carefully review the plan details before making a
        purchase. This no-refund policy applies to all subscription plans,
        including cases where the plan has been partially or fully used.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-[rgb(var(--primary-text))]">
        2. Changing Subscription Medium
      </h2>
      <p className="mb-4 text-[rgb(var(--primary-text))]">
        If you selected the wrong medium (Hindi/English) for your plan, you can
        request a one-time medium change within 7 days of purchase. No
        additional charges apply.
      </p>

      <p className="mb-4 text-[rgb(var(--primary-text))]">
        Contact us at info@rasbandhu.com with your subscription details, and we
        will update your subscription within 2 business days.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-[rgb(var(--primary-text))]">
        3. Non-Refundable Items
      </h2>
      <ul className="list-disc ml-6 mb-4 text-[rgb(var(--primary-text))]">
        <li>All subscription plans after purchase.</li>
        <li>Medium changes requested after 7 days from the purchase date.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 text-[rgb(var(--primary-text))]">
        4. Contact Us
      </h2>
      <p className="mb-4 text-[rgb(var(--primary-text))]">
        If you have any questions about our refund policy or wish to request a
        change in your subscription plan, please contact us at
        info@rasbandhu.com.
      </p>

      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        Last updated: 23/09/2024
      </p>
    </div>
  );
};

export default RefundPolicy;
