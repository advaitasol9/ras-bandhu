import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="border-t-4 border-b-4 border-primary rounded-full w-8 h-8 animate-spin"></div>
    </div>
  );
};

export default Loader;
