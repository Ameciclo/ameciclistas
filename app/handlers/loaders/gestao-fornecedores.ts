import { commonLoader } from "./_common";
import { getSuppliers } from "~/api/firebaseConnection.server";
import { Supplier, TelegramUser, UserCategory } from "~/utils/types";

export type LoaderData = {
  usersInfo: TelegramUser;
  currentUserCategories: UserCategory[];
  suppliers: Supplier;
};

export async function loader() {
  try {
    const commonData = await commonLoader();
    const suppliers = await getSuppliers();

    return {
      ...commonData,
      suppliers: suppliers || {},
    };
  } catch (error) {
    console.error("Erro no loader de gestão de fornecedores:", error);
    return {
      currentUserCategories: [UserCategory.ANY_USER],
      usersInfo: {},
      suppliers: {},
    };
  }
}
