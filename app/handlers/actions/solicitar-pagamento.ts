// handlers/actions/solicitar-pagamento.ts
import { redirect, ActionFunction, json } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";
import { formatDate } from "~/utils/format";

const createPaymentRequest = (formData: FormData) => {
  // Data de criação da solicitação
  const currentDate = formatDate.format(new Date());
  // Se o campo paymentDate não for preenchido, ficará como null
  const paymentDate = formData.get("paymentDate")?.toString() || null;

  // Processa o projeto
  let project = JSON.parse(formData.get("project") as string);
  project.id = project.spreadsheet_id;

  // Recupera o fornecedor completo (assumindo que o objeto foi enviado como JSON)
  const supplier = JSON.parse(formData.get("supplier") as string);

  return {
    date: currentDate,
    project,
    budgetItem: formData.get("budgetItem"),
    description: formData.get("description"),
    value: formData.get("value"),
    from: JSON.parse(formData.get("telegramUsersInfo") as string),
    transactionType: formData.get("transactionType"),
    isRefund: JSON.parse(formData.get("isRefund") as string),
    refundSupplier: JSON.parse(formData.get("refundSupplier") as string).find(
      (s: any) => s.name === formData.get("refundSupplier")
    ),
    supplier: JSON.parse(formData.get("supplier") as string).find(
      (s: any) => s.name === formData.get("supplier")
    ),
    paymentDate,
    from_chat_id: 0,
    group_message_id: 0,
    invoice_url: "",
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  try {
    const paymentRequest = createPaymentRequest(formData);
    await savePaymentRequest(paymentRequest);
    console.log(paymentRequest);
    return redirect("/sucesso/solicitar-pagamento");
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
