import { useAuth } from "~/utils/useAuth";

export function TelegramUserInput() {
  const { isDevMode, devUser } = useAuth();
  
  const getUserId = () => {
    if (isDevMode && devUser) {
      return devUser.id.toString();
    }
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      return window.Telegram.WebApp.initDataUnsafe.user.id.toString();
    }
    
    return "";
  };
  
  return <input type="hidden" name="user_id" value={getUserId()} />;
}