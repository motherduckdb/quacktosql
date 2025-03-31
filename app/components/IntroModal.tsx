import React from 'react';

interface IntroModalProps {
  isOpen: boolean;
  onDownload: () => void;
}

export const IntroModal: React.FC<IntroModalProps> = ({ isOpen, onDownload }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <h2 className="title-main text-xl font-semibold text-gray-900">Advanced Quack To SQL Model</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            This advanced Quack To SQL model translates duck sounds into SQL queries in real-time, directly in your browser.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <div className="flex items-start">
              <div className="mr-2 flex-shrink-0 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-blue-800">
                The model requires downloading approximately 200MB of data, which will be processed entirely on your browser for enhanced privacy and performance.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mr-2 flex-shrink-0 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              No data leaves your device - all processing happens locally in your browser.
            </p>
          </div>
        </div>
        
        <button
          onClick={onDownload}
          className="w-full py-3 px-4 rounded border-2 border-[#383838] bg-[#6FC2FF] text-[#383838] font-medium flex items-center justify-center shadow-md uppercase transition-all duration-200 hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[-4px_4px_0_0_#383838]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download and Start
        </button>
      </div>
    </div>
  );
}; 
