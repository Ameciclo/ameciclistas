import { redirect, ActionFunction } from "@remix-run/node";
import { saveCalendarEvent } from "~/api/firebaseConnection.server";

const createCalendarEventData = (formData: FormData) => ({
  titulo: formData.get("titulo"),
  data: formData.get("data"),
  hora: formData.get("hora"),
  duracao: formData.get("duracao"),
  descricao: formData.get("descricao"),
  agenda: formData.get("agenda"),
  from: JSON.parse(formData.get("from") as string),
});

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  try {
    const calendarEventData = createCalendarEventData(formData);
    await saveCalendarEvent(calendarEventData);
    console.log(calendarEventData);
    return redirect("/sucesso/criar-evento");
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};
