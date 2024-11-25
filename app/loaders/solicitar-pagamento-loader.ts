// loaders/solicitarPagamentoLoader.ts
import { json } from "@remix-run/node";
import { getProjects, getSuppliers } from "~/api/firebaseConnection.server";

export async function loader() {
  let projects = await getProjects();
  let suppliers = await getSuppliers();

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
  return json({ projects, suppliers });
}
