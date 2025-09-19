import { useState, useEffect } from "react";

export function WebModeNotice() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  // Detectar se está no Telegram
  const isInTelegram = window.Telegram?.WebApp?.platform !== 'unknown';
  
  if (isInTelegram || process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-blue-400 text-xl">ℹ️</span>
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            <strong>Modo Web:</strong> Você está acessando fora do Telegram. 
            Para a experiência completa, acesse através do bot oficial da Ameciclo no Telegram.
          </p>
        </div>
      </div>
    </div>
  );
}