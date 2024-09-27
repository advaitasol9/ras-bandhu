import React from "react";

const MediumSelector = ({
  title = "",
  selectedMedium,
  setSelectedMedium,
}: {
  title: string;
  selectedMedium: string;
  setSelectedMedium: (med: string) => void;
}) => {
  return (
    <div>
      <h2 className="text-center font-semibold text-3xl text-[rgb(var(--primary-text))] mb-8">
        {title}
      </h2>
      <div className="flex justify-center mb-6">
        <div className="inline-flex border border-[rgb(var(--border))] rounded-lg overflow-hidden shadow-sm">
          <button
            className={`px-6 py-3 w-36 text-center font-semibold transition duration-300 ease-in-out ${
              selectedMedium === "hindi"
                ? "bg-[#468585] text-[rgb(var(--button-text))] rounded-l-lg"
                : "bg-[rgb(var(--muted))] text-[rgb(var(--primary-text))] hover:bg-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--button-text))]"
            }`}
            onClick={() => setSelectedMedium("hindi")}
          >
            Hindi
          </button>
          <button
            className={`px-6 py-3 w-36 text-center font-semibold transition duration-300 ease-in-out ${
              selectedMedium === "english"
                ? "bg-[#468585] text-[rgb(var(--button-text))] rounded-r-lg"
                : "bg-[rgb(var(--muted))] text-[rgb(var(--primary-text))] hover:bg-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--button-text))]"
            }`}
            onClick={() => setSelectedMedium("english")}
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediumSelector;
