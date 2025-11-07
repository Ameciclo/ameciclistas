import { redirect, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { getWebUser } from "~/api/webAuth.server";
import { getUserPermissions } from "~/utils/authMiddleware";

export async function getUnifiedUserPermissions(request: Request): Promise<{ 
  userPermissions: UserCategory[];
  isWebUser: boolean;
  webUser?: any;
}> {
  // Primeiro, tentar obter usuário web
  const webUser = await getWebUser(request);
  
  if (webUser) {
    return {
      userPermissions: [webUser.category],
      isWebUser: true,
      webUser
    };
  }
  
  // Se não é usuário web, usar lógica Telegram existente
  const { userPermissions } = await getUserPermissions(request);
  return {
    userPermissions,
    isWebUser: false
  };
}

export function requireWebAuth(permission: UserCategory) {
  return (loader: LoaderFunction) => {
    return async (args: LoaderFunctionArgs) => {
      const { userPermissions, isWebUser } = await getUnifiedUserPermissions(args.request);
      
      console.log('🔐 Web Auth Debug:', {
        url: args.request.url,
        requiredPermission: permission,
        userPermissions,
        isWebUser,
        isAuthorized: isAuth(userPermissions, permission)
      });
      
      if (!isAuth(userPermissions, permission)) {
        // Se não é usuário web, redirecionar para login
        if (!isWebUser) {
          throw redirect('/login');
        }
        // Se é usuário web mas sem permissão, mostrar unauthorized
        throw redirect('/unauthorized');
      }
      
      return loader(args);
    };
  };
}