// hooks/useAuthorization.ts
import { useEffect, useState } from "react";
import { getUserCategories } from "../api/users";
import { UserCategory } from "~/api/types";

export function useAuthorization(requiredCategory: UserCategory) {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let userId;
    const isDevelopment = process.env.NODE_ENV === "development";
    
    // show on console if user is in development
    console.log("User ID:", userId);

    // check permissions for production
    // show on console if user is not authorized
    console.log("User is not authorized:",!isAuthorized);

    if (isDevelopment) {
      fetch("./app/mockup/telegram-user.json")
        .then((response) => response.json())
        .then((data) => {
          userId = data.id;
          checkPermissions(userId);
          console.log(userId);
        })
        .catch((error) => {
          console.error(
            "Error loading the user ID from devUserId.json:",
            error
          );
        });
    } else {
      const telegram = (window as any)?.Telegram?.WebApp;
      userId = telegram?.initDataUnsafe?.user?.id;

      if (!userId) {
        console.error("User ID is undefined. Closing the app.");
        telegram?.close();
        return;
      }
      checkPermissions(userId);
    }
  }, []);

  const checkPermissions = (userId: number) => {
    const userCategories = getUserCategories(userId);
    setIsAuthorized(userCategories.includes(requiredCategory));
  };

  return isAuthorized;
}
