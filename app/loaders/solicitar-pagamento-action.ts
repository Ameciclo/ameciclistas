// actions/solicitarPagamentoAction.ts
import { redirect, json, ActionFunction } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";
import { parseJSONField } from "~/utils/jsonParser";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  console.log(formData);

  const date = new Date();

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
  });

  const project = parseJSONField(formData.get("project"), "project");
  const from = parseJSONField(formData.get("from"), "from");
  const recipientInformation = parseJSONField(
    formData.get("recipient_information"),
    "recipient_information"
  );

  const paymentRequest = {
    date: formatter.format(date),
    project, // Agora project é um objeto parseado
    budgetItem: formData.get("rubrica"),
    recipientName: formData.get("fornecedor"),
    description: formData.get("descricao"),
    value: formData.get("valor"),
    from_chat_id: "",
    group_message_id: "",
    invoice_url: "",
    from, // Agora from é um objeto parseado
    recipient_information: recipientInformation, // Agora recipient_information é um objeto parseado
  };

  console.log(paymentRequest);

  try {
    await savePaymentRequest(paymentRequest);
    return redirect("/solicitar-pagamento-sucesso");
  } catch (error: any) {
    console.error("Erro ao enviar solicitação:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
