import React, { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface QuackCongratulationProps {
  isVisible: boolean;
  onClose: () => void;
}

export const QuackCongratulation: React.FC<QuackCongratulationProps> = ({ isVisible, onClose }) => {
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
      // Auto-hide notification after 5 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);
  
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
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 border-2 border-purple-300 flex flex-col items-center max-w-md">
          <span className="text-4xl mb-2">🎊</span>
          <h3 className="text-2xl font-bold text-purple-700 mb-2 text-center">Congratulations!</h3>
          
          <p className="text-gray-700 text-center text-lg">
            You've reached 10 quacks!<br/>
            <span className="font-bold text-purple-600">You're now a Quack Master!</span>
          </p>
        </div>
      </div>
    </>
  );
}; 
