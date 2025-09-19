import { useEffect } from "react";
import { useNavigate, useOutletContext } from "@remix-run/react";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import type { DevUser } from "~/components/DevMenu";

interface AuthContextType {
  devUser: DevUser | null;
  isDevMode: boolean;
  userPermissions: UserCategory[];
  realUser: any;
}

export function useAuth() {
  const context = useOutletContext<AuthContextType>();
  
  if (!context) {
    return {
      userPermissions: [UserCategory.ANY_USER],
      isDevMode: false,
      devUser: null,
      realUser: null
    };
  }

  return context;
}

export function useAuthGuard(requiredPermission: UserCategory) {
  const { userPermissions, isDevMode, devUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verificar permissão tanto em dev quanto em produção
    if (!isAuth(userPermissions, requiredPermission)) {
      navigate('/unauthorized');
    }
  }, [userPermissions, requiredPermission, navigate]);
  
  return { userPermissions, isDevMode, devUser };
}