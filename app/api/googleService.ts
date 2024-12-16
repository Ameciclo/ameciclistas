import { google, sheets_v4, calendar_v3 } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

interface EventData {
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
  emailTag?: string;
}

const calendars = {
  EXTERNAL: process.env.EXTERNAL_CALENDAR_ID || '',
  INTERNAL: process.env.INTERNAL_CALENDAR_ID || '',
  ORG: process.env.ORG_CALENDAR_ID || '',
  PROMOTE: process.env.PROMOTE_CALENDAR_ID || ''
};

function getJwt() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('As credenciais do Google (email e chave privada) não foram fornecidas.');
  }

  return new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/calendar']
  );
}

async function appendSheetRow(
  spreadsheetId: string = process.env.SPREADSHEET_ID || '',
  range: string,
  row: string[]
): Promise<sheets_v4.Schema$AppendValuesResponse> {
  const sheets = google.sheets({ version: 'v4', auth: getJwt() });
  const requestBody = { values: [row] };

  const params = {
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody
  };

  const response = await sheets.spreadsheets.values.append(params);
  return response.data;
}

async function createEvent({
  name,
  startDate,
  endDate,
  location = "",
  description = "",
  emailTag = ""
}: EventData): Promise<calendar_v3.Schema$Event> {
  const calendar = google.calendar({ version: 'v3', auth: getJwt() });

  const event = {
    summary: name,
    location,
    description,
    start: { dateTime: startDate, timeZone: 'America/Recife' },
    end: { dateTime: endDate, timeZone: 'America/Recife' },
    attendees: emailTag ? [{ email: emailTag, responseStatus: "accepted" }] : []
  };

  const params = {
    calendarId: calendars.EXTERNAL,
    requestBody: event
  };

  const response = await calendar.events.insert(params);
  return response.data;
}

export default { getJwt, appendSheetRow, createEvent };
