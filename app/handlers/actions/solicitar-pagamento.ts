import { redirect, ActionFunction } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";

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
    recipientInformation: JSON.parse(
      formData.get("fornecedores") as string
    ).find((s: any) => s.nome === formData.get("fornecedor")),
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
    return Response.json({ error: error.message }, { status: 500 });
  }
};
