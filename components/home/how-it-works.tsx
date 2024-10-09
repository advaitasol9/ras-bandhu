import React from "react";
import Image from "next/image";

const steps = [
  {
    title: "Write answers from any source",
    description:
      "Create answers to questions using any material or reference of your choice.",
    icon: "/write_icon.svg", // Replace with the correct icon path
  },
  {
    title: "Submit them on the platform",
    description:
      "Easily submit your answers through your personal dashboard on our platform.",
    icon: "/upload_icon.svg", // Replace with the correct icon path
  },
  {
    title: "Receive evaluated responses",
    description:
      "Get your answers evaluated by mentors, which will be available on your dashboard.",
    icon: "/collect_icon.svg", // Replace with the correct icon path
  },
];

const StepItem = ({ step, index }: any) => {
  return (
    <div className="flex bg-background border border-edge shadow-lg p-6 rounded-lg items-center space-x-6">
      <Image
        src={step.icon}
        alt={step.title}
        width={60}
        height={60}
        className="object-contain bg-card p-2 rounded-full"
      />
      <div>
        <h3 className="font-medium text-lg mb-2 text-primary-text">
          {step.title}
        </h3>
        <p className="text-muted-foreground"> {step.description}</p>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  return (
    <section className="mb-20">
      <div className="container mx-auto">
        <h2 className="text-3xl font-semibold mb-12 text-center text-primary-text">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <StepItem key={index} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
