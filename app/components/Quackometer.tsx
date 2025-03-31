import React from 'react';

interface QuackometerProps {
  quackCount: number;
  transcription: string;
}

export const Quackometer: React.FC<QuackometerProps> = ({ quackCount, transcription }) => {
  // Define colors and content for different levels
  let fillColor = "#ef4444"; // red
  let levelText = "Beginner Quacker";
  let emoji = "🥚";
  
  if (quackCount >= 8) {
    fillColor = "#10b981"; // emerald
    levelText = "Quack Master!";
    emoji = "🦆";
  } else if (quackCount >= 5) {
    fillColor = "#f59e0b"; // amber
    levelText = "Advanced Quacker";
    emoji = "🐣";
  } else if (quackCount >= 1) {
    fillColor = "#f97316"; // orange
    levelText = "Novice Quacker";
    emoji = "🐥";
  }
  
  return (
    <div className="mb-4">
      <h3 className="title-quack text-sm font-medium mb-2">Quackometer</h3>
      <div className="w-full h-10 bg-gray-100 rounded-md border-2 border-[#383838] flex items-center overflow-hidden">
        <div className="relative h-6 w-full bg-gray-200 rounded-full overflow-hidden">
          {/* Filled portion */}
          <div
            className="absolute top-0 left-0 h-full transition-all duration-500 ease-out"
            style={{ 
              width: `${Math.min(quackCount, 10) * 10}%`,
              backgroundColor: fillColor,
            }}
          />
          
          {/* Measurement lines */}
          <div className="absolute inset-0 flex justify-between px-1 items-center pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-full w-0.5 bg-white opacity-50" />
            ))}
          </div>
          
          {/* Quack count */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm shadow-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {quackCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 
