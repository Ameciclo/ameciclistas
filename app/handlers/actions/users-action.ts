import { json, ActionFunction } from "@remix-run/node";
import { updateFullUser } from "~/api/firebaseConnection.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "batch-update") {
    const changes = JSON.parse(formData.get("changes") as string);
    const usersInfo = JSON.parse(formData.get("usersInfo") as string);
    const errors: string[] = [];

    for (const [userId, newRole] of Object.entries(changes)) {
      const user = usersInfo[userId];
      if (!user) {
        errors.push(`Usuário ${userId} não encontrado`);
        continue;
      }
      try {
        await updateFullUser(user, newRole as string);
      } catch (error) {
        errors.push(`Erro ao atualizar ${user.name}: ${error}`);
      }
    }

    return json({ success: errors.length === 0, errors: errors.length > 0 ? errors : undefined });
  }

  const user = JSON.parse(formData.get("user") as string);
  const newRole = formData.get("role") as string;

  try {
    await updateFullUser(user, newRole);
  } catch (error) {
    console.log(error);
  }
  return json({ success: true });
};
