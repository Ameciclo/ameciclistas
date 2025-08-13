import { commonLoader } from "./_common";
import { getSuppliers } from "~/api/firebaseConnection.server";

export async function loader(args: any) {
  const commonData = await commonLoader(args);
  const suppliers = await getSuppliers();
  
  return {
    ...commonData,
    suppliers: suppliers || {}
  };
}
