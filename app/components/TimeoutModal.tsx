import React from 'react';

interface TimeoutModalProps {
  isOpen: boolean;
  onStartAgain: () => void;
}

export const TimeoutModal: React.FC<TimeoutModalProps> = ({ isOpen, onStartAgain }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 className="title-main text-xl font-semibold text-gray-900">Recording Timeout</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            The recording has reached its maximum duration of 3 minutes. Please start a new recording to continue.
          </p>
        </div>
        
        <button
          onClick={onStartAgain}
          className="w-full py-3 px-4 rounded border-2 border-[#383838] bg-[#FF7169] text-[#383838] font-medium flex items-center justify-center shadow-md uppercase transition-all duration-200 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[-4px_4px_0_0_#383838]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
          </svg>
          Start New Recording
        </button>
      </div>
    </div>
  );
}; 
