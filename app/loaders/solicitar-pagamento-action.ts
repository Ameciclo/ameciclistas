// actions/solicitarPagamentoAction.ts
import { redirect, json, ActionFunction } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";

export const action: ActionFunction = async ({ request }) => {

  const formData = await request.formData();
  console.log(formData);

  const paymentRequest = {
    projeto: formData.get("project"),
    rubrica: formData.get("rubrica"),
    fornecedor: formData.get("fornecedor"),
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
  };

  try {
    await savePaymentRequest(paymentRequest);
    return redirect("/solicitar-pagamento-sucesso");
  } catch (error: any) {
    console.error("Erro ao enviar solicitação:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
