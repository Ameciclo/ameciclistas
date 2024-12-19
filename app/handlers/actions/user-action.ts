import { redirect, ActionFunction } from "@remix-run/node";
import { createFullUser, createUser } from "~/api/firebaseConnection.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  try {
    await createFullUser(
      JSON.parse(formData.get("user") as string)
    );
  } catch (error) {
    console.log(error);
  }
  return redirect("/sucesso/user");
};
