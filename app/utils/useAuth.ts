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
  const context = useOutletContext<AuthContextType & { webUser?: any }>();
  
  if (!context) {
    return {
      userPermissions: [UserCategory.ANY_USER],
      isDevMode: false,
      devUser: null,
      realUser: null
    };
  }

  // Se tem webUser, usar suas permissões com hierarquia
  if (context.webUser) {
    const hierarchyMap = {
      [UserCategory.AMECICLO_COORDINATORS]: [
        UserCategory.ANY_USER,
        UserCategory.AMECICLISTAS, 
        UserCategory.PROJECT_COORDINATORS,
        UserCategory.AMECICLO_COORDINATORS
      ],
      [UserCategory.PROJECT_COORDINATORS]: [
        UserCategory.ANY_USER,
        UserCategory.AMECICLISTAS,
        UserCategory.PROJECT_COORDINATORS
      ],
      [UserCategory.AMECICLISTAS]: [
        UserCategory.ANY_USER,
        UserCategory.AMECICLISTAS
      ],
      [UserCategory.ANY_USER]: [
        UserCategory.ANY_USER
      ]
    };
    
    const webUserPermissions = hierarchyMap[context.webUser.category] || [UserCategory.ANY_USER];
    
    return {
      ...context,
      userPermissions: webUserPermissions
    };
  }

  return context;
}

export function useAuthGuard(requiredPermission: UserCategory) {
  const { userPermissions, isDevMode, devUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isDevMode && !isAuth(userPermissions, requiredPermission)) {
      navigate('/unauthorized');
    }
  }, [userPermissions, isDevMode, requiredPermission, navigate]);
  
  return { userPermissions, isDevMode, devUser };
}