import React from "react";

interface ProgressProps {
  text: string;
  percentage: number;
  total: number;
}

export default function Progress({ text, percentage, total }: ProgressProps) {
  const formattedPercentage = ((percentage / total) * 100).toFixed(1);
  const formattedSize = (total / (1024 * 1024)).toFixed(1);

  return (
    <div className="w-full py-2">
      <div className="flex justify-between mb-1">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {text}
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formattedPercentage}% of {formattedSize} MB
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{
            width: `${Math.min(100, (percentage / total) * 100)}%`,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
} 
