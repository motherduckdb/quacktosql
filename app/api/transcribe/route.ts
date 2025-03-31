import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define response type
interface TranscriptionResponse {
  transcription: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<TranscriptionResponse | ErrorResponse>> {
  try {
    // Check if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Process the form data to get the audio blob
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert blob to buffer for OpenAI API
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a Blob with the buffer and file type
    const blob = new Blob([buffer], { type: audioFile.type });
    
    // Create a File from the Blob
    const file = new File([blob], 'audio.wav', { type: audioFile.type });

    // Make the request to OpenAI's transcription API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      prompt: 'The audio may contain words similar to "quack". Try to recognize as much as you can and only extract speech, ignoring background audio.',
      response_format: 'text',
      temperature: 0.2,
    });

    // Return the transcription
    return NextResponse.json({
      transcription: transcription,
    });
    
  } catch (error) {
    console.error('Transcription error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Error processing transcription',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 
