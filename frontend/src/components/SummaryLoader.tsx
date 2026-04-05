import React from "react";

const SummaryLoader: React.FC = () => {
  return (
    <div className="py-3 text-center">
      <div className="inline-flex items-center gap-2">
        <div className="inline-block animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="text-sm text-gray-600">✨ Generating summary...</p>
      </div>
    </div>
  );
};

export default SummaryLoader;
