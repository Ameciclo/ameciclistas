import db from "~/api/firebaseAdmin.server";
import { LinkUtil, LinkCategory } from "~/utils/types";

export async function loadLinksUteis(category?: LinkCategory) {
  try {
    const linksRef = db.ref('links_uteis');
    const snapshot = await linksRef.orderByChild('order').once('value');
    const data = snapshot.val();
    
    if (!data) return [];
    
    const links: LinkUtil[] = [];
    const now = new Date();
    
    Object.keys(data).forEach((key) => {
      const linkData = data[key];
      
      // Filtrar apenas links ativos
      if (!linkData.active) return;
      
      // Filtrar por categoria se especificada
      if (category && !linkData.categories?.includes(category)) {
        return;
      }
      
      // Verificar agendamento
      if (linkData.startDate && new Date(linkData.startDate) > now) {
        return; // Ainda não começou
      }
      if (linkData.endDate && new Date(linkData.endDate) < now) {
        return; // Já terminou
      }
      
      links.push({
        id: key,
        ...linkData
      } as LinkUtil);
    });
    
    // Ordenar por order
    links.sort((a, b) => a.order - b.order);
    
    return links;
  } catch (error) {
    console.error('Erro ao carregar links úteis:', error);
    return [];
  }
}
