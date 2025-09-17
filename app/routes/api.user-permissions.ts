import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getUsersFirebase } from "~/api/firebaseConnection.server";
import { UserCategory } from "~/utils/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return json({ role: UserCategory.ANY_USER });
  }

  try {
    const users = await getUsersFirebase();
    const user = users?.[userId];
    
    if (!user?.role) {
      return json({ role: UserCategory.ANY_USER });
    }

    return json({ role: user.role });
  } catch (error) {
    console.error("Erro ao buscar permissões do usuário:", error);
    return json({ role: UserCategory.ANY_USER });
  }
}