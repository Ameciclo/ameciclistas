import type { DevUser } from "~/components/DevMenu";
import type { UserData, TelegramUser } from "~/utils/types";

export function createDevTelegramUser(devUser: DevUser): UserData {
  return {
    id: devUser.id,
    first_name: devUser.name.split(" ")[0],
    last_name: devUser.name.split(" ").slice(1).join(" "),
    username: `dev_${devUser.id}`,
    language_code: "pt",
    is_premium: false
  };
}

export function createDevTelegramUserWithCategories(devUser: DevUser): TelegramUser {
  return {
    id: devUser.id,
    name: devUser.name,
    categories: devUser.categories
  };
}

export function mockTelegramWebApp(devUser: DevUser | null) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    window.Telegram = {
      WebApp: {
        ready: () => {},
        platform: 'web',
        initData: '',
        initDataUnsafe: devUser ? {
          user: createDevTelegramUser(devUser)
        } : {},
        themeParams: {},
        close: () => {},
        expand: () => {},
        isExpanded: true,
        MainButton: {
          setText: () => {},
          show: () => {},
          hide: () => {},
          enable: () => {},
          disable: () => {}
        }
      }
    };
  }
}