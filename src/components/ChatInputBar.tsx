import React, { useRef, useState, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Image as ImageIcon,
  Camera,
  FileText,
  Globe,
  X,
  Plus,
  AlertCircle,
  FileCode,
  Loader2,
  Check,
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Phone,
  HardHat,
} from 'lucide-react';
import { SupportedLanguage, ChatImage } from '../types';
import { imageProcessor } from '../services/image/imageProcessor';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { isInsideWhatsApp, isInAppBrowser, launchExternalBrowser } from '../utils/browserDetect';

interface ChatInputBarProps {
  onSendMessage: (text: string, images?: ChatImage[]) => void;
  isGenerating: boolean;
  onStopGenerating: () => void;
  speechLang: SupportedLanguage;
  onChangeSpeechLang?: (lang: SupportedLanguage) => void;
  isOnline: boolean;
  draftText?: string;
  onDraftChange?: (text: string) => void;
  onOpenCVModal?: () => void;
  onOpenUrlModal?: () => void;
  onOpenImageModal?: () => void;
  onOpenLiveCall?: () => void;
  onOpenSiteReport?: () => void;
  autoSpeakEnabled?: boolean;
  onToggleAutoSpeak?: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  isGenerating,
  onStopGenerating,
  speechLang,
  onChangeSpeechLang,
  isOnline,
  draftText = '',
  onDraftChange,
  onOpenCVModal,
  onOpenUrlModal,
  onOpenImageModal,
  onOpenLiveCall,
  onOpenSiteReport,
  autoSpeakEnabled = true,
  onToggleAutoSpeak,
}) => {
  const [inputText, setInputText] = useState(draftText);
  const [attachedImages, setAttachedImages] = useState<ChatImage[]>([]);
  const [processingImage, setProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const isUrdu = speechLang === 'ur-PK';

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const baseTextRef = useRef('');

  const [convertedNotice, setConvertedNotice] = useState(false);

  const {
    isListening,
    isStarting,
    isTranscribing,
    volume,
    duration,
    error: speechError,
    isPermissionDenied,
    clearError: clearSpeechError,
    isSupported: isSpeechSupported,
    activeEngine,
    toggleListening,
    stopListening,
    cancelListening,
    lastRecordedUrl,
    isPlayingRecording,
    playRecording,
    stopPlayingRecording,
    startListening,
  } = useSpeechRecognition();

  // Sync draft text if parent updates conversation
  useEffect(() => {
    setInputText(draftText);
  }, [draftText]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Handle paste for screenshots & clipboard images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/') || item.type === 'application/pdf') {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            await handleImageFile(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleImageFile = async (file: File) => {
    setImageError(null);
    setProcessingImage(true);
    try {
      const processed = await imageProcessor.processImageFile(file);
      setAttachedImages((prev) => [...prev, processed]);
      setShowAttachMenu(false);
    } catch (err: any) {
      setImageError(err.message || 'فائل پروسیس کرنے میں خرابی ہوئی۔');
    } finally {
      setProcessingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        handleImageFile(files[i]);
      }
    }
  };

  const removeImage = (id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    onDraftChange?.(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isGenerating) return;

    const trimmed = inputText.trim();
    if (!trimmed && attachedImages.length === 0) return;

    onSendMessage(trimmed, attachedImages);
    setInputText('');
    setAttachedImages([]);
    onDraftChange?.('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleStopMicAndApply = async () => {
    const speechResult = await stopListening();
    if (speechResult && speechResult.trim()) {
      const prefix = baseTextRef.current;
      const updated = prefix ? `${prefix} ${speechResult.trim()}` : speechResult.trim();
      setInputText(updated);
      onDraftChange?.(updated);
      setConvertedNotice(true);
      setTimeout(() => setConvertedNotice(false), 3500);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
      }, 50);
    }
  };

  const handleMicClick = async () => {
    if (isListening) {
      await handleStopMicAndApply();
      return;
    }
    if (isTranscribing || isStarting) {
      return;
    }

    baseTextRef.current = inputText.trim();

    startListening(speechLang, (speechResult) => {
      if (!speechResult) return;
      const prefix = baseTextRef.current;
      const updated = prefix ? `${prefix} ${speechResult}` : speechResult;
      setInputText(updated);
      onDraftChange?.(updated);
      setConvertedNotice(true);
      setTimeout(() => setConvertedNotice(false), 3500);

      // Auto focus textarea and position cursor at the end
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.value.length;
          textareaRef.current.selectionEnd = textareaRef.current.value.length;
        }
      }, 50);
    });
  };

  const canSend = (inputText.trim().length > 0 || attachedImages.length > 0) && !isGenerating;

  return (
    <div
      className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-2 sm:pb-3"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.jpg,.jpeg,.png,.webp,.gif"
        className="hidden"
      />
      <input
        type="file"
        ref={pdfInputRef}
        onChange={handleFileChange}
        accept="application/pdf,.pdf"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Drag & drop overlay hint */}
      {isDraggingOver && (
        <div className="mb-2 p-3 rounded-2xl border-2 border-dashed border-blue-500 bg-blue-500/10 text-blue-300 text-xs text-center font-medium animate-pulse">
          {isUrdu ? 'فائل، تصویر یا ویڈیو یہاں چھوڑیں (Drop Image/PDF/Video here)' : 'Drop photo, screenshot, PDF, or video here'}
        </div>
      )}

      {/* Active Voice Input / Transcribing Live Banner */}
      {(isListening || isTranscribing || isStarting) && (
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-[#201518] via-[#1e1f20] to-[#151a22] px-4 py-2.5 text-xs text-[#e3e3e3] shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            {/* Pulsing indicator */}
            <div className="relative flex h-3.5 w-3.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500"></span>
            </div>

            {/* Soundwave animation bars */}
            <div className="flex items-center gap-0.5 h-5 px-1">
              {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3].map((factor, i) => {
                const heightPercent = isListening
                  ? Math.max(20, Math.min(100, (volume * 100 * factor) + (factor * 35)))
                  : 25;
                return (
                  <span
                    key={i}
                    className="w-1 bg-gradient-to-t from-rose-500 to-blue-400 rounded-full transition-all duration-75"
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>

            {/* Status & Timer */}
            <div className="flex flex-col">
              <span className="font-semibold text-rose-300 text-xs flex items-center gap-1.5">
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>{isUrdu ? 'Gemini AI آواز سمجھ رہا ہے...' : 'Transcribing voice with Gemini AI...'}</span>
                  </>
                ) : isStarting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                    <span>{isUrdu ? 'مائیکروفون شروع ہو رہا ہے...' : 'Starting microphone...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isUrdu ? 'مائیک سن رہا ہے، بولیں...' : 'Microphone is active, speak now...'}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50">
                      0:{duration < 10 ? `0${duration}` : duration}
                    </span>
                  </>
                )}
              </span>
              <span className="text-[10px] text-[#8e918f]">
                {isUrdu ? 'AI آواز شناسی انجن (سپورٹڈ برائے اردو و ہندی)' : 'AI Voice Engine (Supported for Urdu, Hindi & English)'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isTranscribing && !isStarting && (
              <button
                type="button"
                onClick={handleStopMicAndApply}
                className="flex items-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 font-medium text-white text-xs transition cursor-pointer shadow-sm"
                title={isUrdu ? 'بولنا مکمل کریں' : 'Finish speaking'}
              >
                <Check className="h-3.5 w-3.5" />
                <span>{isUrdu ? 'مکمل (Done)' : 'Done'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={cancelListening}
              className="flex items-center justify-center h-7 w-7 rounded-full bg-[#2a2b2e] hover:bg-[#383a3e] text-[#c4c7c5] hover:text-white transition cursor-pointer"
              title={isUrdu ? 'منسوخ کریں' : 'Cancel'}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Recorded Audio Playback Chip (Whatever user speaks can be heard) */}
      {lastRecordedUrl && !isListening && !isTranscribing && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-blue-500/30 bg-blue-950/20 px-3 py-1.5 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isPlayingRecording ? stopPlayingRecording : playRecording}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-2.5 py-1 text-white font-medium transition cursor-pointer shadow-sm"
            >
              {isPlayingRecording ? (
                <>
                  <Square className="h-3 w-3 fill-current" />
                  <span>{isUrdu ? 'آواز بند کریں' : 'Stop voice'}</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-current" />
                  <span>{isUrdu ? 'اپنی آواز سنیں (Play my voice)' : 'Play my voice'}</span>
                </>
              )}
            </button>
            <span className="text-[11px] text-blue-300/80">
              {isUrdu ? 'آپ کی ریکارڈ شدہ آواز سنیں' : 'Recorded voice preview'}
            </span>
          </div>
        </div>
      )}

      {/* Speech error & Permission helper alert */}
      {speechError && (
        <div className="mb-2 flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-[#1e1f20] p-3 text-xs text-amber-200 shadow-lg animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-semibold text-amber-300">
                {isPermissionDenied
                  ? (isInsideWhatsApp() || isInAppBrowser()
                      ? (isUrdu ? 'واٹس ایپ براؤزر مائیکروفون بلاک کرتا ہے' : 'WhatsApp In-App Browser Blocks Microphone')
                      : (isUrdu ? 'مائیکروفون کی اجازت درکار ہے (Microphone Permission)' : 'Microphone Permission Needed'))
                  : speechError}
              </span>
              <span className="text-[11px] text-[#c4c7c5] leading-relaxed">
                {isPermissionDenied
                  ? ((isInsideWhatsApp() || isInAppBrowser())
                      ? (isUrdu
                          ? 'واٹس ایپ کا اندرونی براؤزر مائیکروفون کی اجازت نہیں دیتا۔ مائیک اور لائیو اسپیچ چلانے کے لیے نیچے دیا گیا سبز بٹن دبا کر گوگل کروم میں کھولیں۔'
                          : 'WhatsApp in-app browser does not grant microphone access. Tap the green button below to open in Google Chrome.')
                      : (typeof window !== 'undefined' && window.self !== window.top
                          ? (isUrdu
                              ? 'پریویو فریم میں مائیک بلاک ہے۔ نیچے "نئے ٹیب میں کھولیں" پر کلک کریں۔'
                              : 'Microphone is blocked in preview iframe. Click "Open in New Tab" below.')
                          : (isUrdu
                              ? 'براؤزر نے مائیکروفون بلاک کیا ہے۔ براہ کرم براؤزر کے ایڈریس بار میں لاک آئیکن پر کلک کر کے مائیکروفون Allow کریں۔'
                              : 'Microphone is blocked. Click the lock icon in the browser address bar to Allow Microphone.')))
                  : (isUrdu
                      ? 'براہ کرم دوبارہ کوشش کریں یا نیچے ٹیکسٹ ٹائپ کریں۔'
                      : 'Please retry or type your message below.')}
              </span>
            </div>
            <button
              onClick={clearSpeechError}
              className="text-[#8e918f] hover:text-white p-1"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-900/40">
            {/* WhatsApp / In-App Browser 1-Tap Chrome Launcher */}
            {(isInsideWhatsApp() || isInAppBrowser()) && (
              <button
                type="button"
                onClick={() => launchExternalBrowser()}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-sm cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{isUrdu ? 'گوگل کروم میں کھولیں (Open in Chrome)' : 'Open in Google Chrome'}</span>
              </button>
            )}

            {isPermissionDenied && !isInsideWhatsApp() && !isInAppBrowser() && typeof window !== 'undefined' && window.self !== window.top && (
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{isUrdu ? 'نئے ٹیب میں کھولیں (Open in New Tab)' : 'Open in New Tab (Fix Mic)'}</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                clearSpeechError();
                startListening(speechLang);
              }}
              className="flex items-center gap-1 rounded-lg bg-[#2e3134] hover:bg-[#3d4043] px-3 py-1.5 text-xs text-[#e3e3e3] transition cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{isUrdu ? 'دوبارہ کوشش کریں' : 'Retry'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Image / File processing error alert */}
      {imageError && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-rose-900/60 bg-[#1e1f20] px-3 py-2 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{imageError}</span>
          </div>
          <button
            onClick={() => setImageError(null)}
            className="text-[#8e918f] hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Attached image / PDF preview chips */}
      {attachedImages.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 px-2">
          {attachedImages.map((img) => {
            const isPdf = img.mimeType === 'application/pdf' || img.name?.toLowerCase().endsWith('.pdf') || img.mediaType === 'pdf';
            return (
              <div
                key={img.id}
                className="group relative flex items-center gap-2 rounded-2xl border border-[#333538] bg-[#1e1f20] p-1.5 pr-3 shadow-sm"
              >
                {isPdf ? (
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                ) : (
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                )}
                <div className="flex flex-col text-left">
                  <span className="max-w-[140px] truncate text-xs font-medium text-[#e3e3e3]">
                    {img.name}
                  </span>
                  <span className="text-[10px] text-[#8e918f]">
                    {isPdf ? 'PDF Document • ' : 'Photo • '}
                    {img.sizeBytes ? `${Math.round(img.sizeBytes / 1024)} KB` : ''}
                  </span>
                </div>
                <button
                  onClick={() => removeImage(img.id)}
                  className="ml-1 rounded-full p-1 text-[#8e918f] hover:bg-[#282a2c] hover:text-white cursor-pointer"
                  title="Remove file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Converted to text in message box confirmation banner */}
      {convertedNotice && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs text-emerald-200 shadow-md animate-in fade-in slide-in-from-bottom-1">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="font-medium">
              {isUrdu
                ? '✓ آواز کامیابی سے ٹیکسٹ میں تبدیل ہو کر میسج باکس میں درج ہو چکی ہے۔'
                : '✓ Voice converted to text and placed directly in the message box.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setConvertedNotice(false)}
            className="text-emerald-400/80 hover:text-emerald-200 p-0.5 rounded cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Quick Action Pills: Removed as per request */}
      
      {/* Floating Rounded Prompt Bar (Gemini clone style) */}
      <div className="relative flex items-end gap-2 rounded-[28px] border border-[#333538] bg-[#1e1f20] hover:border-[#444746] focus-within:border-[#5e6166] focus-within:bg-[#232427] px-3.5 py-2.5 shadow-xl transition-all">
        {/* Attachment menu trigger (+ icon button) - Only keep upload photo */}
        <div className="relative mb-0.5">
          <button
            type="button"
            id="chat-attach-btn"
            onClick={() => setShowAttachMenu((v) => !v)}
            disabled={processingImage}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#c4c7c5] hover:bg-[#2e3134] hover:text-white transition"
            title={isUrdu ? 'تصویر اپ لوڈ کریں' : 'Upload photo'}
          >
            <Plus className="h-5 w-5" />
          </button>

          {/* Attachment popover - Simplified */}
          {showAttachMenu && (
            <div className="absolute bottom-12 left-0 z-50 w-52 rounded-2xl border border-[#333538] bg-[#1e1f20] p-1.5 shadow-2xl animate-in fade-in zoom-in-95">
              <button
                type="button"
                id="attach-gallery-btn"
                onClick={() => {
                  setShowAttachMenu(false);
                  fileInputRef.current?.click();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#e3e3e3] hover:bg-[#282a2c] transition"
              >
                <ImageIcon className="h-4 w-4 text-[#7cacf8]" />
                <span>{isUrdu ? 'تصویر اپ لوڈ کریں' : 'Upload Photo'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask NOVA AI"
          rows={1}
          className="max-h-44 min-h-[38px] flex-1 resize-none bg-transparent py-2 text-sm text-[#e3e3e3] placeholder:text-[#8e918f] focus:outline-none leading-relaxed"
        />

        {/* Speaker (Auto-Speak) toggle button */}
        {onToggleAutoSpeak && (
          <button
            type="button"
            id="chat-speaker-btn"
            onClick={onToggleAutoSpeak}
            title={
              autoSpeakEnabled
                ? (isUrdu ? 'اسپیکر آن ہے: AI آواز میں جواب دے گا (کلک کر کے بند کریں)' : 'Speaker ON: AI speaks answers (Click to mute)')
                : (isUrdu ? 'اسپیکر بند ہے: AI کی آواز سننے کے لیے کلک کریں' : 'Speaker OFF: Click to enable voice output')
            }
            className={`relative mb-0.5 flex h-9 items-center gap-1.5 px-2.5 rounded-full text-xs font-medium transition cursor-pointer ${
              autoSpeakEnabled
                ? 'bg-blue-600/90 text-white shadow-sm ring-1 ring-blue-400/40 hover:bg-blue-600'
                : 'text-[#8e918f] hover:bg-[#2e3134] hover:text-[#e3e3e3]'
            }`}
          >
            {autoSpeakEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-white" />
                <span className="hidden sm:inline text-[11px] font-medium">{isUrdu ? 'اسپیکر آن' : 'Speaker ON'}</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span className="hidden sm:inline text-[11px]">{isUrdu ? 'اسپیکر' : 'Speaker'}</span>
              </>
            )}
          </button>
        )}

        {/* Real Microphone button with Dual-Engine Voice Support */}
        {isSpeechSupported && (
          <button
            type="button"
            id="chat-mic-btn"
            onClick={handleMicClick}
            disabled={isTranscribing}
            title={
              isTranscribing
                ? (isUrdu ? 'متن تیار ہو رہا ہے...' : 'Transcribing voice...')
                : isListening
                ? (isUrdu ? 'بولنا مکمل کریں اور بھیجیں' : 'Stop & transcribe')
                : (isUrdu ? 'مائیکروفون سے بولیں (Urdu Voice)' : `Voice input (${speechLang})`)
            }
            className={`relative mb-0.5 flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer ${
              isTranscribing
                ? 'bg-blue-600 text-white cursor-wait'
                : isListening
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40 ring-2 ring-rose-400/40 animate-pulse'
                : 'text-[#c4c7c5] hover:bg-[#2e3134] hover:text-white'
            }`}
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : isListening ? (
              <>
                <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-35"></span>
                <MicOff className="h-4 w-4 relative z-10" />
              </>
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Send / Stop Generating Button */}
        {isGenerating ? (
          <button
            type="button"
            id="chat-stop-btn"
            onClick={onStopGenerating}
            title="Stop generating"
            className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#e3e3e3] text-[#131314] hover:bg-white transition shadow-sm"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            id="chat-send-btn"
            onClick={handleSend}
            disabled={!canSend}
            title={!canSend ? 'Enter a prompt to send' : 'Send prompt (Enter)'}
            className={`mb-0.5 flex h-9 w-9 items-center justify-center rounded-full transition-all shadow-sm ${
              canSend
                ? 'bg-[#e3e3e3] text-[#131314] hover:bg-white hover:scale-105 cursor-pointer'
                : 'bg-[#282a2c] text-[#8e918f] cursor-not-allowed opacity-50'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Small Disclaimer Footer (Exact Gemini requirement) - Removed as per request */}
    </div>
  );
};
