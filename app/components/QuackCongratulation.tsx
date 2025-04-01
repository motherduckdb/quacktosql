import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';
import posthog from 'posthog-js';

interface QuackCongratulationProps {
  isVisible: boolean;
  onClose: () => void;
  query: string;
}

export const QuackCongratulation: React.FC<QuackCongratulationProps> = ({ isVisible, onClose, query }) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const [showNotification, setShowNotification] = useState(false);
  
  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  // Show notification when component becomes visible
  useEffect(() => {
    if (isVisible) {
      setShowNotification(true);
    }
  }, [isVisible]);

  const handleRunInMotherDuck = () => {
    // Capture custom event when clicking "Run in MotherDuck"
    posthog.capture('run_in_motherduck_clicked', { 
      query: query,
      source: 'congratulations_modal'
    });
    // Open MotherDuck
    window.open(`https://bit.ly/3G25Qyr`, '_blank');
    onClose();
  };
  
  if (!isVisible) return null;
  
  return (
    <>
      {/* Confetti effect covering the entire screen */}
      <ReactConfetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={500}
        recycle={true}
        tweenDuration={10000}
        colors={['#5D26C1', '#a17fe0', '#FF9800', '#FF5722', '#F44336', '#00E5FF', '#1DE9B6', '#CDDC39', '#EEFF41', '#FFD700']}
        gravity={0.15}
      />
      
      {/* Notification banner at eye level */}
      <div 
        className={`fixed left-1/2 top-1/3 -translate-x-1/2 z-50 transition-all duration-700 ${
          showNotification 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform -translate-y-10 pointer-events-none'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 border-2 border-purple-300 flex flex-col items-center max-w-md relative">
          {/* Dismiss button */}
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <span className="text-4xl mb-2">🎊</span>
          <h3 className="text-2xl font-bold text-purple-700 mb-2 text-center">Congratulations!</h3>
          
          <p className="text-gray-700 text-center text-lg">
            You've reached 10 quacks!<br/>
            <span className="font-bold text-purple-600">You're now a Quack Master!</span>
          </p>

          <div className="mt-4 flex flex-col items-center">
            <img src="/quacktosql/duckets.png" alt="Duckets" className="w-24 h-24 mb-2" />
            <p className="text-gray-700 text-center">
              Run this query in MotherDuck to win<br/>
              <span className="font-bold text-purple-600">10 Duckets!</span>
            </p>
          </div>

          <button 
            className="mt-6 px-4 py-2 rounded border-2 border-[#383838] bg-[#FF7169] text-[#383838] font-medium shadow-md uppercase flex items-center transition-all duration-200 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[-4px_4px_0_0_#383838]"
            onClick={handleRunInMotherDuck}
          >
            <img src="/quacktosql/motherduck.svg" alt="MotherDuck" className="h-5 w-5 mr-2" />
            Run in MotherDuck
          </button>
        </div>
      </div>
    </>
  );
}; 
