export function isTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Verificar múltiplas formas de detectar Telegram
  const hasTelegramWebApp = !!window.Telegram?.WebApp;
  const hasTelegramInitData = !!window.Telegram?.WebApp?.initData;
  const userAgent = window.navigator?.userAgent || '';
  const isTelegramUserAgent = userAgent.includes('TelegramBot') || userAgent.includes('Telegram');
  
  // Debug em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('Telegram Detection:', {
      hasTelegramWebApp,
      hasTelegramInitData,
      isTelegramUserAgent,
      userAgent
    });
  }
  
  return hasTelegramWebApp && (hasTelegramInitData || isTelegramUserAgent);
}