import React, { useState } from 'react';
import {
  X,
  ClipboardList,
  CheckCircle2,
  Copy,
  Share2,
  Send,
  Building,
  Users,
  HardHat,
  PackageCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface SiteRoundReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertReportToChat: (reportText: string) => void;
  speechLang: SupportedLanguage;
}

export const SiteRoundReportModal: React.FC<SiteRoundReportModalProps> = ({
  isOpen,
  onClose,
  onInsertReportToChat,
  speechLang,
}) => {
  const isUrdu = speechLang === 'ur-PK' || speechLang === 'pa-PK';
  const todayDate = new Date().toISOString().split('T')[0];

  const [siteName, setSiteName] = useState('مین پراجیکٹ سائیٹ (Main Site)');
  const [supervisorName, setSupervisorName] = useState('Aziz (سائیٹ سپروائزر)');
  const [reportDate, setReportDate] = useState(todayDate);
  const [shift, setShift] = useState('صبح و شام فل راؤنڈ (Full Day Shift)');
  const [workDone, setWorkDone] = useState(
    'بنیادوں اور ستونوں کا شٹرنگ ورک مکمل کیا گیا۔ چنائی و پلاسٹر کا کام شیڈول کے مطابق جاری رہا۔'
  );
  const [masonsCount, setMasonsCount] = useState('4');
  const [laborCount, setLaborCount] = useState('8');
  const [materialsStatus, setMaterialsStatus] = useState(
    'سیمنٹ، ریت، بجری اور سریا وافر مقدار میں سائیٹ پر موجود ہے۔ مشینیں درست حالت میں کام کر رہی ہیں۔'
  );
  const [safetyNotes, setSafetyNotes] = useState(
    'تمام ورکرز سیفٹی ہیلمٹ و جیکٹس کے ساتھ کام پر موجود رہے۔ کیورنگ کا عمل مکمل کیا گیا۔ کوئی حادثہ پیش نہیں آیا۔'
  );
  const [tomorrowPlan, setTomorrowPlan] = useState(
    'اگلے بلاک کی کنکریٹ پورنگ اور شٹرنگ کا فائنل لیول چیک کرنا۔'
  );
  const [generatedReport, setGeneratedReport] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const formatted = `### 📋 ڈیلی سائٹ راؤنڈ و پروگریس رپورٹ (Daily Site Round & Inspection Report)

**تاریخ:** ${reportDate}  
**سائیٹ / پراجیکٹ کا نام:** ${siteName}  
**انسپیکٹر / سپروائزر:** ${supervisorName}  
**شفٹ:** ${shift}  
**اسٹیٹس:** فعال اور تسلی بخش (Active & Verified)

---

#### 1. 🏗️ آج کا مکمل کام اور سائیٹ پیش رفت (Work Progress)
${workDone}

#### 2. 👷 سائیٹ افرادی قوت و لیبر حاضری (Manpower Count)
- **مستری / ہنرمند کاریگر:** ${masonsCount} افراد
- **لیبر / مددگار:** ${laborCount} افراد
- **مجموعی عملہ:** ${Number(masonsCount || 0) + Number(laborCount || 0) + 1} افراد حاضر

#### 3. 📦 مٹیریل و مشینری اسٹیٹس (Materials & Equipment)
${materialsStatus}

#### 4. 🦺 سیفٹی، کوالٹی معائنہ و اسنیگ (Safety & Snags)
${safetyNotes}

#### 5. 🎯 اگلے دن کا ہدف (Tomorrow's Target)
${tomorrowPlan}

---
*تیار کردہ: NOVA AI • ڈیلی سائٹ سپروائزر اسسٹنٹ*`;

    setGeneratedReport(formatted);
  };

  const handleCopy = async () => {
    if (!generatedReport) return;
    try {
      await navigator.clipboard.writeText(generatedReport);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  const handleShareWhatsApp = () => {
    if (!generatedReport) return;
    const encoded = encodeURIComponent(generatedReport);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSendToChat = () => {
    if (!generatedReport) return;
    onInsertReportToChat(generatedReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="flex flex-col w-full max-w-2xl max-h-[92vh] rounded-2xl border border-[#333742] bg-[#1a1c22] text-[#e3e3e3] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d303a] px-5 py-4 bg-[#14151a]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <HardHat className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{isUrdu ? 'ڈیلی سائٹ راؤنڈ و پروگریس رپورٹ' : 'Daily Site Round & Progress Report'}</span>
                <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  1-Minute Fast
                </span>
              </h2>
              <span className="text-[11px] text-[#8e918f]">
                {isUrdu ? 'سائیٹ راؤنڈ کے بعد ایک منٹ میں مکمل تفصیلی رپورٹ تیار کریں' : 'Generate professional construction site logs instantly'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#282b35] hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {!generatedReport ? (
            <div className="space-y-4">
              {/* Row 1: Site Name & Supervisor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#c4c7c5] mb-1">
                    {isUrdu ? 'سائیٹ / پراجیکٹ کا نام' : 'Site / Project Name'}
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full rounded-xl border border-[#373b47] bg-[#121317] p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#c4c7c5] mb-1">
                    {isUrdu ? 'سپروائزر / انسپکٹر کا نام' : 'Supervisor / Inspector Name'}
                  </label>
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    className="w-full rounded-xl border border-[#373b47] bg-[#121317] p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row 2: Date & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#c4c7c5] mb-1">
                    {isUrdu ? 'تاریخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full rounded-xl border border-[#373b47] bg-[#121317] p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#c4c7c5] mb-1">
                    {isUrdu ? 'شفٹ / راؤنڈ کا وقت' : 'Shift / Round Timing'}
                  </label>
                  <input
                    type="text"
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full rounded-xl border border-[#373b47] bg-[#121317] p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Work Done Today */}
              <div>
                <label className="block text-xs font-semibold text-[#c4c7c5] mb-1">
                  {isUrdu ? '1. آج کا مکمل کام اور پیش رفت (Work Progress)' : '1. Work Executed Today'}
                </label>
                <textarea
                  rows={2}
                  value={workDone}
                  onChange={(e) => setWorkDone(e.target.value)}
                  className="w-full rounded-xl border border-[#373b47] bg-[#121317] p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Manpower */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#c4c7c5] mb-1">
                    {isUrdu ? 'مستری / ہنرمند (Masons)' : 'Masons Count'}
                  </label>
                  <input
                    type="number"
                    value={masonsCount}
                    onChange={(e) => setMasonsCount(e.target.value)}
                    className="w-full rounded-xl border border-[#373b47] bg-[#121317] p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#c4c7c5] mb-1">
                    {isUrdu ? 'مزدور / ہیلپر (Laborers)' : 'Laborers Count'}
                  </label>
                  <input
                    type="number"
                    value={laborCount}
                    onChange={(e) => setLaborCount(e.target.value)}
                    className="w-full rounded-xl border border-[#373b47] bg-[#121317] p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Material & Equipment */}
              <div>
                <label className="block text-xs font-semibold text-[#c4c7c5] mb-1">
                  {isUrdu ? '3. مٹیریل و مشینری اسٹیٹس' : '3. Material & Equipment Status'}
                </label>
                <input
                  type="text"
                  value={materialsStatus}
                  onChange={(e) => setMaterialsStatus(e.target.value)}
                  className="w-full rounded-xl border border-[#373b47] bg-[#121317] p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Safety & Snags */}
              <div>
                <label className="block text-xs font-semibold text-[#c4c7c5] mb-1">
                  {isUrdu ? '4. سیفٹی و معائنہ نوٹس' : '4. Safety & Snags Inspection'}
                </label>
                <input
                  type="text"
                  value={safetyNotes}
                  onChange={(e) => setSafetyNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#373b47] bg-[#121317] p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Tomorrow's Plan */}
              <div>
                <label className="block text-xs font-semibold text-[#c4c7c5] mb-1">
                  {isUrdu ? '5. کل کا ہدف (Tomorrow Target)' : "5. Tomorrow's Action Plan"}
                </label>
                <input
                  type="text"
                  value={tomorrowPlan}
                  onChange={(e) => setTomorrowPlan(e.target.value)}
                  className="w-full rounded-xl border border-[#373b47] bg-[#121317] p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                id="generate-site-report-btn"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 cursor-pointer transition"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isUrdu ? 'ایک منٹ میں رپورٹ تیار کریں' : 'Generate Full Report Now'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#373b47] bg-[#121317] p-4 text-xs font-mono text-[#dcdfe4] whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto select-text">
                {generatedReport}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => setGeneratedReport('')}
                  className="rounded-xl border border-[#373b47] bg-[#22252e] hover:bg-[#2c303c] px-3.5 py-2 font-medium text-slate-300 transition"
                >
                  {isUrdu ? 'ترمیم کریں (Edit)' : 'Edit Details'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-xl border border-[#373b47] bg-[#22252e] hover:bg-[#2c303c] px-3.5 py-2 font-medium text-slate-300 transition"
                  >
                    {isCopied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{isCopied ? (isUrdu ? 'کاپی ہو گئی!' : 'Copied!') : (isUrdu ? 'کاپی کریں' : 'Copy')}</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 font-medium text-white transition"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={handleSendToChat}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 font-semibold text-white transition shadow-md"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isUrdu ? 'چیٹ میں داخل کریں' : 'Insert to Chat'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
