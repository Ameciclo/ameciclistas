import { redirect, ActionFunction, json } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";
import { formatDate } from "~/utils/format";

const createPaymentRequest = (formData: FormData) => {
  const date = formatDate.format(new Date());
  let project = JSON.parse(formData.get("project") as string);
  project.id = project.spreadsheet_id;
  
  return {
    date,
    project,
    budgetItem: formData.get("rubrica"),
    description: formData.get("descricao"),
    value: formData.get("valor"),
    from_chat_id: 0,
    group_message_id: 0,
    invoice_url: "",
    from: JSON.parse(formData.get("telegramusersInfo") as string),
    supplier: JSON.parse(
      formData.get("fornecedores") as string
    ).find((s: any) => s.name === formData.get("fornecedor")),
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
