import { redirect, ActionFunction, json } from "@remix-run/node";
import { saveCalendarEvent } from "~/api/firebaseConnection.server";

const createCalendarEventData = (formData: FormData) => ({
  name: formData.get("name"),
  startDate: (new Date(formData.get("date") + " " + formData.get("startTime"))).toISOString(),
  endDate: (new Date(formData.get("date") + " " + formData.get("endTime"))).toISOString(),
  description: formData.get("description"),
  location: formData.get("location"),
  calendar: formData.get("calendar"),
  workgroup: formData.get("workgroup"),
  from: JSON.parse(formData.get("from") as string),
});

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  try {
    const calendarEventData = createCalendarEventData(formData);
    await saveCalendarEvent(calendarEventData, name);
    console.log(calendarEventData);
    return redirect("/sucesso/criar-evento");
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
