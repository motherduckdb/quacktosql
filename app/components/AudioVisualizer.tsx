import { useRef, useCallback, useEffect } from "react";

interface AudioVisualizerProps {
  stream: MediaStream | null;
  className?: string;
  [key: string]: any;
}

export function AudioVisualizer({ stream, className, ...props }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const visualize = useCallback((stream: MediaStream) => {
    const audioContext = new (window.AudioContext || 
      (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawVisual = () => {
      if (!canvasCtx) return;
      
      requestAnimationFrame(drawVisual);
      analyser.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = "rgb(255, 255, 255)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "rgb(0, 0, 0)";
      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;

      let x = 0;
      for (let i = 0; i < bufferLength; ++i) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    drawVisual();
    
    return () => {
      // Cleanup
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (stream) {
      cleanup = visualize(stream);
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [visualize, stream]);
  
  return (
    <canvas 
      className={className} 
      width={720} 
      height={240} 
      ref={canvasRef}
      {...props}
    />
  );
} 
