// hooks/useAuthorization.ts
import { useEffect, useState } from "react";
import { getUserCategories } from "../api/users";
import { UserCategory } from "~/api/types";

export function useAuthorization(requiredCategory: UserCategory) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      setIsAuthorized(true);
      return;
    }

    const telegram = (window as any)?.Telegram?.WebApp;
    const userId = telegram?.initDataUnsafe?.user?.id;

    if (!userId) {
      console.error("User ID is undefined. Closing the app.");
      telegram?.close();
      return;
    }

    const userCategories = getUserCategories(userId);
    setIsAuthorized(userCategories.includes(requiredCategory));
  }, []);

  return isAuthorized;
}
