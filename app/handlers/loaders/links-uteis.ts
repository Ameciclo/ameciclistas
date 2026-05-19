import db from "~/api/firebaseAdmin.server";
import { LinkUtil, LinkCategory } from "~/utils/types";

async function fetchAllLinks() {
  const snapshot = await db.ref('links_uteis').orderByChild('order').once('value');
  const data = snapshot.val();
  if (!data) return [];

  const links: LinkUtil[] = [];
  Object.keys(data).forEach((key) => {
    links.push({ id: key, ...data[key] } as LinkUtil);
  });
  links.sort((a, b) => a.order - b.order);
  return links;
}

export async function loadLinksUteis(category?: LinkCategory) {
  try {
    const allLinks = await fetchAllLinks();
    const now = new Date();
    
    return allLinks.filter(link => {
      if (!link.active) return false;
      if (category && !link.categories?.includes(category)) return false;
      if (link.startDate && new Date(link.startDate) > now) return false;
      if (link.endDate && new Date(link.endDate) < now) return false;
      return true;
    });
  } catch (error) {
    console.error('Erro ao carregar links úteis:', error);
    return [];
  }
}

export async function loadAllLinksUteis() {
  try {
    return await fetchAllLinks();
  } catch (error) {
    console.error('Erro ao carregar todos os links:', error);
    return [];
  }
}
