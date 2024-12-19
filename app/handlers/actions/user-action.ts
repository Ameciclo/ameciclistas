import { redirect, ActionFunction } from "@remix-run/node";
import { createFullUser } from "~/api/firebaseConnection.server";
import { UserCategory } from "~/utils/types";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const user = {
    id: JSON.parse(formData.get("user") as string).id,
    name: JSON.parse(formData.get("user") as string).username,
    role: UserCategory.ANY_USER,
  }

  try {
    await createFullUser(
      user
    );
  } catch (error) {
    console.log(error);
  }
  return redirect("/sucesso/user");
};
