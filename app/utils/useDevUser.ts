import { useOutletContext } from "@remix-run/react";
import type { DevUser } from "~/components/DevMenu";
import type { UserCategory } from "~/utils/types";

interface OutletContext {
  devUser: DevUser | null;
  isDevMode: boolean;
}

export function useDevUser() {
  const context = useOutletContext<OutletContext>();
  
  if (!context) {
    return {
      devUser: null,
      isDevMode: false,
      getUserId: () => null,
      getUserCategories: () => [],
      hasCategory: () => false
    };
  }

  const { devUser, isDevMode } = context;

  return {
    devUser,
    isDevMode,
    getUserId: () => devUser?.id || null,
    getUserCategories: () => devUser?.categories || [],
    hasCategory: (category: UserCategory) => 
      devUser?.categories.includes(category) || false
  };
}