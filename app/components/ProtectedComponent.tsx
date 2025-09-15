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
  
  if (!isDevMode && !isAuth(userPermissions, requiredPermission)) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
}