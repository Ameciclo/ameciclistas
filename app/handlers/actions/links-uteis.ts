import db from "~/api/firebaseAdmin.server";
import { LinkUtil, LinkCategory, UserCategory } from "~/utils/types";

export async function createLink(linkData: Omit<LinkUtil, 'id' | 'clicks' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString();
    const newLink = {
      ...linkData,
      clicks: 0,
      createdAt: now,
      updatedAt: now
    };
    
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
    await linkRef.update({
      ...linkData,
      updatedAt: now
    });
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
