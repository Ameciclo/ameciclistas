// loaders/solicitar-pagamento-loader.ts
import { getCategories } from "~/api/firebaseConnection.server";
import { UserCategory } from "~/utils/types";

export async function loader() {
  const userCategoriesObject = await getCategories();
  const currentUserCategories: UserCategory[] = [
    process.env.NODE_ENV === "development"
      ? UserCategory.DEVELOPMENT
      : UserCategory.ANY_USER,
  ];

  return Response.json({
    currentUserCategories,
    userCategoriesObject,
  });
}
