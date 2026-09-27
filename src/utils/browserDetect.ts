/**
 * Browser & WebView Detection Utilities
 * Special handling for WhatsApp In-App Browser, Facebook, Instagram, and Android WebViews
 */

export function isInsideWhatsApp(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /WhatsApp/i.test(ua);
}

export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /WhatsApp|FBAN|FBAV|Instagram|Line|Twitter|MicroMessenger/i.test(ua) ||
    (/\bwv\b/i.test(ua) && /Android/i.test(ua));
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Generates an Android Intent URL that launches Google Chrome directly
 * to bypass WhatsApp WebView restrictions (microphone, speech recognition, audio)
 */
export function getChromeIntentUrl(): string {
  if (typeof window === 'undefined') return '';
  const currentUrl = window.location.href;
  const urlWithoutProtocol = currentUrl.replace(/^https?:\/\//i, '');
  return `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;end`;
}

/**
 * Attempts to launch Google Chrome or external browser
 */
export function launchExternalBrowser(): boolean {
  if (typeof window === 'undefined') return false;

  if (isAndroid()) {
    const intentUrl = getChromeIntentUrl();
    try {
      window.location.href = intentUrl;
      return true;
    } catch {
      window.open(window.location.href, '_blank');
      return false;
    }
  } else {
    // iOS Safari
    window.open(window.location.href, '_blank');
    return true;
  }
}
