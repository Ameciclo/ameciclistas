import { redirect } from "@remix-run/node";
import { saveSupplierToDatabase } from "~/api/firebaseConnection.server";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();

  // Coleta campos do formulário
  const personType = formData.get("personType")?.toString(); // fisica ou juridica
  const name = formData.get("name")?.toString(); // Nome Fantasia ou Nome/Apelido
  const fullName = formData.get("fullName")?.toString(); // Razão Social ou Nome Completo
  const idNumber = formData.get("idNumber")?.toString(); // CPF ou CNPJ
  const fullAddress = formData.get("fullAddress")?.toString() || ""; // Endereço (opcional)
  const contactsJson = formData.get("contacts")?.toString(); // Contatos em JSON
  const paymentMethodsJson = formData.get("paymentMethods")?.toString(); // Métodos de pagamento em JSON

  // Conversão de contatos e métodos de pagamento para objetos
  let contacts: Array<{ type: string; value: string }> = [];
  let paymentMethods: Array<{ type: string; value: string }> = [];
  try {
    if (contactsJson) {
      contacts = JSON.parse(contactsJson);
    }
    if (paymentMethodsJson) {
      paymentMethods = JSON.parse(paymentMethodsJson);
    }
  } catch (e) {
    console.error("Erro ao converter JSON:", e);
    return redirect("/");
  }

  // Validação básica (apenas para campos obrigatórios)
  if (!personType || !name || !fullName || !idNumber) {
    console.error("Campos obrigatórios ausentes");
    return redirect("/");
  }

  // Validação de contatos e métodos de pagamento
  if (contacts.some((contact) => !contact.value)) {
    console.error("Contatos inválidos");
    return redirect("/");
  }

  if (
    paymentMethods.some((method) => {
      if (method.type === "PIX" || method.type === "Conta Bancária") {
        return !method.value;
      }
      return false;
    })
  ) {
    console.error("Métodos de pagamento inválidos");
    return redirect("/");
  }

  // Montando objeto final para salvar no banco
  const supplierData = {
    type: personType === "fisica" ? "Pessoa Física" : "Pessoa Jurídica",
    name: fullName, // Nome completo ou razão social
    nickname: name, // Nome fantasia ou apelido
    id_number: idNumber, // CPF ou CNPJ
    address: fullAddress || null, // Endereço opcional
    contacts,
    payment_methods: paymentMethods,
  };

  // Log dos dados coletados para validação
  console.log("Dados do fornecedor a serem salvos:", supplierData);

  await saveSupplierToDatabase(supplierData);

  // Redireciona após salvar
  return redirect("/sucesso/adicionar-fornecedor");
}