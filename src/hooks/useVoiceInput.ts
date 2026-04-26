// ============================================================
// Crisis OS — useVoiceInput Hook
// Wraps the Web Speech API for voice-to-text dictation.
// Usage: const { transcript, listening, supported, start, stop } = useVoiceInput();
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceInputReturn {
  transcript: string;
  listening: boolean;
  supported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useVoiceInput(lang = 'en-IN'): UseVoiceInputReturn {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening]   = useState(false);
  const recognitionRef               = useRef<SpeechRecognition | null>(null);

  const SpeechRecognitionCtor =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition ?? (window as Window & typeof globalThis & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)
      : undefined;

  const supported = Boolean(SpeechRecognitionCtor);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognitionCtor || listening) return;

    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;

    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend   = () => setListening(false);
    recognition.onerror = (e) => {
      console.warn('[Voice] Recognition error:', e.error);
      setListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let full = '';
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full);
    };

    recognition.start();
  }, [SpeechRecognitionCtor, lang, listening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    setListening(false);
    setTranscript('');
  }, []);

  return { transcript, listening, supported, start, stop, reset };
}
