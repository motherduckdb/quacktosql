import React, { useState, useEffect } from 'react';
import posthog from 'posthog-js';

interface SqlTerminalProps {
  typedQuery: string;
  quackCount?: number;
}

export const SqlTerminal: React.FC<SqlTerminalProps> = ({ typedQuery, quackCount = 0 }) => {
  const [copied, setCopied] = useState(false);
  const [displayQuery, setDisplayQuery] = useState(typedQuery);
  
  useEffect(() => {
    // If user reached 10 quacks, override with special query
    if (quackCount >= 10) {
      const specialQuery = 
        "-- 🎊 CONGRATULATIONS! Full query unlocked! 🎊\n" + 
        typedQuery;
      setDisplayQuery(specialQuery);
    } else {
      setDisplayQuery(typedQuery);
    }
  }, [typedQuery, quackCount]);
  
  const handleCopySQL = () => {
    if (displayQuery) {
      navigator.clipboard.writeText(displayQuery)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };
  
  return (
    <div className="w-full bg-white rounded-md border-2 border-[#383838] shadow-md mb-4">
      <div className="p-6">
        <div className="flex items-center mb-2">
          <img src="/quacktosql/database.svg" alt="Database" className="h-9 w-9 mr-3" style={{ maxHeight: '48px' }} />
          <h2 className="title-quack text-2xl font-bold">SQL OUTPUT</h2>
        </div>
        <p className="text-gray-600 mb-4">Your quacks translated into SQL query</p>
        
        <div className="w-full bg-gray-900 rounded-md overflow-hidden border-2 border-[#383838] mb-4">
          <div className="bg-gray-800 px-3 py-1 flex items-center justify-between">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <div></div>
          </div>
          <div className="p-4 font-mono text-sm overflow-auto h-64 whitespace-pre">
            {quackCount >= 10 ? (
              <>
                <div className="text-amber-400 font-bold mb-2">-- 🎊 CONGRATULATIONS! Full query unlocked! 🎊</div>
                <span className="text-green-400">{typedQuery}</span>
              </>
            ) : (
              <span className="text-green-400">{displayQuery}</span>
            )}
            <span className="inline-block h-3 w-1.5 bg-green-400 ml-1 animate-pulse"></span>
          </div>
        </div>
        
        <div className="flex justify-end items-center space-x-3">
          <button 
            className={`px-4 py-2 rounded border-2 border-[#383838] shadow-md flex items-center transition-all duration-200 uppercase hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[-4px_4px_0_0_#383838] ${
              copied 
                ? "bg-green-300 text-[#383838]" 
                : "bg-[#6FC2FF] text-[#383838]"
            }`}
            onClick={handleCopySQL}
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#383838]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#383838]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Copy SQL
              </>
            )}
          </button>
          
          <button 
            className="px-4 py-2 rounded border-2 border-[#383838] bg-[#FF7169] text-[#383838] font-medium shadow-md uppercase flex items-center transition-all duration-200 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[-4px_4px_0_0_#383838]"
            onClick={() => {
              // Capture custom event when clicking "Run in MotherDuck"
              posthog.capture('run_in_motherduck_clicked', { 
                query: displayQuery,
                quackCount: quackCount
              });
              // Open MotherDuck
              window.open(`https://bit.ly/3G25Qyr`, '_blank');
            }}
          >
            <img src="/quacktosql/motherduck.svg" alt="MotherDuck" className="h-5 w-5 mr-2" />
            Run in MotherDuck
          </button>
        </div>
      </div>
    </div>
  );
}; 
