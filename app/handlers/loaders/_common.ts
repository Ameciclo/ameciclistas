// loaders/solicitar-pagamento-loader.ts
import { json } from "@remix-run/node";
import { getUsersFirebase } from "~/api/firebaseConnection.server";
import { UserCategory } from "~/utils/types";

export async function commonLoader() {
  const usersInfo = await getUsersFirebase();
  const currentUserCategories: UserCategory[] = [
    process.env.NODE_ENV === "development"
      ? UserCategory.DEVELOPMENT
      : UserCategory.ANY_USER,
  ];

  return json({
    currentUserCategories,
    usersInfo,
  });
}
