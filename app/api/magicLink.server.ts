import crypto from 'crypto';
import { google } from 'googleapis';

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'dev-secret-key';

export function generateMagicToken(email: string): string {
  const timestamp = Date.now();
  const payload = `${email}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', MAGIC_LINK_SECRET)
    .update(payload)
    .digest('hex');
  
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

export function verifyMagicToken(token: string): { email: string; valid: boolean } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [email, timestamp, signature] = decoded.split(':');
    
    // Verificar se não expirou (24 horas)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return { email: '', valid: false };
    }
    
    // Verificar assinatura
    const expectedSignature = crypto
      .createHmac('sha256', MAGIC_LINK_SECRET)
      .update(`${email}:${timestamp}`)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return { email: '', valid: false };
    }
    
    return { email, valid: true };
  } catch {
    return { email: '', valid: false };
  }
}

export async function sendMagicLink(email: string, baseUrl: string): Promise<boolean> {
  try {
    console.log('=== DEBUG MAGIC LINK ===');
    console.log('Email:', email);
    console.log('BaseURL:', baseUrl);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Has FIREBASE_SERVICE_ACCOUNT:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Has GOOGLE_SUBJECT:', !!process.env.GOOGLE_SUBJECT);
    console.log('Has MAGIC_LINK_SECRET:', !!process.env.MAGIC_LINK_SECRET);
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.error('FIREBASE_SERVICE_ACCOUNT não configurado');
      return false;
    }
    
    const token = generateMagicToken(email);
    const magicUrl = `${baseUrl}/auth/verify?token=${token}`;
    console.log('Magic URL gerada:', magicUrl);
    
    let credentials;
    try {
      credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('Credenciais parseadas com sucesso. Client email:', credentials.client_email);
    } catch (parseError) {
      console.error('Erro ao parsear FIREBASE_SERVICE_ACCOUNT:', parseError);
      return false;
    }
    
    // Usar FIREBASE_PRIVATE_KEY separada se private_key estiver vazia
    let privateKey = credentials.private_key;
    if (!privateKey || privateKey.trim() === '') {
      privateKey = process.env.FIREBASE_PRIVATE_KEY;
      console.log('Usando FIREBASE_PRIVATE_KEY separada');
    }
    
    // Garantir que a private key esteja formatada corretamente
    if (privateKey && !privateKey.includes('\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    console.log('Private key length:', privateKey?.length);
    console.log('Private key starts with:', privateKey?.substring(0, 50));
    
    if (!privateKey) {
      console.error('Private key não encontrada');
      return false;
    }
    
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
      subject: process.env.GOOGLE_SUBJECT
    });

    console.log('Criando cliente Gmail...');
    const gmail = google.gmail({ version: 'v1', auth });
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Acesso ao Sistema Ameciclo</h2>
        <p>Olá!</p>
        <p>Você solicitou acesso ao sistema da Ameciclo. Clique no botão abaixo para entrar:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${magicUrl}" style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            🚴 Acessar Sistema
          </a>
        </div>
        <p><small style="color: #666;">Este link expira em 24 horas por segurança.</small></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          Ameciclo - Associação Metropolitana de Ciclistas do Recife<br>
          Se você não solicitou este acesso, pode ignorar este email.
        </p>
      </div>
    `;
    
    const fromEmail = process.env.GOOGLE_SUBJECT;
    const message = [
      `To: ${email}`,
      `From: ${fromEmail}`,
      `Subject: Acesso ao Sistema Ameciclo`,
      'Content-Type: text/html; charset=utf-8',
      '',
      html
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log('Enviando email via Gmail API...');
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    console.log(`Magic link enviado com sucesso para: ${email}`);
    return true;
  } catch (error) {
    console.error('=== ERRO MAGIC LINK ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}