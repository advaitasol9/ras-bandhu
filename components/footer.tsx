import React from "react";

export const Footer = () => {
  return (
    <footer>
      <div className="container flex flex-col items-center justify-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center justify-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-primary-text">
            © 2024 -{" "}
            <a target="_blank" className="font-medium">
              RAS Bandhu -{" "}
            </a>
            All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};
