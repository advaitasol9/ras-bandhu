import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto mt-8 max-w-4xl p-6 bg-background rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-primary-text">
        Privacy Policy
      </h1>

      <p className="mb-4 text-primary-text">
        At RAS Bandhu, we value your privacy and are committed to safeguarding
        your personal information. This Privacy Policy outlines how we collect,
        use, and protect your data.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-primary-text">
        Information We Collect
      </h2>
      <ul className="list-disc ml-6 mb-4 text-primary-text">
        <li>
          <strong>Account Information:</strong> Your name, email, and phone
          number when creating an account.
        </li>
        <li>
          <strong>Payment Information:</strong> Payment details for processing
          transactions (handled by third-party providers).
        </li>
        <li>
          <strong>Device Information:</strong> IP address, browser, and device
          details.
        </li>
        <li>
          <strong>Usage Data:</strong> Interactions and time spent on our
          platform.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 text-primary-text">
        How We Use Your Information
      </h2>
      <ul className="list-disc ml-6 mb-4 text-primary-text">
        <li>To manage your account and process transactions.</li>
        <li>To improve your user experience and provide support.</li>
        <li>
          To send relevant notifications and promotional content (with your
          consent).
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 text-primary-text">
        How We Share Your Information
      </h2>
      <ul className="list-disc ml-6 mb-4 text-primary-text">
        <li>
          <strong>Service Providers:</strong> Third-party vendors for payment
          processing, hosting, etc.
        </li>
        <li>
          <strong>Legal Compliance:</strong> When required by law or legal
          process.
        </li>
        <li>
          <strong>Business Transfers:</strong> In case of mergers or
          acquisitions.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 text-primary-text">
        Your Data Protection Rights
      </h2>
      <ul className="list-disc ml-6 mb-4 text-primary-text">
        <li>Access and correct your data.</li>
        <li>Request deletion or restrict processing.</li>
      </ul>

      <p className="mb-4 text-primary-text">
        Contact us at info@rasbandhu.com to exercise your rights.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-primary-text">
        Data Security & Retention
      </h2>
      <p className="mb-4 text-primary-text">
        We take reasonable measures to protect your data. We retain it as long
        as necessary to provide services or comply with legal requirements.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-primary-text">
        Changes to This Privacy Policy
      </h2>
      <p className="mb-4 text-primary-text">
        We may update this policy to reflect changes.
      </p>

      <p className="text-sm text-muted-foreground">Last updated: 23/09/2024</p>
    </div>
  );
};

export default PrivacyPolicy;
