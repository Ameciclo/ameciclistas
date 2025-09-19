import { redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { getUsersFirebase } from "~/api/firebaseConnection.server";

export async function getUserPermissions(request: Request): Promise<{ userPermissions: UserCategory[] }> {
  // Em desenvolvimento, sempre usar cookie do DevMode
  if (process.env.NODE_ENV === "development") {
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const devUserMatch = cookieHeader.match(/devUser=([^;]+)/);
      if (devUserMatch) {
        try {
          const devUser = JSON.parse(decodeURIComponent(devUserMatch[1]));
          return { userPermissions: devUser.categories || [UserCategory.ANY_USER] };
        } catch (e) {
          console.warn('Erro ao parsear devUser do cookie:', e);
        }
      }
    }
    return { userPermissions: [UserCategory.ANY_USER] };
  }

  // Em produção, tentar obter do Telegram
  try {
    // Primeiro tentar do query params
    const url = new URL(request.url);
    let userId = url.searchParams.get("user_id");
    
    // Se não tiver, tentar do formData (para POSTs)
    if (!userId && request.method === "POST") {
      try {
        const formData = await request.clone().formData();
        userId = formData.get("user_id") as string;
      } catch (e) {
        // Ignorar erro de parsing
      }
    }
    
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