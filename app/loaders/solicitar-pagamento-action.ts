// actions/solicitarPagamentoAction.ts
import { redirect, json, ActionFunction } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";

export const action: ActionFunction = async ({ request }) => {

  const formData = await request.formData();

  const date = new Date();

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
  });

  const paymentRequest = {
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
    recipient_information: JSON.parse(formData.get("fornecedores") as string).find((s: any) => s.nome === formData.get("fornecedor")),
  };

  try {
    await savePaymentRequest(paymentRequest);
    console.log(paymentRequest);
    return redirect("/solicitar-pagamento-sucesso");
  } catch (error: any) {
    console.error("Erro ao enviar solicitação:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
