import { Outlet } from "@remix-run/react";

export default function RecursosIndependentesLayout() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Outlet />
    </div>
  );
}