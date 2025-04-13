import { useState, useRef, useEffect } from 'react';

interface ProgressItem {
  file: string;
  progress: number;
  total: number;
}

interface UseWorkerProps {
  onTranscriptionUpdate: (text: string) => void;
}

interface UseWorkerResult {
  status: string | null;
  loadingMessage: string;
  progressItems: ProgressItem[];
  tps: number | null;
  isProcessing: boolean;
  modelLoaded: boolean;
  worker: React.RefObject<Worker | null>;
  loadModel: () => void;
  setIsProcessing: (state: boolean) => void;
  resetWorker: () => void;
}

export const useWorker = ({
  onTranscriptionUpdate
}: UseWorkerProps): UseWorkerResult => {
  // State for model loading and status
  const [status, setStatus] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [tps, setTps] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Worker reference
  const worker = useRef<Worker | null>(null);
  
  // Track if component is mounted to avoid state updates after unmount
  const isMounted = useRef(true);
  
  // Track if worker message handler is set up
  const workerHandlerSetup = useRef(false);

  // Create and set up the worker
  useEffect(() => {
    isMounted.current = true;
    
    // Create worker when component mounts
    if (typeof window !== 'undefined') {
      createWorker();
    }
    
    // Cleanup when component unmounts
    return () => {
      isMounted.current = false;
      
      if (worker.current) {
        worker.current.terminate();
        worker.current = null;
      }
    };
  }, []);
  
  // Create worker instance
  const createWorker = () => {
    try {
      // Only create the worker if it doesn't exist
      if (!worker.current) {
        worker.current = new Worker(new URL("../worker.ts", import.meta.url));
        
        // Attach the message handler
        setupWorkerMessageHandler();
        
        return true;
      }
      return true;
    } catch (error) {
      console.error("Failed to initialize worker:", error);
      return false;
    }
  };
  
  // Setup worker message handler
  const setupWorkerMessageHandler = () => {
    if (!worker.current || workerHandlerSetup.current) return;
    
    // Create a debounce timer for transcription updates
    let transcriptionDebounceTimer: NodeJS.Timeout | null = null;
    
    // Create a callback function for messages from the worker thread
    const onMessageReceived = (e: MessageEvent) => {
      // Skip processing if component unmounted
      if (!isMounted.current) return;
      
      switch (e.data.status) {
        case "loading":
          // Model file start load: add a new progress item to the list.
          setStatus("loading");
          setLoadingMessage(e.data.data);
          break;

        case "initiate":
          setProgressItems((prev) => [...prev, e.data]);
          break;

        case "progress":
          // Model file progress: update one of the progress items.
          setProgressItems((prev) =>
            prev.map((item) => {
              if (item.file === e.data.file) {
                return { ...item, ...e.data };
              }
              return item;
            }),
          );
          break;

        case "done":
          // Model file loaded: remove the progress item from the list.
          setProgressItems((prev) =>
            prev.filter((item) => item.file !== e.data.file),
          );
          break;

        case "ready":
          // Pipeline ready: the worker is ready to accept messages.
          setStatus("ready");
          setModelLoaded(true);
          break;

        case "reset":
          // Worker reset completed
          break;

        case "start":
          // Start generation
          setIsProcessing(true);
          break;

        case "tokens":
          // Update token processing speed for real-time debugging
          if (e.data.tps) setTps(e.data.tps);
          break;

        case "update":
          // Generation update: update the output text immediately for real-time feedback.
          const { tps: processingTps, output } = e.data;
          if (processingTps) setTps(processingTps);
          
          // Use debounce for transcription updates to reduce flickering
          if (output) {
            // Clear any existing timer
            if (transcriptionDebounceTimer) {
              clearTimeout(transcriptionDebounceTimer);
            }
            
            // Set a small debounce to avoid updating state too frequently
            transcriptionDebounceTimer = setTimeout(() => {
              if (isMounted.current) {
                onTranscriptionUpdate(output);
              }
            }, 100);
          }
          break;

        case "complete":
          // Generation complete - immediately update the final transcription
          setIsProcessing(false);
          if (e.data.output) {
            // Clear any debounce timer for immediate update
            if (transcriptionDebounceTimer) {
              clearTimeout(transcriptionDebounceTimer);
              transcriptionDebounceTimer = null;
            }
            
            onTranscriptionUpdate(e.data.output);
          }
          break;
          
        case "error":
          setIsProcessing(false);
          break;
      }
    };

    // Attach the callback function as an event listener
    worker.current.addEventListener("message", onMessageReceived);
    worker.current.addEventListener("error", (error) => {
      setIsProcessing(false);
    });
    
    // Mark handler as set up
    workerHandlerSetup.current = true;
    
  };

  // Function to load the model
  const loadModel = () => {
    if (!worker.current) {
      // Re-create worker if it doesn't exist
      if (!createWorker()) {
        return;
      }
    }
    
    if (worker.current && status !== "loading" && status !== "ready") {
      // Reset state
      onTranscriptionUpdate("");
      
      worker.current.postMessage({ type: "load" });
      setStatus("loading");
    } else {
    }
  };
  
  // Function to reset the worker
  const resetWorker = () => {
    // Skip if worker doesn't exist or model isn't loaded
    if (!worker.current) {
      return;
    }
    
    
    try {
      // First try to send reset command
      worker.current.postMessage({ type: "reset" });
      
      // Also clear any pending processing state
      setIsProcessing(false);
      
      // Reset transcription
      onTranscriptionUpdate("");
    } catch (error) {
      
      // If reset fails, recreate the worker
      if (worker.current) {
        worker.current.terminate();
        worker.current = null;
        workerHandlerSetup.current = false;
      }
      
      createWorker();
    }
  };

  return {
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
  };
}; 
