import { redirect, json, ActionFunction } from "@remix-run/node";
import { createUser, saveCalendarEvent, savePaymentRequest, saveRecipient } from "~/api/firebaseConnection.server";


const createPaymentRequest = (formData: FormData) => {
  const date = new Date();
  const unixMilliseconds = date.getTime();
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
  });
  let project = JSON.parse(formData.get("project") as string);
  project.id = project.spreadsheet_id;

  return {
    date: unixMilliseconds,
    dateParsed: formatter.format(date),
    project,
    budgetItem: formData.get("rubrica"),
    recipientName: formData.get("fornecedor"),
    description: formData.get("descricao"),
    value: formData.get("valor"),
    from_chat_id: 0,
    group_message_id: 0,
    invoice_url: "",
    from: JSON.parse(formData.get("telegramUserInfo") as string),
    recipientInformation: JSON.parse(formData.get("fornecedores") as string).find(
      (s: any) => s.nome === formData.get("fornecedor")
    ),
  };
};

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

const createCalendarEventData = (formData: FormData) => ({
  titulo: formData.get("titulo"),
  data: formData.get("data"),
  hora: formData.get("hora"),
  duracao: formData.get("duracao"),
  descricao: formData.get("descricao"),
  agenda: formData.get("agenda"),
  from: JSON.parse(formData.get("from") as string),
})

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

      case "criarEvento":
        const calendarEventData = createCalendarEventData(formData);
        await saveCalendarEvent(calendarEventData);
        console.log(calendarEventData);
        return redirect("/criar-evento-sucesso");

      case "createUser":
        try {
          await createUser(JSON.parse(formData.get("user") as string), "AMECICLISTAS");
        } catch (error) {
          console.log(error);
        }
        return redirect("/user-sucess");

      default:
        throw new Error(`Ação não reconhecida: ${actionType}`);
    }
  } catch (error: any) {
    console.error(`Erro ao processar a ação ${actionType}:`, error);
    return json({ error: error.message }, { status: 500 });
  }
};

