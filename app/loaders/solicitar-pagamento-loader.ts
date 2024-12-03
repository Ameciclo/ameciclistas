// loaders/solicitarPagamentoLoader.ts
import { json } from "@remix-run/node";
import { getProjects, getSuppliers, getCategories } from "~/api/firebaseConnection.server";
import { UserCategory } from "~/api/types";
import { getTelegramUserInfo } from "~/api/users";

export async function loader() {
  let projects = await getProjects();
  let suppliers = await getSuppliers();
  let userCategoriesObject = await getCategories();;
  let currentUserCategories: UserCategory[] = [process.env.NODE_ENV === "development" ? UserCategory.DEVELOPMENT : UserCategory.ANY_USER];
  const userInfo = getTelegramUserInfo();

  suppliers = Object.values(suppliers).map((supplier: any) => {
    let tipoChavePix: string;
    if (supplier.id.startsWith("CPF")) {
      tipoChavePix = "cpf/cnpj";
    } else if (supplier.bank_code === "PIX") {
      tipoChavePix = "pix";
    } else {
      tipoChavePix = "outro";
    }
    return {
      id: supplier.id,
      nome: supplier.name,
      cpfCnpj: supplier.id,
      email: "",
      telefone: "",
      chavePix: supplier.id,
      tipoChavePix: tipoChavePix,
    };
  });

  projects = Object.values(projects);

  userCategoriesObject = Object.values(userCategoriesObject);

  if (userInfo?.id && userCategoriesObject[userInfo.id]) {
    currentUserCategories = [userCategoriesObject[userInfo.id] as any];
  }

  return json({ projects, suppliers, currentUserCategories });
}
