import React from 'react';

interface TranscriptionBoxProps {
  transcription: string;
  isRecording: boolean;
  modelLoaded: boolean;
  status: string | null;
}

export const TranscriptionBox: React.FC<TranscriptionBoxProps> = ({ 
  transcription, 
  isRecording, 
  modelLoaded, 
  status 
}) => {
  return (
    <div className="h-28 bg-gray-50 border-2 border-[#383838] rounded-md p-3 relative overflow-hidden">
      {transcription ? (
        <>
          <p className="whitespace-pre-wrap text-gray-800">{transcription}</p>
          {/* Show pulsing cursor when actively recording */}
          {isRecording && (
            <span className="inline-block h-4 w-1 ml-1 bg-indigo-600 animate-pulse"/>
          )}
        </>
      ) : (
        <p className="text-gray-500">
          {isRecording ? (
            <>
              Listening
              <span className="animate-ellipsis-1">.</span>
              <span className="animate-ellipsis-2">.</span>
              <span className="animate-ellipsis-3">.</span>
            </>
          ) : (
            "Your transcribed quacks will appear here"
          )}
        </p>
      )}
    </div>
  );
}; 
