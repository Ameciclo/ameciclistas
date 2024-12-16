// loaders/lista-projetos-loader.ts
import { getStrapiProjects } from "~/api/strapiData";

export async function loader() {
  const strapiProjects = await getStrapiProjects();
  const projectsOnGoing = strapiProjects
    .filter((project: { status: string }) => project.status === "ongoing")
    .filter(
      (project: { name: string | string[] }) =>
        !project.name.includes(" EN") && !project.name.includes(" ES")
    )
    .sort((a: any, b: any) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );

  return Response.json({ projectsOnGoing });
}
