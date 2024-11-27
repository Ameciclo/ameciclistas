// loaders/solicitarPagamentoLoader.ts
import { json } from "@remix-run/node";
import { getProjects, getSuppliers, getCategoryByUserId } from "~/api/firebaseConnection.server";
import { UserCategory } from "~/api/types";
import { getTelegramUserInfo } from "~/api/users";

export async function loader() {
  let telegramUserInfo = await getTelegramUserInfo();
  let projects = await getProjects();
  let suppliers = await getSuppliers();
  let categoryByUserId = await getCategoryByUserId(telegramUserInfo?.id);
  console.log(categoryByUserId)

  if(!categoryByUserId) {
    categoryByUserId = UserCategory.ANY_USER
  }

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
  return json({ projects, suppliers, categoryByUserId });
}
