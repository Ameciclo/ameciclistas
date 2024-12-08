// loaders/solicitarPagamentoLoader.ts
import { json } from "@remix-run/node";
import {
  getProjects,
  getSuppliers,
  getCategories,
} from "~/api/firebaseConnection.server";
import { getWorkgroups, getStrapiProjects } from "~/api/strapiData";
import { UserCategory, Workgroup } from "~/api/types";

export async function loader() {
  let projects = await getProjects();
  let suppliers = await getSuppliers();
  let userCategoriesObject = await getCategories();
  let currentUserCategories: UserCategory[] = [
    process.env.NODE_ENV === "development"
      ? UserCategory.DEVELOPMENT
      : UserCategory.ANY_USER,
  ];

  suppliers = Object.values(suppliers).map((supplier: any) => {
    return {
      id: supplier.id || "",
      nome: supplier.name || "",
      razaoSocial: supplier.razaoSocial || "",
      cpfCnpj: supplier.cpfCnpj || "",
      email: supplier.email || "",
      telefone: supplier.telefone || "",
      chavePix: supplier.chavePix || "",
      tipoChavePix: supplier.tipoChavePix || "",
    };
  });

  projects = Object.values(projects);

  let workgroups: Workgroup[] = await getWorkgroups();

  const strapiProjects = await getStrapiProjects();
  let projectsOnGoing = strapiProjects.filter(
    (project: { status: string }) => project.status === "ongoing"
  );
  projectsOnGoing = projectsOnGoing.filter(
    (project: { name: string | string[] }) =>
      !project.name.includes(" EN") && !project.name.includes(" ES")
  );
  
  projectsOnGoing.sort((a: any, b: any) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );


  return json({
    projects,
    suppliers,
    currentUserCategories,
    userCategoriesObject,
    workgroups,
    projectsOnGoing,
  });
}
