import { google } from 'googleapis';

const CALENDAR_IDS = [
  "ameciclo@gmail.com",
  "oj4bkgv1g6cmcbtsap4obgi9vc@group.calendar.google.com"
];

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  imageUrl?: string;
}

export async function getCalendarEvents(monthOffset = -1): Promise<CalendarEvent[]> {
  const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  
  // Usar FIREBASE_PRIVATE_KEY separada se private_key estiver vazia
  let privateKey = credentials.private_key;
  if (!privateKey || privateKey.trim() === '') {
    privateKey = process.env.FIREBASE_PRIVATE_KEY;
  }
  
  // Garantir que a private key esteja formatada corretamente
  if (privateKey && !privateKey.includes('\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar']
  });

  const calendar = google.calendar({ version: 'v3', auth });
  
  // Primeiro e último dia do mês (offset: -1 = mês passado, 0 = mês atual)
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0, 23, 59, 59);

  let allEvents: CalendarEvent[] = [];

  for (const calendarId of CALENDAR_IDS) {
    try {
      const response = await calendar.events.list({
        calendarId,
        timeMin: firstDay.toISOString(),
        timeMax: lastDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      
      for (const event of events) {
        // Filtrar eventos recorrentes
        if (event.description?.includes('RECORRENTE')) continue;
        
        const calendarEvent: CalendarEvent = {
          id: event.id!,
          title: event.summary || 'Sem título',
          description: event.description || '',
          startTime: new Date(event.start?.dateTime || event.start?.date || ''),
          endTime: new Date(event.end?.dateTime || event.end?.date || ''),
        };

        // Buscar imagem do evento
        try {
          const eventDetails = await calendar.events.get({
            calendarId,
            eventId: event.id!,
            fields: 'attachments'
          });

          if (eventDetails.data.attachments?.length) {
            const fileId = eventDetails.data.attachments[0].fileId;
            calendarEvent.imageUrl = `https://lh3.googleusercontent.com/d/${fileId}=w260-h200`;
          }
        } catch (error) {
          console.warn(`Erro ao buscar imagem do evento ${event.id}:`, error);
        }

        allEvents.push(calendarEvent);
      }
    } catch (error) {
      console.error(`Erro ao buscar eventos do calendário ${calendarId}:`, error);
    }
  }

  // Ordenar por data
  allEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return allEvents;
}

export function addZeroToInt(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

export function getMonthName(date: Date): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  return months[date.getMonth()];
}