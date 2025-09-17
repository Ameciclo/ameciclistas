import { redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { getUsersFirebase } from "~/api/firebaseConnection.server";

export async function getUserPermissions(request: Request): Promise<{ userPermissions: UserCategory[] }> {
  // Em desenvolvimento, extrair do contexto ou cookies
  if (process.env.NODE_ENV === "development") {
    // Tentar obter do cookie do DevMode
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const devUserMatch = cookieHeader.match(/devUser=([^;]+)/);
      if (devUserMatch) {
        try {
          const devUser = JSON.parse(decodeURIComponent(devUserMatch[1]));
          return { userPermissions: devUser.categories || [UserCategory.ANY_USER] };
        } catch (e) {
          // Fallback para ANY_USER se não conseguir parsear
        }
      }
    }
    return { userPermissions: [UserCategory.ANY_USER] };
  }

  try {
    // Extrair dados do usuário do Telegram via headers ou cookies
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");
    
    if (!userId) {
      return { userPermissions: [UserCategory.ANY_USER] };
    }

    const users = await getUsersFirebase();
    const user = users?.[userId];
    
    if (!user?.role) {
      return { userPermissions: [UserCategory.ANY_USER] };
    }

    return { userPermissions: [user.role as UserCategory] };
  } catch (error) {
    console.error("Erro ao obter permissões:", error);
    return { userPermissions: [UserCategory.ANY_USER] };
  }
}

export function requireAuth(permission: UserCategory) {
  return (loader: LoaderFunction) => {
    return async (args: LoaderFunctionArgs) => {
      const { userPermissions } = await getUserPermissions(args.request);
      
      if (!isAuth(userPermissions, permission)) {
        throw redirect('/unauthorized');
      }
      
      return loader(args);
    };
  };
}