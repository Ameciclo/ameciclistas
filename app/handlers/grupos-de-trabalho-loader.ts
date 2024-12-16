import { getWorkgroups } from "~/api/cms.server";
import { TelegramUser, UserCategory, Workgroup } from "~/utils/types";
import type { LoaderFunction } from "@remix-run/node";

export type LoaderData = {
  userCategoriesObject: Record<string, TelegramUser>;
  currentUserCategories: UserCategory[];
  workgroups: Workgroup[];
};

export const loader: LoaderFunction = async () => {
  const userCategoriesObject = {}; // Substitua com a lógica real
  const currentUserCategories: UserCategory[] = [
    process.env.NODE_ENV === "development"
      ? UserCategory.DEVELOPMENT
      : UserCategory.ANY_USER,
    UserCategory.AMECICLISTAS,
  ];
  const workgroups: Workgroup[] = await getWorkgroups();

  return {
    userCategoriesObject,
    currentUserCategories,
    workgroups,
  };
};
