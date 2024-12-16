// loaders/solicitar-pagamento-loader.ts
import { json } from "@remix-run/react";
import {
  getProjects,
  getSuppliers,
  getCategories,
} from "~/api/firebaseConnection.server";
import { UserCategory } from "~/utils/types";

export async function loader() {
  const projects = Object.values(await getProjects());
  const suppliers = Object.values(await getSuppliers()).map(
    (supplier: any) => ({
      id: supplier.id || "",
      nome: supplier.name || "",
      razaoSocial: supplier.razaoSocial || "",
      cpfCnpj: supplier.cpfCnpj || "",
      email: supplier.email || "",
      telefone: supplier.telefone || "",
      chavePix: supplier.chavePix || "",
      tipoChavePix: supplier.tipoChavePix || "",
    })
  );
  const userCategoriesObject = await getCategories();
  const currentUserCategories: UserCategory[] = [
    process.env.NODE_ENV === "development"
      ? UserCategory.DEVELOPMENT
      : UserCategory.ANY_USER,
  ];

  return json({
    projects,
    suppliers,
    currentUserCategories,
    userCategoriesObject,
  });
}
