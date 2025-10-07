import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { destroyWebSession } from "~/api/webAuth.server";

export async function action({ request }: ActionFunctionArgs) {
  const sessionCookie = await destroyWebSession(request);
  
  return redirect('/login', {
    headers: {
      'Set-Cookie': sessionCookie,
    },
  });
}

export async function loader() {
  return redirect('/');
}