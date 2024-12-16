// loaders/grupos-de-trabalho-loader.ts
import { getWorkgroups } from "~/api/strapiData";

export async function loader() {
  const workgroups = await getWorkgroups();
  return Response.json({ workgroups });
}
