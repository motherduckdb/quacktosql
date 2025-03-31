import { useState, useRef, useEffect } from 'react';

// Constants for Whisper
const WHISPER_SAMPLING_RATE = 16_000;
const MAX_AUDIO_LENGTH = 20; // seconds
const MAX_SAMPLES = WHISPER_SAMPLING_RATE * MAX_AUDIO_LENGTH;

interface UseAudioProcessingProps {
  modelLoaded: boolean;
  isProcessing: boolean;
  language: string;
  setIsProcessing: (state: boolean) => void;
  setStream: (stream: MediaStream | null) => void;
  setIsRecording: (state: boolean) => void;
  setErrorMessage: (message: string) => void;
  worker: React.RefObject<Worker | null>;
}

interface AudioProcessingResult {
  stream: MediaStream | null;
  mediaRecorderRef: React.RefObject<MediaRecorder | null>;
  audioChunksRef: React.RefObject<Blob[]>;
  audioContextRef: React.RefObject<AudioContext | null>;
  analyserRef: React.RefObject<AnalyserNode | null>;
  animationFrameRef: React.RefObject<number | null>;
  audioLevel: number;
  setAudioLevel: (level: number) => void;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  timerRef: React.RefObject<NodeJS.Timeout | null>;
  processLatestAudioChunk: () => Promise<void>;
  analyzeAudio: (stream: MediaStream) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export const useAudioProcessing = ({
  modelLoaded,
  isProcessing,
  language,
  setIsProcessing,
  setStream,
  setIsRecording,
  setErrorMessage,
  worker
}: UseAudioProcessingProps): AudioProcessingResult => {
  // Audio processing state
  const [audioLevel, setAudioLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_AUDIO_LENGTH);
  const [stream, setLocalStream] = useState<MediaStream | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Set up initial media access
  useEffect(() => {
    const setupMediaAccess = async () => {
      if (!modelLoaded) return;
      
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("getUserMedia not supported on your browser!");
        }

        // Request access to microphone early
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        setLocalStream(mediaStream);
        setStream(mediaStream);
        
        // Create AudioContext with the correct sample rate
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext({
            sampleRate: WHISPER_SAMPLING_RATE,
          });
        }
        
      } catch (err) {
        console.error("Error setting up audio access:", err);
        setErrorMessage(err instanceof Error ? err.message : "Could not access microphone");
      }
    };

    setupMediaAccess();
    
    return () => {
      // Clean up media stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Clean up audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [modelLoaded, setStream, setErrorMessage]);

  // Function to process the latest audio chunk
  const processLatestAudioChunk = async () => {
    if (!modelLoaded || isProcessing || audioChunksRef.current.length === 0 || !worker.current) {
      console.log("Can't process audio chunk:", { 
        modelLoaded, 
        isProcessing, 
        chunksLength: audioChunksRef.current.length, 
        workerExists: !!worker.current 
      });
      return;
    }
    
    try {
      // Set processing flag
      setIsProcessing(true);
      
      // Try different MIME types if available
      const mimeTypes = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/wav',
        '' // default
      ];
      
      // First, try with the default MIME type
      let blob = new Blob(audioChunksRef.current, { type: mimeTypes[0] });
      
      const fileReader = new FileReader();
      let decodingSuccessful = false;
      let audioData: Float32Array | null = null;
      
      // First try to load the whole blob
      fileReader.onloadend = async () => {
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          if (!arrayBuffer || !audioContextRef.current) {
            console.error("Missing array buffer or audio context");
            setIsProcessing(false);
            return;
          }
          
          // Try to decode with the first MIME type
          try {
            // Create a new AudioContext if needed
            if (audioContextRef.current.state === 'closed') {
              audioContextRef.current = new AudioContext({
                sampleRate: WHISPER_SAMPLING_RATE,
              });
            }
            
            const decoded = await audioContextRef.current.decodeAudioData(arrayBuffer);
            let audio = decoded.getChannelData(0);
            
            // Limit to MAX_SAMPLES
            if (audio.length > MAX_SAMPLES) {
              audio = audio.slice(-MAX_SAMPLES);
            }
            
            audioData = audio;
            decodingSuccessful = true;
          } catch (decodeError) {
            console.error("First decode attempt failed:", decodeError);
            
            // Try other MIME types if the first one failed
            for (let i = 1; i < mimeTypes.length && !decodingSuccessful; i++) {
              try {
                blob = new Blob(audioChunksRef.current, { type: mimeTypes[i] });
                const newBuffer = await blob.arrayBuffer();
                
                const decoded = await audioContextRef.current.decodeAudioData(newBuffer);
                let audio = decoded.getChannelData(0);
                
                // Limit to MAX_SAMPLES
                if (audio.length > MAX_SAMPLES) {
                  audio = audio.slice(-MAX_SAMPLES);
                }
                
                audioData = audio;
                decodingSuccessful = true;
                break;
              } catch (err) {
                console.error(`Failed to decode with MIME type ${mimeTypes[i]}:`, err);
              }
            }
          }
          
          // If we successfully decoded audio, send it for processing
          if (decodingSuccessful && audioData && worker.current) {
            // Send audio to worker for processing
            worker.current.postMessage({
              type: "generate",
              data: { audio: audioData, language },
            });
          } else {
            setIsProcessing(false);
            
            // Empty the audio chunks to avoid trying to process the same bad data
            if (audioChunksRef.current.length > 0) {
              audioChunksRef.current = [];
            }
          }
        } catch (error) {
          console.error("Error in processLatestAudioChunk:", error);
          setIsProcessing(false);
        }
      };
      
      fileReader.onerror = () => {
        console.error("FileReader error:", fileReader.error);
        setIsProcessing(false);
      };
      
      fileReader.readAsArrayBuffer(blob);
    } catch (error) {
      console.error("Error processing audio chunk:", error);
      setIsProcessing(false);
    }
  };
  
  // Function to analyze audio levels
  const analyzeAudio = (stream: MediaStream) => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new AudioContext();
      } catch (error) {
        console.error("Failed to create audio context for analyzer:", error);
        return;
      }
    }
    
    if (!analyserRef.current && audioContextRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
    }

    if (audioContextRef.current && analyserRef.current) {
      try {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        
        const updateAudioLevel = () => {
          if (!analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average volume level
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          
          // Normalize to 0-100 range
          const normalizedLevel = Math.min(100, Math.max(0, avg * 1.5));
          setAudioLevel(normalizedLevel);
          
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        
        updateAudioLevel();
      } catch (error) {
        console.error("Error setting up audio analyzer:", error);
      }
    }
  };

  // Start recording function
  const startRecording = async () => {
    try {
      console.log("Starting recording with worker:", !!worker.current);

      // Make sure we have access to the microphone
      let mediaStream = stream;
      if (!mediaStream) {
        // Request media access if we don't have it yet
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        setLocalStream(mediaStream);
        setStream(mediaStream);
      }
      
      // Get supported MIME types
      const getSupportedMimeType = () => {
        const types = [
          'audio/webm',
          'audio/webm;codecs=opus',
          'audio/ogg;codecs=opus',
          'audio/wav',
          'audio/mp4'
        ];
        
        for (const type of types) {
          if (MediaRecorder.isTypeSupported(type)) {
            console.log(`Using MIME type: ${type}`);
            return type;
          }
        }
        return '';
      };
      
      // Create recorder with the best available settings
      const mimeType = getSupportedMimeType();
      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }
      
      console.log('Creating MediaRecorder with options:', recorderOptions);
      const recorder = new MediaRecorder(mediaStream, recorderOptions);
      mediaRecorderRef.current = recorder;
      
      // Clear existing audio chunks to start fresh
      audioChunksRef.current = [];
      
      // Setup recorder event handlers
      recorder.onstart = () => {
        setIsRecording(true);
      };
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          
          // Only process if we have significant data and are not already processing
          if (modelLoaded && !isProcessing && audioChunksRef.current.length > 0) {
            processLatestAudioChunk();
          }
        } else {
          console.log("Empty data from recorder");
        }
      };
      
      recorder.onstop = () => {
        setIsRecording(false);
        
        // Process any remaining chunks
        if (audioChunksRef.current.length > 0 && !isProcessing) {
          processLatestAudioChunk();
        }
      };
      
      // Handle any recorder errors
      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setIsRecording(false);
        setErrorMessage("Recording error occurred. Please try again.");
      };

      // Analyze audio for volume visualization
      analyzeAudio(mediaStream);
      
      // Start recording
      recorder.start(500); // Request data every 500ms
      
      // Set up timer for the recording limit
      setTimeLeft(MAX_AUDIO_LENGTH);
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            stopRecording();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      console.log("Recording started successfully");
    } catch (error) {
      console.error("Error starting recording:", error);
      setErrorMessage("Could not start recording. Please try again.");
    }
  };

  // Stop recording function
  const stopRecording = () => {
    console.log("Stopping recording, recorder state:", mediaRecorderRef.current?.state);
    
    // Set recording state to false immediately to prevent UI glitches
    setIsRecording(false);
    
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          console.log("MediaRecorder stopped successfully");
        } else {
          console.log("MediaRecorder wasn't recording, current state:", mediaRecorderRef.current.state);
        }
      } catch (error) {
        console.error("Error stopping MediaRecorder:", error);
      }
      
      // Reset the mediaRecorder reference to prevent issues with subsequent recordings
      setTimeout(() => {
        mediaRecorderRef.current = null;
      }, 100);
    }
    
    // Stop audio level analysis
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      setAudioLevel(0);
    }
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return {
    stream,
    mediaRecorderRef,
    audioChunksRef,
    audioContextRef,
    analyserRef,
    animationFrameRef,
    audioLevel,
    setAudioLevel,
    timeLeft,
    setTimeLeft,
    timerRef,
    processLatestAudioChunk,
    analyzeAudio,
    startRecording,
    stopRecording
  };
}; 
