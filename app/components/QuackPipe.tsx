import React, { useEffect, useState, useRef } from 'react';

interface QuackPipeProps {
  quackCount: number;
  transcription: string;
}

interface DuckEmoji {
  id: number;
  x: number;
  y: number;
  startTime: number;
  speed: number;
  size: number;
  rotation: number;
}

export const QuackPipe: React.FC<QuackPipeProps> = ({ quackCount, transcription }) => {
  const [ducks, setDucks] = useState<DuckEmoji[]>([]);
  const [lastQuackCount, setLastQuackCount] = useState(0);
  const animationRef = useRef<number>(0);
  const pipeRef = useRef<SVGSVGElement>(null);
  const duckIdRef = useRef(0);

  // Add a new duck when quack count increases
  useEffect(() => {
    if (quackCount > lastQuackCount) {
      const newDucksCount = quackCount - lastQuackCount;
      const newDucks: DuckEmoji[] = [];
      
      for (let i = 0; i < newDucksCount; i++) {
        newDucks.push({
          id: duckIdRef.current++,
          x: 40, // Start a bit after the left circle
          y: Math.random() * 20 + 15, // Random y position within the pipe
          startTime: performance.now() + i * 300, // Stagger start times
          speed: Math.random() * 3 + 3, // Random speed between 3-6 pixels per frame
          size: Math.random() * 5 + 18, // Random size between 18-23px
          rotation: Math.random() * 10 - 5, // Small random rotation for variety
        });
      }
      
      setDucks(prev => [...prev, ...newDucks]);
      setLastQuackCount(quackCount);
    }
  }, [quackCount, lastQuackCount]);

  // Reset ducks when transcription is empty (new session)
  useEffect(() => {
    if (!transcription) {
      setDucks([]);
      setLastQuackCount(0);
    }
  }, [transcription]);

  // Animate the ducks
  useEffect(() => {
    if (!pipeRef.current) return;
    
    const pipeWidth = pipeRef.current.getBoundingClientRect().width;
    const scaleFactor = 1000 / pipeWidth; // Convert real pixel width to SVG coordinate system
    
    const animateDucks = (timestamp: number) => {
      setDucks(prevDucks => {
        // Filter out ducks that have exited the pipe
        const updatedDucks = prevDucks
          .filter(duck => duck.x < 960) // Remove ducks that have reached the right end
          .map(duck => {
            // Only start moving the duck after its start time
            if (timestamp < duck.startTime) return duck;
            
            // Calculate new position with slight vertical movement
            const newX = duck.x + duck.speed;
            const newY = duck.y + Math.sin((newX / 50) * Math.PI) * 0.5; // Small sine wave motion
            
            return {
              ...duck,
              x: newX,
              y: newY,
            };
          });
        
        return updatedDucks;
      });
      
      animationRef.current = requestAnimationFrame(animateDucks);
    };
    
    animationRef.current = requestAnimationFrame(animateDucks);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="w-full">
      <svg 
        ref={pipeRef}
        className="w-full h-16 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full"
        viewBox="0 0 1000 60"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Flow indicator lines */}
        <path
          d="M100,30 L900,30"
          stroke="#6d28d9"
          strokeWidth="1.5"
          strokeDasharray="10,10"
          className="opacity-50"
        />
        
        {/* Pipe body */}
        <rect
          x="0"
          y="10"
          width="1000"
          height="40"
          rx="20"
          ry="20"
          fill="none"
          stroke="#6d28d9"
          strokeWidth="2"
          className="opacity-70"
        />
        
        {/* Directional flow arrow markers in the middle - now left to right */}
        {[350, 500, 650].map((x, i) => (
          <polygon 
            key={i}
            points={`${x+5},30 ${x-5},25 ${x-5},35`} 
            fill="#6d28d9" 
            className="opacity-60"
          />
        ))}
        
        {/* Pipe left end (input) */}
        <circle
          cx="20"
          cy="30"
          r="15"
          fill="#fef3c7"
          stroke="#f97316"
          strokeWidth="2"
        />
        
        {/* Duck icon at input - adjusted size */}
        <image 
          href="/quacktosql/duck_running.svg"
          x="3" 
          y="12" 
          height="35" 
          width="35" 
        />
        
        {/* Pipe right end (output) */}
        <circle
          cx="980"
          cy="30"
          r="15"
          fill="#dbeafe"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        
        {/* Database icon at output */}
        <image 
          href="/quacktosql/database.svg"
          x="962" 
          y="12" 
          height="35" 
          width="35" 
        />
        
        {/* Duck emojis - medium size */}
        {ducks.map(duck => (
          <image
            key={duck.id}
            href="/quacktosql/duck_running.svg"
            x={duck.x - duck.size/2}
            y={duck.y - duck.size/2}
            width={duck.size * 1.7}
            height={duck.size * 1.7}
            style={{ 
              transform: `rotate(${duck.rotation}deg)`,
              transformOrigin: `${duck.x}px ${duck.y}px`,
              transition: 'transform 0.2s ease-in-out'
            }}
          />
        ))}
      </svg>
    </div>
  );
}; 
