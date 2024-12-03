// loaders/solicitarPagamentoLoader.ts
import { json } from "@remix-run/node";
import { getProjects, getSuppliers, getCategories } from "~/api/firebaseConnection.server";
import { UserCategory } from "~/api/types";

export async function loader() {
  let projects = await getProjects();
  let suppliers = await getSuppliers();
  let userCategoriesObject = await getCategories();
  let currentUserCategories: UserCategory[] = [process.env.NODE_ENV === "development" ? UserCategory.DEVELOPMENT : UserCategory.ANY_USER];

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

  return json({ projects, suppliers, currentUserCategories, userCategoriesObject });
}
