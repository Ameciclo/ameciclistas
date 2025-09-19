import { ReactNode } from "react";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { useAuth } from "~/utils/useAuth";
import Unauthorized from "~/components/Unauthorized";

interface ProtectedComponentProps {
  children: ReactNode;
  requiredPermission: UserCategory;
  fallback?: ReactNode;
}

export function ProtectedComponent({ 
  children, 
  requiredPermission,
  fallback
}: ProtectedComponentProps) {
  const { userPermissions, isDevMode } = useAuth();
  
  // Em modo dev, sempre permitir acesso se o usuário tem a permissão
  // Em produção, verificar normalmente
  const hasPermission = isAuth(userPermissions, requiredPermission);
  
  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
}