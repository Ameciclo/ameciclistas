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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #008080; margin: 0; font-size: 28px; font-weight: bold;">Acesso ao Sistema Ameciclo</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; color: #333;">Olá!</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0; color: #333;">Você solicitou acesso ao sistema da Ameciclo. Clique no botão abaixo para entrar:</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${magicUrl}" style="background: #008080; color: white; padding: 18px 40px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 18px; box-shadow: 0 4px 8px rgba(0,128,128,0.2); transition: all 0.3s ease;">
            🚴 Acessar Sistema
          </a>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; font-size: 14px; color: #856404; text-align: center;">
            ⏰ Este link expira em 24 horas por segurança.
          </p>
        </div>
        
        <hr style="margin: 40px 0; border: none; border-top: 2px solid #008080; opacity: 0.3;">
        
        <div style="text-align: center; padding: 20px; background-color: #f1f3f4; border-radius: 8px;">
          <p style="font-size: 14px; color: #008080; font-weight: bold; margin: 0 0 8px 0;">
            Ameciclo - Associação Metropolitana de Ciclistas do Recife
          </p>
          <p style="font-size: 12px; color: #666; margin: 0;">
            Se você não solicitou este acesso, pode ignorar este email.
          </p>
        </div>
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