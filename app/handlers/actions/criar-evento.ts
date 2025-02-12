import { redirect, ActionFunction, json } from "@remix-run/node";
import { saveCalendarEvent } from "~/api/firebaseConnection.server";
import { formatDateToISO } from "~/utils/format";

const createCalendarEventData = (formData: FormData) => {
  const getString = (key: string): string =>
    formData.get(key)?.toString() || "";
  const getNumber = (key: string): number =>
    parseInt(formData.get(key) as string, 10) || 0;
  const getJson = (key: string): any => {
    const value = formData.get(key);
    return value ? JSON.parse(value as string) : null;
  };

  return {
    name: getString("name"),
    startDate: formatDateToISO(getString("date"), getString("startTime")),
    endDate: formatDateToISO(getString("date"), getString("endTime")),
    description: getString("description"),
    location: getString("location"),
    calendarId: getString("calendarId"),
    workgroup: getNumber("workgroup"),
    from: getJson("from"),
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  try {
    const calendarEventData = createCalendarEventData(formData);
    await saveCalendarEvent(calendarEventData);
    console.log(calendarEventData);
    return redirect("/sucesso/criar-evento");
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
