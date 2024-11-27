// actions/solicitarPagamentoAction.ts
import { redirect, json, ActionFunction } from "@remix-run/node";
import { savePaymentRequest } from "~/api/firebaseConnection.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  console.log(formData);

  const date = new Date();

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "medium",
  });

  // Parse do campo "project"
  const projectRaw = formData.get("project");
  let project = null;

  try {
    project = projectRaw ? JSON.parse(projectRaw as string) : null;
  } catch (error) {
    console.error("Erro ao fazer parse do campo 'project':", error);
    return json(
      { error: "Erro ao processar os dados do projeto." },
      { status: 400 }
    );
  }

  // Parse do campo "from"
  const fromRaw = formData.get("from");
  let from = null;

  try {
    from = fromRaw ? JSON.parse(fromRaw as string) : null;
  } catch (error) {
    console.error("Erro ao fazer parse do campo 'from':", error);
    return json(
      { error: "Erro ao processar os dados do remetente ('from')." },
      { status: 400 }
    );
  }

  // Parse do campo "recipient_information"
  const recipientInfoRaw = formData.get("recipient_information");
  let recipientInformation = null;

  try {
    recipientInformation = recipientInfoRaw
      ? JSON.parse(recipientInfoRaw as string)
      : null;
  } catch (error) {
    console.error("Erro ao fazer parse do campo 'recipient_information':", error);
    return json(
      { error: "Erro ao processar os dados do destinatário ('recipient_information')." },
      { status: 400 }
    );
  }

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
