import { useState, useCallback, useEffect, useRef } from 'react';
import { SupportedLanguage } from '../types';
import { speechRecognitionService } from '../services/speech/speechRecognition';
import { audioRecorderService } from '../services/speech/audioRecorderService';
import { isInsideWhatsApp, isInAppBrowser } from '../utils/browserDetect';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [lastRecordedUrl, setLastRecordedUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [activeEngine, setActiveEngine] = useState<'hybrid' | 'webSpeech' | 'recorder'>('hybrid');

  const durationTimerRef = useRef<any>(null);
  const currentLangRef = useRef<SupportedLanguage>('ur-PK');
  const onFinalCallbackRef = useRef<((text: string) => void) | null>(null);
  const accumulatedTextRef = useRef<string>('');
  const hasReceivedSpeechRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);

  const isSupported = audioRecorderService.isSupported() || speechRecognitionService.isSupported();

  // Clear duration timer
  const clearTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    setDuration(0);
  }, []);

  // Start duration timer
  const startTimer = useCallback(() => {
    clearTimer();
    setDuration(0);
    durationTimerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, [clearTimer]);

  // Request Microphone and start listening/recording
  const startListening = useCallback(
    async (lang: SupportedLanguage, onFinalResult?: (text: string) => void) => {
      setError(null);
      setIsPermissionDenied(false);
      setIsStarting(true);
      currentLangRef.current = lang;
      accumulatedTextRef.current = '';
      hasReceivedSpeechRef.current = false;
      if (onFinalResult) {
        onFinalCallbackRef.current = onFinalResult;
      }

      const inWhatsApp = isInsideWhatsApp() || isInAppBrowser();

      // Start Audio Recorder first (captures hardware microphone input reliably)
      let recorderStarted = false;
      if (audioRecorderService.isSupported()) {
        try {
          recorderStarted = await audioRecorderService.start({
            onStart: () => {
              setIsStarting(false);
              setIsListening(true);
              isListeningRef.current = true;
              startTimer();
            },
            onVolumeChange: (vol) => {
              setVolume(vol);
            },
            onEnd: () => {
              setIsStarting(false);
              setIsListening(false);
              isListeningRef.current = false;
              clearTimer();
            },
            onError: (errMsg) => {
              console.warn('Audio recorder notice:', errMsg);
              if (errMsg === 'PERMISSION_DENIED') {
                setIsPermissionDenied(true);
                setError(
                  inWhatsApp
                    ? 'واٹس ایپ براؤزر نے مائیکروفون بلاک کیا۔ کروم میں کھولنے کے لیے نیچے بٹن دبائیں۔'
                    : 'مائیکروفون کی اجازت نہیں ملی۔ براہ کرم براؤزر کی سیٹنگز میں مائیکروفون Allow کریں۔'
                );
                setIsStarting(false);
                setIsListening(false);
                isListeningRef.current = false;
                clearTimer();
              }
            },
          });
        } catch (recErr) {
          console.warn('Could not launch audio recorder:', recErr);
        }
      }

      // In parallel: launch browser SpeechRecognition if supported for instant live typing
      if (speechRecognitionService.isSupported()) {
        try {
          await speechRecognitionService.start(lang, {
            onStart: () => {
              if (!recorderStarted) {
                setIsStarting(false);
                setIsListening(true);
                isListeningRef.current = true;
                setVolume(0.6);
                startTimer();
              }
            },
            onResult: (finalStr, interimStr) => {
              const combined = (finalStr + interimStr).trim();
              if (combined) {
                hasReceivedSpeechRef.current = true;
                accumulatedTextRef.current = combined;
                setVolume(0.5 + Math.random() * 0.4);
                if (onFinalCallbackRef.current) {
                  onFinalCallbackRef.current(combined);
                }
              }
            },
            onEnd: () => {
              // Only end if recorder is not active
              if (!recorderStarted) {
                setIsStarting(false);
                setIsListening(false);
                isListeningRef.current = false;
                clearTimer();
              }
            },
            onError: (errMsg) => {
              console.warn('Web Speech API soft warning:', errMsg);
              // Do not abort if audioRecorder is already recording audio chunks
              if (!recorderStarted) {
                setIsStarting(false);
                setIsListening(false);
                isListeningRef.current = false;
                clearTimer();
                if (errMsg.includes('permission') || errMsg.includes('not-allowed')) {
                  setIsPermissionDenied(true);
                  setError('مائیکروفون کی اجازت نہیں ملی۔ براہ کرم مائیکروفون Allow کریں۔');
                } else {
                  setError(errMsg);
                }
              }
            },
          });
        } catch (wsErr) {
          console.warn('Web Speech API start error:', wsErr);
        }
      }

      if (!recorderStarted && !speechRecognitionService.isListening()) {
        setIsStarting(false);
        setIsListening(false);
        isListeningRef.current = false;
        clearTimer();
        setError('براؤزر میں مائیکروفون شروع نہیں ہو سکا۔ براہ کرم اجازت چیک کریں۔');
      }
    },
    [startTimer, clearTimer]
  );

  // Stop recording/listening
  const stopListening = useCallback(async (): Promise<string> => {
    clearTimer();
    setIsListening(false);
    isListeningRef.current = false;
    setIsStarting(false);
    setVolume(0);

    // Stop Web Speech
    speechRecognitionService.stop();

    const liveText = accumulatedTextRef.current.trim();

    // If Web Speech gave a valid transcription, we are done immediately!
    if (liveText.length > 0) {
      audioRecorderService.cancel();
      if (onFinalCallbackRef.current) {
        onFinalCallbackRef.current(liveText);
      }
      return liveText;
    }

    // Otherwise, use Gemini audio transcription on the recorded audio buffer
    setIsTranscribing(true);
    try {
      const { text, audioUrl } = await audioRecorderService.stopAndTranscribe(
        currentLangRef.current
      );
      setIsTranscribing(false);

      if (audioUrl) {
        setLastRecordedUrl(audioUrl);
      }

      const finalText = (text || '').trim();
      if (finalText && onFinalCallbackRef.current) {
        onFinalCallbackRef.current(finalText);
      } else if (!finalText) {
        setError(
          currentLangRef.current === 'ur-PK'
            ? 'کوئی واضح آواز سنائی نہیں دی۔ براہ کرم مائیک کے قریب بولیں یا ٹیکسٹ ٹائپ کریں۔'
            : 'No clear speech detected. Please speak closer to the mic or type.'
        );
      }
      return finalText;
    } catch (err: any) {
      setIsTranscribing(false);
      console.warn('Transcription error:', err);
      setError('آواز پروسیس کرنے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں یا ٹائپ کریں۔');
      return '';
    }
  }, [clearTimer]);

  // Toggle listening
  const toggleListening = useCallback(
    (lang: SupportedLanguage, onFinalResult?: (text: string) => void) => {
      if (isListening || isStarting || isTranscribing) {
        stopListening();
      } else {
        startListening(lang, onFinalResult);
      }
    },
    [isListening, isStarting, isTranscribing, startListening, stopListening]
  );

  // Cancel recording and discard
  const cancelListening = useCallback(() => {
    clearTimer();
    setIsStarting(false);
    setIsListening(false);
    isListeningRef.current = false;
    setIsTranscribing(false);
    setVolume(0);
    speechRecognitionService.stop();
    audioRecorderService.cancel();
  }, [clearTimer]);

  // Play back the last recorded voice
  const playRecording = useCallback(() => {
    if (!lastRecordedUrl) return;
    setIsPlayingRecording(true);
    audioRecorderService.playLastRecording(() => {
      setIsPlayingRecording(false);
    });
  }, [lastRecordedUrl]);

  const stopPlayingRecording = useCallback(() => {
    audioRecorderService.stopPlayingLastRecording();
    setIsPlayingRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      speechRecognitionService.stop();
      audioRecorderService.cancel();
      audioRecorderService.stopPlayingLastRecording();
    };
  }, [clearTimer]);

  return {
    isListening,
    isStarting,
    isTranscribing,
    volume,
    duration,
    error,
    isPermissionDenied,
    lastRecordedUrl,
    isPlayingRecording,
    playRecording,
    stopPlayingRecording,
    clearError: () => {
      setError(null);
      setIsPermissionDenied(false);
    },
    isSupported,
    activeEngine,
    startListening,
    stopListening,
    toggleListening,
    cancelListening,
  };
}
