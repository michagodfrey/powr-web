// Thin wrapper around the browser's native Web Speech API for hands-free set logging.
// Not supported in Firefox; callers should feature-detect via `isSupported` and hide
// voice controls entirely rather than showing a broken button.
import { useCallback, useEffect, useRef, useState } from "react";

// Minimal shape of the (non-standard, vendor-prefixed) SpeechRecognition API.
// Not part of TypeScript's default DOM lib, so declared locally.
interface SpeechRecognitionResult {
  0: { transcript: string };
  isFinal: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: ArrayLike<SpeechRecognitionResult>;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

interface UseVoiceInputResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

export function useVoiceInput(): UseVoiceInputResult {
  const RecognitionCtor = useRef(getSpeechRecognitionConstructor()).current;
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const start = useCallback(() => {
    if (!RecognitionCtor) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    setError(null);
    setTranscript("");

    const recognition = new RecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "denied") {
        setError("Microphone access was denied.");
      } else if (event.error === "no-speech") {
        setError(
          'Didn\'t catch that. Try again — say the weight then reps, e.g. "135 for 8".'
        );
      } else {
        setError("Voice input error, try again.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [RecognitionCtor]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    isSupported: RecognitionCtor !== null,
    isListening,
    transcript,
    error,
    start,
    stop,
  };
}
