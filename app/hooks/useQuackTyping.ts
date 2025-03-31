import { useState, useRef, useEffect } from 'react';
import { getTopStoriesQuery } from '../utils/sqlLoader';

interface UseQuackTypingProps {
  transcription: string;
}

interface QuackTypingResult {
  quackCount: number;
  typedQuery: string;
}

export const useQuackTyping = ({ 
  transcription 
}: UseQuackTypingProps): QuackTypingResult => {
  const [quackCount, setQuackCount] = useState(0);
  const [typedQuery, setTypedQuery] = useState("");
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const SQL_QUERY = getTopStoriesQuery();

  // Effect to count "quack" occurrences when transcription changes
  useEffect(() => {
    if (transcription) {
      // Count occurrences of "quack" (case insensitive)
      const quackRegex = /quack/gi;
      const matches = transcription.match(quackRegex);
      const newCount = matches ? matches.length : 0;
      
      // Safety check 1: if we see a sudden large jump in quack count, it might be an error
      // Cap the increase to a reasonable amount per update
      const MAX_NEW_QUACKS_PER_UPDATE = 3;
      
      // Safety check 2: absolute maximum limit on quack count to prevent unreasonable values
      const ABSOLUTE_MAX_QUACKS = 10;
      
      let safeCount = newCount;
      
      // Apply per-update limit
      if (newCount > quackCount && (newCount - quackCount) > MAX_NEW_QUACKS_PER_UPDATE) {
        console.log(`Detected unusual jump in quack count: ${quackCount} → ${newCount}, limiting increase`);
        safeCount = quackCount + MAX_NEW_QUACKS_PER_UPDATE;
      }
      
      // Apply absolute maximum limit
      if (safeCount > ABSOLUTE_MAX_QUACKS) {
        console.log(`Quack count ${safeCount} exceeds maximum limit of ${ABSOLUTE_MAX_QUACKS}, capping value`);
        safeCount = ABSOLUTE_MAX_QUACKS;
      }
      
      // Only update the quack count if the new count is higher than the current count
      // This ensures the quackometer never decreases during a session
      if (safeCount > quackCount) {
        setQuackCount(safeCount);
      }
    } else {
      // Only reset when transcription is explicitly empty (new session started)
      setQuackCount(0);
      setTypedQuery("");
    }
  }, [transcription, quackCount]);

  // Separate effect to handle typing animation based on quack count
  useEffect(() => {
    // Clear any existing typing animation
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    
    if (quackCount > 0) {
      // Calculate how much of the query to show based on quack count (up to 10 quacks)
      const portionToShow = Math.min(quackCount / 10, 1);
      const charsToShow = Math.floor(SQL_QUERY.length * portionToShow);
      
      // Start typing animation from where we left off
      let charIndex = typedQuery.length;
      
      if (charsToShow > charIndex) {
        
        // Increase speed as we get more quacks
        const typingSpeed = Math.max(10, 30 - quackCount * 2); // Speed up as quack count increases
        
        typingIntervalRef.current = setInterval(() => {
          setTypedQuery(prev => {
            const nextCharIndex = prev.length + 1;
            if (nextCharIndex <= charsToShow) {
              return SQL_QUERY.substring(0, nextCharIndex);
            } else {
              // If we've reached the target, clear the interval
              if (typingIntervalRef.current) {
                clearInterval(typingIntervalRef.current);
                typingIntervalRef.current = null;
              }
              return prev;
            }
          });
        }, typingSpeed);
      }
    }
    
    // Cleanup typing animation on unmount or when quack count changes
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [quackCount, typedQuery.length, SQL_QUERY]);

  return {
    quackCount,
    typedQuery,
  };
}; 
