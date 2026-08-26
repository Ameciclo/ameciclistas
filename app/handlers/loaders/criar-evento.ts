import { commonLoader } from "./_common";
import { getWorkgroups } from "~/api/firebaseConnection.server";
import { FirebaseWorkgroup } from "~/utils/types";

export const loader = async () => {
  const commonData = await commonLoader();
  const allWorkgroups: FirebaseWorkgroup[] = await getWorkgroups();

  const workgroups = allWorkgroups
    .filter((group) => !group.labels?.oculto)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  return {
    ...commonData,
    workgroups,
  };
};
