import { getWorkgroups } from "~/api/cms.server";
import { TelegramUser, UserCategory, Workgroup } from "~/utils/types";
import type { LoaderFunction } from "@remix-run/node";
import { commonLoader } from "./_common";

export type LoaderData = {
  usersInfo: Record<string, TelegramUser>;
  currentUserCategories: UserCategory[];
  workgroups: Workgroup[];
};

export const loader: LoaderFunction = async () => {
  const commonData = await commonLoader();
  const workgroups: Workgroup[] = await getWorkgroups();

  return {
    ...commonData,
    workgroups,
  };
};
