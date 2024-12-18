import { redirect, ActionFunction } from "@remix-run/node";
import { createUser } from "~/api/firebaseConnection.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType"); // Identifica o tipo de ação

  try {
    await createUser(
      JSON.parse(formData.get("user") as string),
      "AMECICLISTAS"
    );
  } catch (error) {
    console.log(error);
  }
  return redirect("/sucesso/user");
};
