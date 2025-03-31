import React from 'react';
import Progress from './Progress';

interface ProgressItem {
  file: string;
  progress: number;
  total: number;
}

interface LoadingProgressProps {
  status: string | null;
  loadingMessage: string;
  progressItems: ProgressItem[];
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  status,
  loadingMessage,
  progressItems
}) => {
  if (status !== "loading") return null;

  return (
    <div className="w-full text-center mx-auto p-4 bg-white rounded-lg shadow-md border border-indigo-100 mt-3">
      <p className="text-indigo-800 font-medium mb-3">{loadingMessage}</p>
      {progressItems.map(({ file, progress, total }, i) => (
        <Progress
          key={i}
          text={file}
          percentage={progress}
          total={total}
        />
      ))}
    </div>
  );
}; 
