// actions/universalAction.ts
import { redirect, json, ActionFunction } from "@remix-run/node";
import { savePaymentRequest, saveRecipient } from "~/api/firebaseConnection.server";


// Função para criar o pagamento
const createPaymentRequest = (formData: FormData) => {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
  });

  return {
    date: formatter.format(date),
    project: JSON.parse(formData.get("project") as string),
    budgetItem: formData.get("rubrica"),
    recipientName: formData.get("fornecedor"),
    description: formData.get("descricao"),
    value: formData.get("valor"),
    from_chat_id: "",
    group_message_id: "",
    invoice_url: "",
    from: JSON.parse(formData.get("telegramUserInfo") as string),
    recipient_information: JSON.parse(formData.get("fornecedores") as string).find(
      (s: any) => s.nome === formData.get("fornecedor")
    ),
  };
};

// Função para criar o fornecedor
const createFornecedorData = (formData: FormData) => ({
  id: formData.get("cpfCnpj"),
  name: formData.get("nomeFantasia"),
  razaoSocial: formData.get("razaoSocial"),
  cpfCnpj: formData.get("cpfCnpj"),
  email: formData.get("email"),
  telefone: formData.get("telefone"),
  tipoChavePix: formData.get("tipoChavePix"),
  chavePix: formData.get("chavePix"),
});

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType"); // Identifica o tipo de ação

  try {
    switch (actionType) {
      case "solicitarPagamento":
        const paymentRequest = createPaymentRequest(formData);
        await savePaymentRequest(paymentRequest);
        console.log(paymentRequest)
        return redirect("/solicitar-pagamento-sucesso");

      case "adicionarFornecedor":
        const fornecedorData = createFornecedorData(formData);
        await saveRecipient(fornecedorData);
        console.log(fornecedorData)
        return redirect("/adicionar-fornecedor-sucesso");

      default:
        throw new Error(`Ação não reconhecida: ${actionType}`);
    }
  } catch (error: any) {
    console.error(`Erro ao processar a ação ${actionType}:`, error);
    return json({ error: error.message }, { status: 500 });
  }
};

