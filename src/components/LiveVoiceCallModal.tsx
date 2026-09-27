import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface LiveVoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  speechLang: SupportedLanguage;
  onSendMessageToChat?: (text: string, responseText: string) => void;
}

export const LiveVoiceCallModal: React.FC<LiveVoiceCallModalProps> = ({
  isOpen,
  onClose,
  speechLang,
  onSendMessageToChat,
}) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  const isUrdu = speechLang === 'ur-PK' || speechLang === 'pa-PK';

  // Format call duration MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Play AI response voice
  const speakAiResponse = async (text: string) => {
    if (!isSpeakerOn || !text.trim()) return;

    try {
      setIsAiSpeaking(true);

      // Try backend high-fidelity TTS first
      const langParam = speechLang === 'ur-PK' ? 'ur' : speechLang === 'pa-PK' ? 'ur' : 'en';
      const res = await fetch('/api/audio/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: langParam }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsAiSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Resume speech recognition after speaking
          startListening();
        };

        audio.onerror = () => {
          setIsAiSpeaking(false);
          startListening();
        };

        await audio.play();
        return;
      }
    } catch {
      // Fallback to browser SpeechSynthesis
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLang === 'ur-PK' ? 'ur-PK' : 'en-US';
      utterance.rate = 1.0;
      utterance.onend = () => {
        setIsAiSpeaking(false);
        startListening();
      };
      utterance.onerror = () => {
        setIsAiSpeaking(false);
        startListening();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsAiSpeaking(false);
      startListening();
    }
  };

  // Send user spoken words to AI
  const handleUserSpokenInput = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    setUserTranscript(spokenText);
    setIsUserSpeaking(false);

    // Pause recognition while AI thinks & speaks
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: spokenText }],
          language: speechLang,
          systemInstruction: 'You are NOVA AI on a live phone call with the user. Keep your answers natural, respectful, and concise (2-4 sentences max) so they sound realistic and conversational over the telephone. Answer directly in the same language the user spoke (Urdu/Hindi or English).',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.text || '';
        setAiResponse(reply);
        if (onSendMessageToChat) {
          onSendMessageToChat(spokenText, reply);
        }
        await speakAiResponse(reply);
      } else {
        const fallbackReply = isUrdu
          ? 'جی میں آپ کی بات سمجھ گیا ہوں۔ فرمائیے، میں سائیٹ رپورٹ اور آپ کے کام میں کیا مدد کروں؟'
          : 'I hear you clearly! How can I assist you with your site progress report or daily tasks right now?';
        setAiResponse(fallbackReply);
        await speakAiResponse(fallbackReply);
      }
    } catch {
      const fallbackReply = isUrdu
        ? 'جی وعلیکم السلام! میں آپ کی بات سن رہا ہوں۔ آپ سائیٹ کے کام یا راؤنڈ کی رپورٹ سے متعلق کچھ بھی بتا سکتے ہیں۔'
        : 'Hello! I can hear you clearly. Please tell me about your site work or daily tasks.';
      setAiResponse(fallbackReply);
      await speakAiResponse(fallbackReply);
    }
  };

  // Start continuous Web Speech API listening
  const startListening = () => {
    if (isMuted || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang === 'ur-PK' ? 'ur-PK' : speechLang === 'pa-PK' ? 'pa-PK' : 'en-US';

      recognition.onstart = () => {
        setIsUserSpeaking(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          handleUserSpokenInput(final);
        } else if (interim) {
          setUserTranscript(interim);
        }
      };

      recognition.onerror = (e: any) => {
        setIsUserSpeaking(false);
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition notice:', e.error);
        }
      };

      recognition.onend = () => {
        setIsUserSpeaking(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Recognition start exception:', err);
    }
  };

  // Lifecycle on modal open
  useEffect(() => {
    isComponentMounted.current = true;
    if (isOpen) {
      setCallStatus('connecting');
      setDuration(0);
      setUserTranscript('');
      setAiResponse('');

      // Simulate connection tone and connect after 1 second
      const connTimer = setTimeout(() => {
        if (!isComponentMounted.current) return;
        setCallStatus('connected');

        // Start call duration timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);

        // Initial greeting
        const greeting = isUrdu
          ? 'السلام علیکم! نووا اے آئی لائیو کال میں خوش آمدید۔ میں آپ کی آواز سن رہا ہوں، فرمائیے کیا حکم ہے؟'
          : 'Hello! You are connected to NOVA AI live call. I am listening, how can I help you today?';
        setAiResponse(greeting);
        speakAiResponse(greeting);
      }, 1200);

      return () => {
        clearTimeout(connTimer);
        clearInterval(timerRef.current);
      };
    }
  }, [isOpen]);

  // Clean up audio on close
  const handleEndCall = () => {
    setCallStatus('ended');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearInterval(timerRef.current);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startListening();
    } else {
      setIsMuted(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    }
  };

  const handleToggleSpeaker = () => {
    if (isSpeakerOn) {
      setIsSpeakerOn(false);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsSpeakerOn(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center justify-between w-full max-w-md h-[580px] rounded-3xl bg-gradient-to-b from-[#1b1c20] via-[#131417] to-[#0d0e11] border border-[#2d3036] shadow-2xl p-6 text-white overflow-hidden select-none">
        
        {/* Top Header bar */}
        <div className="w-full flex items-center justify-between text-xs text-[#9aa0a6] pt-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-400">
              {callStatus === 'connecting' ? (isUrdu ? 'کال مل رہی ہے...' : 'Connecting...') : (isUrdu ? 'لائیو کال جاری ہے' : 'Live Call')}
            </span>
          </div>
          <div className="font-mono text-sm font-bold text-white bg-[#25282f] px-3 py-1 rounded-full border border-[#383d47]">
            {formatTime(duration)}
          </div>
          <button
            onClick={handleEndCall}
            className="text-[#9aa0a6] hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            title="Minimize / Close"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Center Calling Avatar & Pulsing Waveform */}
        <div className="flex flex-col items-center my-auto w-full px-4">
          <div className="relative mb-6 flex items-center justify-center">
            {/* Dynamic Glow Waves */}
            <div
              className={`absolute -inset-6 rounded-full blur-2xl transition-all duration-500 ${
                isAiSpeaking
                  ? 'bg-gradient-to-r from-blue-500/40 via-purple-500/50 to-pink-500/40 scale-125 animate-pulse'
                  : isUserSpeaking
                  ? 'bg-gradient-to-r from-emerald-500/40 to-teal-500/40 scale-110'
                  : 'bg-indigo-600/20 scale-90 opacity-40'
              }`}
            />

            {/* Calling Emblem Circular Frame */}
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-[#1f232b] via-[#16181f] to-[#121318] border-2 border-[#3d4452] shadow-2xl">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 text-white shadow-inner">
                <Sparkles className="h-12 w-12 animate-pulse" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            NOVA AI
          </h2>
          <p className="text-xs text-[#a8aba9] mb-4">
            {isAiSpeaking
              ? (isUrdu ? 'بول رہا ہے... 🔊' : 'Speaking... 🔊')
              : isUserSpeaking
              ? (isUrdu ? 'آپ کی آواز سن رہا ہے... 🎙️' : 'Listening to you... 🎙️')
              : (isUrdu ? 'کال پر بات کریں، جو چاہیں پوچھیں' : 'Connected • Speak naturally')}
          </p>

          {/* Subtitle / Live Transcript Card */}
          <div className="w-full bg-[#181a1f]/90 border border-[#2b2f38] rounded-2xl p-3.5 min-h-[90px] max-h-[120px] overflow-y-auto text-xs text-left shadow-inner">
            {userTranscript && (
              <div className="text-emerald-400 mb-1.5 leading-relaxed">
                <span className="font-semibold text-[10px] uppercase text-emerald-500 block">
                  {isUrdu ? 'آپ نے فرمایا:' : 'You said:'}
                </span>
                "{userTranscript}"
              </div>
            )}
            {aiResponse && (
              <div className="text-[#e3e3e3] leading-relaxed">
                <span className="font-semibold text-[10px] uppercase text-indigo-400 block">
                  NOVA AI:
                </span>
                {aiResponse}
              </div>
            )}
            {!userTranscript && !aiResponse && (
              <div className="text-center text-[#8e918f] italic py-2">
                {isUrdu ? 'مائیکروفون میں بولیں، الفاظ یہاں ظاہر ہوں گے...' : 'Speak into your microphone...'}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Call Control Buttons */}
        <div className="w-full pt-4 border-t border-[#23262d] flex items-center justify-center gap-6">
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className={`flex flex-col items-center gap-1.5 p-3.5 rounded-full transition cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-[#23262e] hover:bg-[#2e333d] text-white border border-[#373c47]'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          {/* Red Hang Up Button */}
          <button
            onClick={handleEndCall}
            id="hang-up-call-btn"
            className="flex items-center justify-center h-16 w-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-xl shadow-rose-600/40 transition cursor-pointer"
            title="End Call (کال ختم کریں)"
          >
            <PhoneOff className="h-7 w-7" />
          </button>

          {/* Speaker Button */}
          <button
            onClick={handleToggleSpeaker}
            className={`flex flex-col items-center gap-1.5 p-3.5 rounded-full transition cursor-pointer ${
              !isSpeakerOn
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-[#23262e] hover:bg-[#2e333d] text-white border border-[#373c47]'
            }`}
            title={isSpeakerOn ? 'Turn speaker off' : 'Turn speaker on'}
          >
            {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};
