export function isTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.Telegram?.WebApp;
}