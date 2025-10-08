import { google } from 'googleapis';
import { generateNewsletterHtml } from '~/utils/newsletterTemplate';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  imageUrl?: string;
}

const DEV_EMAILS = [process.env.DEV_GOOGLE_SUBJECT];
const PROD_EMAILS = [process.env.GOOGLE_SUBJECT];

export async function sendNewsletter(events: CalendarEvent[], isTest = false, userEmail?: string) {
  let emails: string[];
  
  if (isTest) {
    emails = userEmail ? [userEmail] : DEV_EMAILS;
  } else {
    emails = PROD_EMAILS;
  }
  
  // Sempre usar credenciais de produção para newsletter (domain-wide delegation configurado)
  const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: process.env.GOOGLE_SUBJECT // Email que vai impersonar
  });

  const gmail = google.gmail({ version: 'v1', auth });
  
  const subject = getSubject();
  const html = generateNewsletterHtml(events);

  let emailsSent = 0;

  for (const email of emails) {
    try {
      const message = [
        `To: ${email}`,
        `From: ${process.env.GOOGLE_SUBJECT}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        html
      ].join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
      
      emailsSent++;
      console.log(`Email enviado para: ${email}`);
    } catch (error) {
      console.error(`Erro ao enviar email para ${email}:`, error);
    }
  }

  return { emailsSent, totalEmails: emails.length };
}

function getSubject(): string {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  return `Boletim informativo ${monthNames[lastMonth.getMonth()]} de ${lastMonth.getFullYear()}`;
}