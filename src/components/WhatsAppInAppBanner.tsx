import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Smartphone } from 'lucide-react';
import { isInsideWhatsApp, isInAppBrowser, isAndroid, isIOS, launchExternalBrowser } from '../utils/browserDetect';

interface WhatsAppInAppBannerProps {
  speechLang?: string;
}

export const WhatsAppInAppBanner: React.FC<WhatsAppInAppBannerProps> = ({ speechLang = 'ur-PK' }) => {
  const [visible, setVisible] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  const isUrdu = speechLang === 'ur-PK';

  useEffect(() => {
    // Check if running in WhatsApp or in-app browser
    const dismissed = sessionStorage.getItem('vega_whatsapp_banner_dismissed');
    if (!dismissed && (isInsideWhatsApp() || isInAppBrowser())) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleOpenExternal = () => {
    if (isAndroid()) {
      launchExternalBrowser();
    } else if (isIOS()) {
      setShowIosTip(true);
    } else {
      launchExternalBrowser();
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('vega_whatsapp_banner_dismissed', 'true');
  };

  return (
    <div
      id="whatsapp-inapp-banner"
      className="relative z-40 w-full bg-gradient-to-r from-[#075e54]/95 via-[#128c7e]/90 to-[#075e54]/95 border-b border-emerald-500/40 px-3 py-2 text-white shadow-md transition-all animate-in slide-in-from-top-2"
    >
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-950/60 border border-emerald-300/50 shrink-0">
            <Smartphone className="h-3.5 w-3.5 text-emerald-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white tracking-wide">
              {isUrdu
                ? 'واٹس ایپ ان-ایپ براؤزر متحرک ہے'
                : 'WhatsApp In-App Browser detected'}
            </span>
            <span className="text-[11px] text-emerald-100/90 leading-tight">
              {isUrdu
                ? 'مائیکروفون اور تیز ترین آڈیو کے لیے گوگل کروم یا سفاری میں کھولیں۔'
                : 'For full microphone permissions and real-time voice, open in Chrome or Safari.'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenExternal}
            className="flex items-center gap-1.5 rounded-full bg-white hover:bg-emerald-50 text-[#075e54] font-bold px-3 py-1 text-xs shadow-sm transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title={isUrdu ? 'گوگل کروم میں کھولیں' : 'Open in Google Chrome'}
          >
            <ExternalLink className="h-3 w-3" />
            <span>{isUrdu ? 'کروم میں کھولیں' : 'Open in Chrome'}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-white/70 hover:text-white p-1 rounded-full hover:bg-emerald-800/40 transition cursor-pointer"
            title={isUrdu ? 'بند کریں' : 'Dismiss'}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showIosTip && (
        <div className="mt-2 pt-2 border-t border-emerald-400/30 text-[11px] text-emerald-100 flex items-center justify-between">
          <span>
            {isUrdu
              ? '💡 آئی فون کے لیے: اوپر دائیں کونے میں تین نقطوں (⋮) یا شیئر آئیکن پر کلک کر کے "Open in Safari" منتخب کریں۔'
              : '💡 On iPhone: Tap the three dots (⋮) or share icon at the top and select "Open in Safari" or "Open in Chrome".'}
          </span>
          <button
            type="button"
            onClick={() => setShowIosTip(false)}
            className="text-xs underline ml-2 cursor-pointer"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
