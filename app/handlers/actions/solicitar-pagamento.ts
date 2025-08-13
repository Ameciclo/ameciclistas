// handlers/actions/solicitar-pagamento.ts
import { redirect, ActionFunction, json } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";
import { formatDate } from "~/utils/format";

interface PaymentItem {
  id: string;
  transactionType: string;
  paymentDate: string;
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

    const unitValueFormatted = (parseFloat(item.unitValue || '0') / 100).toFixed(2).replace('.', ',');
    const totalValueFormatted = `R$ ${(parseFloat(item.totalValue || '0') / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const description = `${item.description} (${item.quantity} ${item.unitName}${item.quantity > 1 ? 's' : ''} × R$ ${unitValueFormatted})`;

    return {
      from,
      paymentDate: item.paymentDate,
      transactionType: item.transactionType,
      project,
      budgetItem: item.budgetItem,
      supplier,
      isRefund: item.isRefund,
      refundSupplier: refundSupplier || "",
      description,
      value: totalValueFormatted,
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
    
    // Em desenvolvimento, apenas mostra no console
    if (process.env.NODE_ENV === 'development') {
      console.log('🚧 MODO DESENVOLVIMENTO - Não enviando para Firebase');
      console.log('📋 Solicitações que seriam enviadas:');
      paymentRequests.forEach((request, i) => {
        console.log(`\n📄 Solicitação ${i + 1}:`, JSON.stringify(request, null, 2));
      });
    } else {
      // Salva todas as solicitações uma a uma
      for (let i = 0; i < paymentRequests.length; i++) {
        console.log(`Salvando solicitação ${i + 1} de ${paymentRequests.length}`);
        await savePaymentRequest(paymentRequests[i]);
        console.log(`Solicitação ${i + 1} salva com sucesso`);
      }
    }
    
    return redirect(`/sucesso/solicitar-pagamento?count=${paymentRequests.length}`);
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};