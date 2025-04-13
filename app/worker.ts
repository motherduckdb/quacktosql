import {
  AutoTokenizer,
  AutoProcessor,
  WhisperForConditionalGeneration,
  TextStreamer,
  full,
} from "@huggingface/transformers";

const MAX_NEW_TOKENS = 64;

/**
 * This class uses the Singleton pattern to ensure that only one instance of the model is loaded.
 */
class AutomaticSpeechRecognitionPipeline {
  static model_id = "onnx-community/whisper-base";
  static tokenizer: any = null;
  static processor: any = null;
  static model: any = null;

  static async getInstance(progress_callback?: (progress: any) => void) {
    this.tokenizer ??= AutoTokenizer.from_pretrained(this.model_id, {
      progress_callback,
    });
    this.processor ??= AutoProcessor.from_pretrained(this.model_id, {
      progress_callback,
    });

    this.model ??= WhisperForConditionalGeneration.from_pretrained(
      this.model_id,
      {
        dtype: {
          encoder_model: "fp32", // 'fp16' works too
          decoder_model_merged: "q4", // or 'fp32' ('fp16' is broken)
        },
        device: "webgpu",
        progress_callback,
      },
    );

    return Promise.all([this.tokenizer, this.processor, this.model]);
  }
}

// Track if we're currently processing to avoid overlap
let processing = false;

// Track current transcription for accumulation
let currentText = "";

interface GenerateParams {
  audio: Float32Array;
  language: string;
}

async function generate({ audio, language }: GenerateParams) {
  if (processing) return;
  processing = true;

  // Tell the main thread we are starting
  self.postMessage({ status: "start" });

  try {
    // Retrieve the text-generation pipeline
    const [tokenizer, processor, model] =
      await AutomaticSpeechRecognitionPipeline.getInstance();

    let startTime: number | undefined;
    let numTokens = 0;
    let tps: number | undefined;
    
    const token_callback_function = () => {
      startTime ??= performance.now();

      if (numTokens++ > 0) {
        tps = (numTokens / (performance.now() - startTime)) * 1000;
        
        // Only send token speed updates, not affecting the text
        self.postMessage({
          status: "tokens",
          tps
        });
      }
    };
    
    const callback_function = (output: string) => {
      // Process the current output
      if (output) {
        currentText = output.trim();
        
        // Send update to main thread
        self.postMessage({
          status: "update",
          output: currentText,
          tps,
          numTokens,
        });
      }
    };

    const streamer = new TextStreamer(tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function,
      token_callback_function,
    });

    const inputs = await processor(audio);

    const outputs = await model.generate({
      ...inputs,
      max_new_tokens: MAX_NEW_TOKENS,
      language,
      streamer,
    });

    const decoded = tokenizer.batch_decode(outputs, {
      skip_special_tokens: true,
    });

    // Get the final output
    const finalOutput = Array.isArray(decoded) ? decoded[0].trim() : decoded.trim();
    currentText = finalOutput;
    
    // Send the final output back to the main thread
    self.postMessage({
      status: "complete",
      output: finalOutput,
      tps,
      numTokens,
    });
  } catch (error) {
    console.error("Error in speech recognition:", error);
    self.postMessage({
      status: "error",
      error: String(error)
    });
  } finally {
    processing = false;
  }
}

async function load() {
  self.postMessage({
    status: "loading",
    data: "Loading model...",
  });

  try {
    // Load the pipeline and save it for future use with progress callback
    const [tokenizer, processor, model] =
      await AutomaticSpeechRecognitionPipeline.getInstance((progress) => {
        // We also add a progress callback to track model loading
        self.postMessage(progress);
      });

    self.postMessage({
      status: "loading",
      data: "Compiling shaders and warming up model...",
    });

    // Run model with dummy input to compile shaders
    await model.generate({
      input_features: full([1, 80, 3000], 0.0),
      max_new_tokens: 1,
    });
    
    // Reset text
    currentText = "";
    
    self.postMessage({ status: "ready" });
  } catch (error) {
    console.error("Failed to load model:", error);
    self.postMessage({
      status: "error",
      error: String(error)
    });
  }
}

// Listen for messages from the main thread
self.addEventListener("message", async (e: MessageEvent) => {
  const { type, data } = e.data;

  switch (type) {
    case "load":
      load();
      break;

    case "generate":
      generate(data);
      break;
      
    case "reset":
      // Reset state
      currentText = "";
      processing = false;
      break;
  }
});

export {}; // This line is necessary for TypeScript to consider this a module 
