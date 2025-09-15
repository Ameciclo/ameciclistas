import { Outlet } from "@remix-run/react";
import { useAuth } from "~/utils/useAuth";

export default function RecursosIndependentesLayout() {
  const authContext = useAuth();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Outlet context={authContext} />
    </div>
  );
}