import type { LoaderFunctionArgs } from "@remix-run/node";
import { loadAllLinksUteis } from "~/handlers/loaders/links-uteis";
import { generateRedirectJson } from "~/api/cloudflare.server";
import { requireAuth } from "~/utils/authMiddleware";
import { UserCategory } from "~/utils/types";

async function originalLoader({ request }: LoaderFunctionArgs) {
  const links = await loadAllLinksUteis();
  const domain = process.env.AMECICLO_DOMAIN || 'ameciclo.org';

  const redirects = links
    .filter(l => l.subdomain && !l.url.includes(`${l.subdomain}.${domain}`))
    .map(l => ({
      source_url: `https://${l.subdomain}.${domain}/`,
      target_url: l.url,
      status_code: 301,
    }));

  const json = generateRedirectJson(redirects);

  return new Response(JSON.stringify(json, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ameciclo-redirects.json"',
    },
  });
}

export const loader = requireAuth(UserCategory.PROJECT_COORDINATORS)(originalLoader);
