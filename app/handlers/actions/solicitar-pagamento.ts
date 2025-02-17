// handlers/actions/solicitar-pagamento.ts
import { redirect, ActionFunction, json } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";
import { formatDate } from "~/utils/format";

const createPaymentRequest = (formData: FormData) => {
  // Se o campo paymentDate não for preenchido, ficará como null
  const paymentDate = formData.get("paymentDate")?.toString() || null;

  // Processa o projeto
  let project = JSON.parse(formData.get("project") as string);

  // Recupera o fornecedor completo (assumindo que o objeto foi enviado como JSON)
  const supplier = JSON.parse(formData.get("supplier") as string);
  const refundSupplier = formData.get("refundSupplier")
    ? JSON.parse(formData.get("refundSupplier") as string)
    : "";

  return {
    from: JSON.parse(formData.get("telegramUsersInfo") as string),
    paymentDate,
    transactionType: formData.get("transactionType"),
    project,
    budgetItem: formData.get("budgetItem"),
    supplier,
    isRefund: JSON.parse(formData.get("isRefund") as string),
    refundSupplier,
    description: formData.get("description"),
    value: formData.get("paymentValue"),
    from_chat_id: 0,
    group_message_id: 0,
    invoice_url: "",
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  console.log("Solicitando pagamento com ", formData);
  try {
    const paymentRequest = createPaymentRequest(formData);
    console.log(paymentRequest);
    await savePaymentRequest(paymentRequest);
    return redirect("/sucesso/solicitar-pagamento");
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
