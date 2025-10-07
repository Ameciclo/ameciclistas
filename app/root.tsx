import type { MetaFunction, LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { DevProvider } from "~/utils/devContext";
import { DevMenu } from "~/components/DevMenu";
import { useDevContext } from "~/utils/devContext";
import { getWebUser } from "~/api/webAuth.server";

import stylesheet from "~/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/images/apenas logo da ameciclo.svg", type: "image/svg+xml" },
];

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8" },
    { title: "Ameciclobot Mini App" },
    { viewport: "width=device-width,initial-scale=1" }
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const webUser = await getWebUser(request);
  return json({ webUser });
}

function AppContent() {
  const { devUser, setDevUser, isDevMode, userPermissions, realUser } = useDevContext();
  const { webUser } = useLoaderData<typeof loader>();

  return (
    <>
      {isDevMode && (
        <DevMenu currentUser={devUser} onUserChange={setDevUser} />
      )}
      <div className={isDevMode ? "pt-12" : ""}>
        <Outlet context={{ 
          devUser, 
          isDevMode, 
          userPermissions, 
          realUser,
          webUser
        }} />
      </div>
    </>
  );
}

export default function App() {
  return (
    <html lang="pt-BR">
      <head>
        <Meta />
        <Links />
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
      </head>
      <body>
        <DevProvider>
          <AppContent />
        </DevProvider>
        <ScrollRestoration />
        <Scripts />
        {/* <LiveReload /> */}
      </body>
    </html>
  );
}
