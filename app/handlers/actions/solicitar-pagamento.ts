// handlers/actions/solicitar-pagamento.ts
import { redirect, ActionFunction, json } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";
import { formatDate } from "~/utils/format";

interface PaymentItem {
  id: string;
  projectId: string;
  budgetItem: string;
  supplierId: string;
  supplierInput: string;
  isRefund: boolean;
  refundSupplierId: string;
  refundSupplierInput: string;
  description: string;
  quantity: number;
  unitName: string;
  unitValue: string;
  totalValue: string;
}

const createPaymentRequests = (formData: FormData) => {
  const paymentDate = formData.get("paymentDate")?.toString() || null;
  const transactionType = formData.get("transactionType");
  const from = JSON.parse(formData.get("telegramUsersInfo") as string);
  const paymentItems: PaymentItem[] = JSON.parse(formData.get("paymentItems") as string);
  const projects = JSON.parse(formData.get("projects") as string);
  const suppliers = JSON.parse(formData.get("suppliers") as string);

  return paymentItems.map(item => {
    const project = projects.find((p: any) => p.spreadsheet_id === item.projectId);
    const supplier = suppliers.find((s: any) => (s.id_number || s.id) === item.supplierId);
    const refundSupplier = item.isRefund 
      ? suppliers.find((s: any) => (s.id_number || s.id) === item.refundSupplierId)
      : null;

    const description = `${item.description} (${item.quantity} ${item.unitName}${item.quantity > 1 ? 's' : ''} × R$ ${(parseFloat(item.unitValue) / 100).toFixed(2).replace('.', ',')})`;

    return {
      from,
      paymentDate,
      transactionType,
      project,
      budgetItem: item.budgetItem,
      supplier,
      isRefund: item.isRefund,
      refundSupplier: refundSupplier || "",
      description,
      value: item.totalValue,
      from_chat_id: 0,
      group_message_id: 0,
      invoice_url: "",
    };
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  console.log("Solicitando pagamentos com ", formData);
  try {
    const paymentRequests = createPaymentRequests(formData);
    console.log(`Processando ${paymentRequests.length} solicitações:`, paymentRequests);
    
    // Salva todas as solicitações
    for (const paymentRequest of paymentRequests) {
      await savePaymentRequest(paymentRequest);
    }
    
    return redirect(`/sucesso/solicitar-pagamento?count=${paymentRequests.length}`);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};