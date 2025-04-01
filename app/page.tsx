"use client";

import { useState, useEffect, useCallback } from "react";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { LanguageSelector } from "./components/LanguageSelector";
import { SqlTerminal } from "./components/SqlTerminal";
import { Quackometer } from "./components/Quackometer";
import { RecordButton } from "./components/RecordButton";
import { TranscriptionBox } from "./components/TranscriptionBox";
import { LoadingProgress } from "./components/LoadingProgress";
import { ErrorMessage } from "./components/ErrorMessage";
import { IntroModal } from "./components/IntroModal";
import { QuackCongratulation } from "./components/QuackCongratulation";
import { QuackPipe } from "./components/QuackPipe";
import { useAudioProcessing } from "./hooks/useAudioProcessing";
import { useQuackTyping } from "./hooks/useQuackTyping";
import { useWorker } from "./hooks/useWorker";
import { TimeoutModal } from "./components/TimeoutModal";

export default function Home() {
  // State for audio processing
  const [transcription, setTranscription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [language, setLanguage] = useState("en");
  const [isRecording, setIsRecording] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showCongratulation, setShowCongratulation] = useState(false);
  const [hasSeenCongrats, setHasSeenCongrats] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  // Transcription update handler - logs and sets transcription
  const handleTranscriptionUpdate = useCallback((text: string) => {
    setTranscription(text);
  }, []);

  // Set up the worker hook for processing
  const {
    status,
    loadingMessage,
    progressItems,
    tps,
    isProcessing,
    modelLoaded,
    worker,
    loadModel,
    setIsProcessing,
    resetWorker
  } = useWorker({
    onTranscriptionUpdate: handleTranscriptionUpdate
  });

  // Show modal when needed
  useEffect(() => {
    if (!modelLoaded && !status && !isProcessing && !loadingMessage) {
      setShowModelModal(true);
    } else {
      setShowModelModal(false);
    }
  }, [modelLoaded, status, isProcessing, loadingMessage]);

  // Set up the quack typing hook
  const { quackCount, typedQuery } = useQuackTyping({
    transcription
  });

  // Show congratulation when 10 quacks are achieved
  useEffect(() => {
    if (quackCount >= 10 && !hasSeenCongrats) {
      // Show the congratulation immediately
      setShowCongratulation(true);
    }
  }, [quackCount, hasSeenCongrats]);

  // Function to close the congratulation modal
  const handleCloseCongratulation = useCallback(() => {
    setShowCongratulation(false);
    setHasSeenCongrats(true);
  }, []);

  // Set up the audio processing hook
  const {
    audioLevel,
    timeLeft,
    startRecording: startAudioRecording,
    stopRecording
  } = useAudioProcessing({
    modelLoaded,
    isProcessing,
    language,
    worker,
    setIsProcessing,
    setStream,
    setIsRecording,
    setErrorMessage,
    setShowTimeoutModal
  });

  // Function to handle errors with fallback retries
  const handleError = useCallback((error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    
    // Set error message for user
    setErrorMessage(`${context} error: ${error.message || "Unknown error"}. Retrying...`);
    
    // Stop any ongoing recording
    if (isRecording) {
      stopRecording();
    }
    
    // Reset states
    setIsProcessing(false);
    
    // Retry logic with incrementing count (to limit retries)
    setRetryCount(count => {
      const newCount = count + 1;
      if (newCount <= 3) {
        // Try to reset and continue
        setTimeout(() => {
          resetWorker();
          setErrorMessage("");
        }, 1500);
      } else {
        // Too many retries, suggest page reload
        setErrorMessage("Too many errors occurred. Please reload the page and try again.");
      }
      return newCount;
    });
  }, [isRecording, stopRecording, setIsProcessing, resetWorker]);

  // Function to start recording with debounce
  const startRecording = async () => {
    try {
      // Check if worker exists
      if (!worker.current) {
        setErrorMessage("Worker not initialized. Please reload the page.");
        return;
      }
      
      // Reset retry count on successful attempt
      setRetryCount(0);
      
      // Reset transcription state
      setTranscription("");
      setErrorMessage("");
      
      // Reset the worker to ensure it's in a clean state
      resetWorker();
      
      // Slight delay to ensure worker reset completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Start audio recording
      await startAudioRecording();
      
    } catch (error) {
      handleError(error, "Recording start");
    }
  };

  // Debounced handlers to prevent double-clicks
  const handleStartRecording = useCallback(() => {
    if (isRecording || isProcessing) return;
    
    // Only show the modal if the model isn't loaded
    if (!modelLoaded) {
      setShowModelModal(true);
      return;
    }
    
    // Otherwise, start recording
    startRecording();
  }, [isRecording, isProcessing, modelLoaded]);

  const handleStopRecording = useCallback(() => {
    if (!isRecording) return;
    
    // Set local recording state to false immediately for UI responsiveness
    setIsRecording(false);
    
    // Then stop the actual recording
    stopRecording();
  }, [isRecording, stopRecording]);

  // Handle download button click in modal
  const handleModelDownload = () => {
    setShowModelModal(false);
    loadModel();
  };

  // Handle start recording after timeout
  const handleStartAfterTimeout = () => {
    setShowTimeoutModal(false);
    startRecording();
  };

  // Different button layouts based on recording state
  const renderRecordingInterface = () => {
    // Just render the transcription box regardless of recording state
    return (
      <TranscriptionBox 
        transcription={transcription}
        isRecording={isRecording}
        modelLoaded={modelLoaded}
        status={status}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F4EFE9]">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-6">
          <div className="flex flex-col items-center justify-center">
            <img src="/quacktosql/duck-quack.svg" alt="Duck" className="h-60 w-60 -mb-12" />
            <h1 className="title-quack text-4xl font-bold">Quack To SQL MODEL</h1>
          </div>
          <h2 className="title-sub text-xl text-[#383838] mt-3">A model that generates SQL from quack sound</h2>
          {tps && (
            <p className="text-xs text-gray-500 mt-1">
              Processing speed: {tps.toFixed(2)} tokens/s
            </p>
          )}
        </div>
        
        <ErrorMessage message={errorMessage} />
        
        {/* Intro modal */}
        <IntroModal 
          isOpen={showModelModal}
          onDownload={handleModelDownload}
        />
        
        {/* Congratulation notification - now positioned absolutely in the component */}
        <QuackCongratulation
          isVisible={showCongratulation}
          onClose={handleCloseCongratulation}
          query={typedQuery}
        />
        
        {/* Timeout modal */}
        <TimeoutModal 
          isOpen={showTimeoutModal}
          onStartAgain={handleStartAfterTimeout}
        />
        
        {/* Main two-column layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column - Duck Input */}
          <div className="flex-1 bg-white rounded-md border-2 border-[#383838] shadow-md p-6 relative">
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <img src="/quacktosql/DuckInput.svg" alt="Duck Input" className="h-9 w-9 mr-2" style={{ maxHeight: '48px' }} />
                <h2 className="title-quack text-2xl font-bold">DUCK INPUT</h2>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">Record your quacks to generate powerful SQL queries instantly</p>
            
            {!modelLoaded && !showModelModal ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading model...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : (
              modelLoaded && (
                <>
                  {/* Quackometer - Now above AudioVisualizer */}
                  <Quackometer 
                    quackCount={quackCount}
                    transcription={transcription}
                  />
                  
                  <div className="flex flex-col md:flex-row gap-4 mt-3 mb-4">
                    {/* Audio Visualizer */}
                    <div className="md:w-1/2">
                      <AudioVisualizer 
                        stream={stream} 
                        className="w-full h-28 bg-gray-50 border-2 border-[#383838] rounded-md" 
                      />
                    </div>
                    
                    {/* Transcription box */}
                    <div className="md:w-1/2 relative">
                      {isRecording && (
                        <div className="absolute -top-2 left-0 right-0 h-1 bg-purple-600 rounded-full">
                          <div className="h-full bg-red-400 animate-pulse rounded-full" style={{ animationDuration: '3s' }}></div>
                        </div>
                      )}
                      {renderRecordingInterface()}
                    </div>
                  </div>
                  
                  {/* Recording button - centered below content */}
                  {modelLoaded && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        disabled={isProcessing && !isRecording}
                        className={`
                          flex items-center justify-center px-10 py-3 
                          border-2 border-[#383838] rounded
                          text-base font-medium text-[#383838] shadow-md
                          w-64
                          ${isRecording 
                            ? 'bg-red-500' 
                            : 'bg-[#FF7169]'}
                          ${(isProcessing && !isRecording) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[-4px_4px_0_0_#383838]'}
                          focus:outline-none active:scale-[0.98] transition-all duration-200
                        `}
                      >
                        {isRecording ? (
                          <>
                            <div className="flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#383838]" viewBox="0 0 20 20" fill="currentColor">
                                <rect width="10" height="10" x="5" y="5" rx="1" />
                              </svg>
                              <span className="font-medium">STOP</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#383838]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                              <span className="font-medium">RECORD</span>
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )
            )}
            
            {loadingMessage && (
              <LoadingProgress 
                status={status}
                loadingMessage={loadingMessage}
                progressItems={progressItems}
              />
            )}
          </div>
          
          {/* Right column - SQL Terminal */}
          <div className="flex-1">
            <SqlTerminal 
              typedQuery={typedQuery}
              quackCount={quackCount}
            />
          </div>
        </div>
        
        {/* QuackPipe component between input and output */}
        {modelLoaded && (
          <div className="w-full mt-2 mb-4">
            <div className="max-w-3xl mx-auto">
              <QuackPipe 
                quackCount={quackCount}
                transcription={transcription}
              />
            </div>
          </div>
        )}
        
        {/* Display loading indicator when model is being downloaded but modal is closed */}
        {!modelLoaded && !showModelModal && (
          <div className="flex justify-center mt-8">
            <div className="px-10 py-3 rounded border-2 border-[#383838] min-w-[240px] bg-gray-300 text-[#383838] text-center flex items-center justify-center cursor-not-allowed shadow-md transition-all duration-200">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#383838]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              LOADING...
            </div>
          </div>
        )}
        
        {/* Add CSS for recording status animation */}
        <style jsx>{`
          @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
        `}</style>
      </div>
    </div>
  );
}
