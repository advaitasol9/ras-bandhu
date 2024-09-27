import React from "react";
import Image from "next/image";

const USPItem = ({ src, alt, title, description }: any) => {
  return (
    <div className="flex bg-[rgb(var(--background))] border border-[rgb(var(--input))] shadow-lg p-6 rounded-lg items-center space-x-6">
      <Image
        src={src}
        alt={alt}
        width={60}
        height={60}
        className="object-contain bg-[rgb(var(--card))] p-2 rounded-full"
      />
      <div>
        <h3 className="font-medium text-lg mb-2 text-[rgb(var(--primary-text))]">
          {title}
        </h3>
        <p className="text-[rgb(var(--muted-foreground))]">{description}</p>
      </div>
    </div>
  );
};

const USP = () => {
  const uspItems = [
    {
      src: "/interview_faculty_icon.svg",
      alt: "Interview-Appeared Faculty",
      title: "Interview-Appeared Faculty",
      description:
        "Our Experienced Evaluators ensure that there is no compromise in the quality of the evaluations.",
    },
    {
      src: "/evaluation_48hours_icon.svg",
      alt: "Evaluation within 48 hours",
      title: "Evaluation within 48 hours",
      description:
        "Get your answers evaluated within just 48 hours (up to 5 questions / 1 essay).",
    },
    {
      src: "/dashboard_icon.svg",
      alt: "Personal Dashboard",
      title: "Personal Dashboard",
      description:
        "With all your answers in one place, you can track your progress and accelerate your learning.",
    },
  ];

  return (
    <section className="space-y-6 mb-20">
      <div className="container">
        <h2 className="text-3xl font-semibold mb-12 text-center text-[rgb(var(--primary-text))]">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {uspItems.map((item, index) => (
            <USPItem
              key={index}
              src={item.src}
              alt={item.alt}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default USP;
