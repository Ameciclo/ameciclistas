import { Link, Outlet, useOutletContext } from "@remix-run/react";

export default function BotaPraRodarLayout() {
  const context = useOutletContext();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Link to="/" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu Principal
        </Link>
      </div>

      <Outlet context={context} />

      <div className="mt-8">
        <Link
          to="/"
          className="button-secondary-full text-center"
        >
          ⬅️ Voltar ao Menu Principal
        </Link>
      </div>
    </div>
  );
}
