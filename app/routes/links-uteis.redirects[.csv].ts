import type { LoaderFunctionArgs } from "@remix-run/node";
import { loadAllLinksUteis } from "~/handlers/loaders/links-uteis";
import { generateRedirectCsv } from "~/api/cloudflare.server";
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

  const csv = generateRedirectCsv(redirects);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ameciclo-redirects.csv"',
    },
  });
}

export const loader = requireAuth(UserCategory.PROJECT_COORDINATORS)(originalLoader);
