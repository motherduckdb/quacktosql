import React from 'react';

interface RecordButtonProps {
  isRecording: boolean;
  modelLoaded: boolean;
  isProcessing: boolean;
  status: string | null;
  timeLeft: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  modelLoaded,
  isProcessing,
  status,
  timeLeft,
  onStartRecording,
  onStopRecording,
}) => {
  // Determine the main button state and text
  const getButtonConfig = () => {
    // Case 1: Recording, show stop button
    if (isRecording) {
      return {
        text: "Stop",
        action: onStopRecording,
        disabled: false,
        class: 'bg-red-500 hover:bg-red-600',
      };
    }
    
    // Case 2: Not recording, show start recording button
    return {
      text: "Start Recording",
      action: onStartRecording,
      disabled: isProcessing || !modelLoaded,
      class: 'bg-purple-600 hover:bg-purple-700',
    };
  };

  const buttonConfig = getButtonConfig();

  // Special styling for the stop button when shown alongside transcription
  if (isRecording) {
    return (
      <button
        onClick={buttonConfig.action}
        disabled={buttonConfig.disabled}
        className="min-w-[120px] h-full px-5 py-3 flex items-center justify-center rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-md transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-white" viewBox="0 0 20 20" fill="currentColor">
          <rect width="10" height="10" x="5" y="5" rx="1" />
        </svg>
        <span className="text-base font-medium">Stop</span>
        {timeLeft > 0 && (
          <span className="text-sm ml-2 font-normal opacity-80">{timeLeft}s</span>
        )}
      </button>
    );
  }

  // Regular style for the start recording button
  return (
    <button
      onClick={buttonConfig.action}
      disabled={buttonConfig.disabled}
      className={`
        flex items-center justify-center px-6 py-3 rounded-full shadow-md transition-all
        min-w-[180px] whitespace-nowrap
        ${buttonConfig.class}
        ${buttonConfig.disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span className="text-white font-medium">{buttonConfig.text}</span>
      </div>
    </button>
  );
}; 
