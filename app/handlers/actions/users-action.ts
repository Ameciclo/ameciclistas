import { redirect, ActionFunction } from "@remix-run/node";
import { updateFullUser } from "~/api/firebaseConnection.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const user = JSON.parse(formData.get("user") as string);
  const newRole = formData.get("role") as string;

  try {
    await updateFullUser(user, newRole);
  } catch (error) {
    console.log(error);
  }
  return redirect("/sucesso/users");
};
