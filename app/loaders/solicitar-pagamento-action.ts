// actions/solicitarPagamentoAction.ts
import { redirect, json, ActionFunction } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";

export const action: ActionFunction = async ({ request }) => {

  const formData = await request.formData();
  console.log(formData);

  const paymentRequest = {
    date: new Date(),
    project: formData.get("project"),
    budgetItem: formData.get("rubrica"),
    recipientName: formData.get("fornecedor"),
    description: formData.get("descricao"),
    value: formData.get("valor"),
    from_chat_id: "",
    group_message_id: "",
    invoice_url: "",
    from: formData.get("telegramUserInfo"),
    recipient_information: "",
  };

  try {
    await savePaymentRequest(paymentRequest);
    return redirect("/solicitar-pagamento-sucesso");
  } catch (error: any) {
    console.error("Erro ao enviar solicitação:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
