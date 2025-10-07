export function isTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Verificar se o Telegram WebApp está disponível
  const hasTelegramWebApp = !!window.Telegram?.WebApp;
  
  if (!hasTelegramWebApp) return false;
  
  // Verificar se tem dados de inicialização ou plataforma
  const webApp = window.Telegram.WebApp;
  const hasInitData = !!webApp.initData;
  const hasPlatform = !!webApp.platform;
  const hasUser = !!webApp.initDataUnsafe?.user;
  
  // Verificar User Agent como fallback
  const userAgent = window.navigator?.userAgent || '';
  const isTelegramUserAgent = userAgent.includes('TelegramBot') || userAgent.includes('Telegram');
  
  const isTelegramDetected = hasInitData || hasPlatform || hasUser || isTelegramUserAgent;
  
  // Debug sempre (remover em produção final)
  console.log('Telegram Detection:', {
    hasTelegramWebApp,
    hasInitData,
    hasPlatform,
    hasUser,
    isTelegramUserAgent,
    isTelegramDetected,
    platform: webApp.platform,
    userAgent: userAgent.substring(0, 50) + '...'
  });
  
  return isTelegramDetected;
}