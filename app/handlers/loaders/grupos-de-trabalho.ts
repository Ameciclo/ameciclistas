import { getWorkgroups } from "~/api/firebaseConnection.server";
import { TelegramUser, UserCategory, FirebaseWorkgroup } from "~/utils/types";
import type { LoaderFunction } from "@remix-run/node";
import { commonLoader } from "./_common";

export type LoaderData = {
  usersInfo: Record<string, TelegramUser>;
  currentUserCategories: UserCategory[];
  workgroups: FirebaseWorkgroup[];
};

export const loader: LoaderFunction = async () => {
  const commonData = await commonLoader();
  const allWorkgroups: FirebaseWorkgroup[] = await getWorkgroups();

  const workgroups = allWorkgroups.filter((group) => !group.labels?.oculto);

  return {
    ...commonData,
    workgroups,
  };
};
