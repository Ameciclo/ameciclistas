import { createCookieSessionStorage } from '@remix-run/node';
import { getUsersFirebase } from './firebaseConnection.server';
import { UserCategory } from '~/utils/types';

const WEB_SESSION_SECRET = process.env.WEB_SESSION_SECRET || 'dev-web-session-secret';

export interface WebUser {
  email: string;
  cpf?: string;
  name: string;
  category: UserCategory;
  firebaseId?: string;
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: 'ameciclo_web_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [WEB_SESSION_SECRET],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    httpOnly: true,
  },
});

export async function validateEmailAndGetUser(email: string): Promise<WebUser> {
  try {
    const users = await getUsersFirebase();
    console.log('Buscando usuário para email:', email);
    
    // Buscar usuário por email
    const userEntry = Object.entries(users || {}).find(([id, user]) => {
      // Verificar email direto
      if (user.email === email) {
        console.log('Encontrado por email direto:', user.name, user.role);
        return true;
      }
      
      // Verificar em ameciclo_register
      if (user.ameciclo_register?.email === email) {
        console.log('Encontrado por ameciclo_register:', user.name, user.role);
        return true;
      }
      
      // Verificar em contacts
      if (user.contacts?.some((contact: any) => 
        contact.type === "E-mail" && contact.value === email
      )) {
        console.log('Encontrado por contacts:', user.name, user.role);
        return true;
      }
      
      return false;
    });
    
    if (userEntry) {
      const [firebaseId, userData] = userEntry;
      const webUser = {
        email,
        cpf: userData.ameciclo_register?.cpf || userData.id_number,
        name: userData.name || userData.nickname || email,
        category: (userData.role as UserCategory) || UserCategory.AMECICLISTAS,
        firebaseId
      };
      console.log('Usuário encontrado:', webUser);
      return webUser;
    }
    
    console.log('Usuário não encontrado, criando como ANY_USER');
    // Se não encontrou, usuário básico
    return {
      email,
      name: email.split('@')[0],
      category: UserCategory.ANY_USER
    };
  } catch (error) {
    console.error('Erro ao validar email:', error);
    return {
      email,
      name: email.split('@')[0],
      category: UserCategory.ANY_USER
    };
  }
}

export async function createWebSession(request: Request, user: WebUser) {
  const session = await getSession(request.headers.get('Cookie'));
  session.set('webUser', user);
  return commitSession(session);
}

export async function getWebUser(request: Request): Promise<WebUser | null> {
  const session = await getSession(request.headers.get('Cookie'));
  return session.get('webUser') || null;
}

export async function destroyWebSession(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  return destroySession(session);
}

export { getSession, commitSession };