import db from "~/api/firebaseAdmin.server";
import { LinkUtil, LinkCategory, UserCategory } from "~/utils/types";

function stripUndefined(obj: Record<string, any>): Record<string, any> {
  Object.keys(obj).forEach(k => { if (obj[k] === undefined) delete obj[k]; });
  return obj;
}

export async function createLink(linkData: Omit<LinkUtil, 'id' | 'clicks' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString();
    const newLink = stripUndefined({
      ...linkData,
      clicks: 0,
      createdAt: now,
      updatedAt: now
    });
    
    const linksRef = db.ref('links_uteis');
    const newLinkRef = linksRef.push();
    await newLinkRef.set(newLink);
    
    return { success: true, id: newLinkRef.key };
  } catch (error) {
    console.error('Erro ao criar link:', error);
    return { success: false, error: 'Erro ao criar link' };
  }
}

export async function updateLink(linkId: string, linkData: Partial<LinkUtil>) {
  try {
    const now = new Date().toISOString();
    const linkRef = db.ref(`links_uteis/${linkId}`);
    await linkRef.update(stripUndefined({
      ...linkData,
      updatedAt: now
    }));
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar link:', error);
    return { success: false, error: 'Erro ao atualizar link' };
  }
}

export async function deleteLink(linkId: string) {
  try {
    const linkRef = db.ref(`links_uteis/${linkId}`);
    await linkRef.remove();
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar link:', error);
    return { success: false, error: 'Erro ao deletar link' };
  }
}

export async function reorderLink(linkId: string, direction: 'up' | 'down') {
  try {
    const linksRef = db.ref('links_uteis');
    const snapshot = await linksRef.orderByChild('order').once('value');
    const data = snapshot.val();
    if (!data) return { success: false, error: 'Nenhum link encontrado' };

    const links = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    links.sort((a, b) => a.order - b.order);

    const idx = links.findIndex(l => l.id === linkId);
    if (idx === -1) return { success: false, error: 'Link não encontrado' };

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= links.length) return { success: false, error: 'Já está no limite' };

    const currentLink = links[idx];
    const swapLink = links[swapIdx];
    const currentOrder = currentLink.order;
    const swapOrder = swapLink.order;

    const updates: Record<string, any> = {};
    updates[`links_uteis/${currentLink.id}/order`] = swapOrder;
    updates[`links_uteis/${swapLink.id}/order`] = currentOrder;
    updates[`links_uteis/${currentLink.id}/updatedAt`] = new Date().toISOString();
    updates[`links_uteis/${swapLink.id}/updatedAt`] = new Date().toISOString();

    await db.ref().update(updates);
    return { success: true };
  } catch (error) {
    console.error('Erro ao reordenar link:', error);
    return { success: false, error: 'Erro ao reordenar link' };
  }
}

export async function incrementClick(linkId: string) {
  try {
    const linkRef = db.ref(`links_uteis/${linkId}`);
    const snapshot = await linkRef.once('value');
    
    if (snapshot.exists()) {
      const currentClicks = snapshot.val()?.clicks || 0;
      await linkRef.update({
        clicks: currentClicks + 1
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao incrementar cliques:', error);
    return { success: false, error: 'Erro ao incrementar cliques' };
  }
}
