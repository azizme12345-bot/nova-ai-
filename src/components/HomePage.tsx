import React from 'react';
import {
  Sparkles,
  Mic,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Code2,
  Globe2,
  ArrowRight,
  ShieldCheck,
  Volume2,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface HomePageProps {
  onStartChat: (starterPrompt?: string) => void;
  onOpenImageStudio: () => void;
  speechLang: SupportedLanguage;
  onChangeSpeechLang: (lang: SupportedLanguage) => void;
  isDarkMode: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartChat,
  onOpenImageStudio,
  speechLang,
  onChangeSpeechLang,
  isDarkMode,
}) => {
  const isUrdu = speechLang === 'ur-PK';
  const isPunjabi = speechLang === 'pa-PK';

  const STARTER_PROMPTS = [
    {
      title: isUrdu ? 'کوڈنگ و پروگرامنگ' : 'Code & Programming',
      prompt: isUrdu
        ? 'پائتھن (Python) میں ایک ریسٹ اے پی آئی (REST API) سروس کا کوڈ لکھیں'
        : 'Write a clean, production-ready REST API in Node.js with Express and TypeScript.',
      icon: Code2,
      category: 'Development',
    },
    {
      title: isUrdu ? 'تصویر و اسکرین شاٹ تجزیہ' : 'Photo & Vision',
      prompt: isUrdu
        ? 'میں تصویر یا اسکرین شاٹ اپلوڈ کرنا چاہتا ہوں، آپ اس کا تفصیلی تجزیہ کریں۔'
        : 'How do I upload a screenshot or photo for you to analyze errors and extract text?',
      icon: FileText,
      category: 'Multimodal',
    },
    {
      title: isUrdu ? 'آواز کے ذریعے بات چیت' : 'Voice Assistant',
      prompt: isUrdu
        ? 'السلام علیکم! آپ اردو اور پنجابی میں کس طرح میری مدد کر سکتے ہیں؟'
        : 'Hello NOVA AI! What capabilities do you have for voice assistance and translation?',
      icon: Mic,
      category: 'Voice AI',
    },
    {
      title: isUrdu ? 'اے آئی سے تصویر بنائیں' : 'Generate Image',
      prompt: isUrdu
        ? 'ایک دلکش اور حقیقت پسندانہ غروب آفتاب کا منظر سرسبز پہاڑوں کے اوپر'
        : 'Create a realistic cinematic photo of snow-capped mountains during golden hour sunset.',
      icon: ImageIcon,
      category: 'Creative AI',
    },
  ];

  const CORE_FEATURES = [
    {
      icon: Mic,
      title: isUrdu ? 'قدرتی آواز و مائیکروفون' : 'Natural Voice & Speech',
      desc: isUrdu
        ? 'اردو، پنجابی اور انگلش میں بول کر بات کریں۔ مائیکروفون براہ راست آپ کی آواز کو متن میں بدلتا ہے اور جواب بول کر سناتا ہے۔'
        : 'Talk naturally using your voice. Dual-engine speech recognition transcribes your words and speaks responses aloud.',
      badge: 'Urdu • English • Punjabi',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      icon: MessageSquare,
      title: isUrdu ? 'چیٹ جی پی ٹی اسٹائل چیٹ' : 'ChatGPT-Style Intelligence',
      desc: isUrdu
        ? 'تمام پیچیدہ سوالات کے فوری و مستند جوابات حاصل کریں۔ پروگرامنگ، خطوط نویسی، سمری اور روزمرہ رہنمائی کے لیے۔'
        : 'High-precision reasoning for coding, translation, complex problem-solving, and general daily questions.',
      badge: 'Full Context Memory',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: ImageIcon,
      title: isUrdu ? 'حلال اے آئی تصویر ساز' : 'Halal AI Image Studio',
      desc: isUrdu
        ? 'اپنے پسندیدہ خیالات لکھیں اور چند سیکنڈز میں 8K کوالٹی کی خوبصورت، محفوظ اور حلال تصاویر بنا کر ڈاؤنلوڈ کریں۔'
        : 'Transform descriptive prompts into high-definition visual imagery with multiple aspect ratios and fine art styles.',
      badge: '1:1 • 16:9 • 9:16',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: FileText,
      title: isUrdu ? 'اسکرین شاٹ و دستاویز تجزیہ' : 'Photo & Document Vision',
      desc: isUrdu
        ? 'اسکرین شاٹ میں موجود کوڈ کی غلطیاں، کتاب کے صفحات یا پی ڈی ایف اپلوڈ کریں اور تفصیلی وضاحت پائیں۔'
        : 'Drag-and-drop screenshots, user interface bugs, charts, or PDF files for instant recognition and extraction.',
      badge: 'OCR & Visual Reasoning',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="min-h-full w-full bg-[#131314] text-[#e3e3e3] flex flex-col justify-between overflow-y-auto selection:bg-indigo-600 selection:text-white">
      {/* Hero Header Section */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-8 sm:pt-14 pb-12 flex flex-col items-center text-center">
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1e1f20] border border-[#333538] text-xs font-medium text-[#c4c7c5] mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>NOVA AI • Production Ready AI Assistant</span>
          <span className="text-[#8e918f]">|</span>
          <span className="text-indigo-300 font-semibold">Gemini Multi-Modal</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4 max-w-3xl leading-[1.15]">
          {isUrdu ? (
            <>
              آپ کا ذاتی <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">ذہین اے آئی اسسٹنٹ</span>
            </>
          ) : (
            <>
              Your Intelligent, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">Multilingual AI</span> Assistant
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#a8aba9] max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          {isUrdu
            ? 'قدرتی آواز، چیٹ جی پی ٹی طرز کا سادہ انٹرفیس، اسکرین شاٹ تجزیہ اور فوری تصاویر بنانے کی مکمل صلاحیت کے ساتھ۔'
            : 'Experience effortless conversations with real-time voice input, deep multimodal understanding, code generation, and instant image creation.'}
        </p>

        {/* Primary Call To Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
          <button
            type="button"
            id="home-start-chat-btn"
            onClick={() => onStartChat()}
            className="flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            <span>{isUrdu ? 'بات چیت شروع کریں (Start Chat)' : 'Start Chatting Now'}</span>
            <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180" />
          </button>

          <button
            type="button"
            id="home-image-studio-btn"
            onClick={onOpenImageStudio}
            className="flex items-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] text-white border border-[#383a3e] font-medium text-sm sm:text-base transition cursor-pointer hover:border-[#525559]"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>{isUrdu ? 'تصویر بنائیں (Generate Image)' : 'Generate AI Image'}</span>
          </button>
        </div>

        {/* Language Selection Bar */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#1e1f20] border border-[#333538] text-xs font-medium text-[#c4c7c5] mb-12">
          <Globe2 className="w-4 h-4 text-indigo-400 ml-1.5 mr-1" />
          <span className="text-[11px] text-[#8e918f]">{isUrdu ? 'زبان منتخب کریں:' : 'Voice Language:'}</span>
          <button
            type="button"
            onClick={() => onChangeSpeechLang('ur-PK')}
            className={`px-3 py-1 rounded-xl transition ${
              speechLang === 'ur-PK'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'hover:text-white hover:bg-[#282a2c]'
            }`}
          >
            اردو (Urdu)
          </button>
          <button
            type="button"
            onClick={() => onChangeSpeechLang('en-US')}
            className={`px-3 py-1 rounded-xl transition ${
              speechLang === 'en-US'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'hover:text-white hover:bg-[#282a2c]'
            }`}
          >
            English (US)
          </button>
          <button
            type="button"
            onClick={() => onChangeSpeechLang('pa-PK')}
            className={`px-3 py-1 rounded-xl transition ${
              speechLang === 'pa-PK'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'hover:text-white hover:bg-[#282a2c]'
            }`}
          >
            پنجابی (Punjabi)
          </button>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left mb-14">
          {CORE_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative p-5 sm:p-6 rounded-2xl bg-[#1e1f20]/90 border border-[#2d2f32] hover:border-[#43464a] transition-all flex flex-col justify-between hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl border ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#131314] text-[#8e918f] border border-[#282a2c]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-300 transition">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#a8aba9] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Starter Prompts */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8e918f] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{isUrdu ? 'براہ راست بات شروع کریں' : 'Instant Starter Prompts'}</span>
            </h2>
            <span className="text-xs text-[#8e918f]">
              {isUrdu ? 'ایک کلک پر چیٹ شروع کریں' : 'Click any prompt to begin'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {STARTER_PROMPTS.map((starter, i) => {
              const Icon = starter.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onStartChat(starter.prompt)}
                  className="flex items-start gap-3.5 p-4 rounded-xl bg-[#1e1f20] hover:bg-[#282a2c] border border-[#2d2f32] hover:border-[#4d5055] transition text-left cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-[#131314] text-indigo-400 group-hover:text-white transition shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition block mb-1">
                      {starter.title}
                    </span>
                    <p className="text-xs text-[#8e918f] line-clamp-2 leading-relaxed">
                      "{starter.prompt}"
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Trust Section */}
      <footer className="w-full border-t border-[#2d2f32] bg-[#171819] py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8e918f]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isUrdu
                ? 'محفوظ، نجی اور حلال معیارات سے ہم آہنگ AI'
                : 'Secure, private and verified AI assistant platform'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>WhatsApp & Android Optimized</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Google Search Console Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
