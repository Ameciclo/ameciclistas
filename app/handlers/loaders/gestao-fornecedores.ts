import { commonLoader } from "./_common";
import { getSuppliers } from "~/api/firebaseConnection.server";
import { UserCategory } from "~/utils/types";

export async function loader(args: any) {
  try {
    const commonData = await commonLoader(args);
    const suppliers = await getSuppliers();
    
    return {
      ...commonData,
      suppliers: suppliers || {}
    };
  } catch (error) {
    console.error('Erro no loader de gestão de fornecedores:', error);
    return {
      currentUserCategories: [UserCategory.ANY_USER],
      usersInfo: {},
      suppliers: {}
    };
  }
}
