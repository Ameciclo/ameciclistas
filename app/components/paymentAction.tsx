import { json, redirect, ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const telegramData = request.context.telegram;  // Assumindo que você tem um middleware que injeta os dados do Telegram em 'context'

  const paymentRequest = {
    budgetItem: formData.get("budgetItem"),
    date: Date.now(),
    description: formData.get("description"),
    from: {
      first_name: telegramData.first_name,
      id: telegramData.id,
      is_bot: telegramData.is_bot,
      language_code: telegramData.language_code,
      username: telegramData.username
    },
    from_chat_id: telegramData.chat.id,
    group_message_id: parseInt(formData.get("group_message_id")),
    invoice_url: "",
    project: JSON.parse(formData.get("project")),
    recipientInformation: JSON.parse(formData.get("recipient")),
    recipientName: formData.get("recipientName"),
    value: formData.get("value")
  };

  try {
    const savedRequest = await savePaymentRequest(paymentRequest);
    return redirect("/success");
  } catch (error) {
    console.error("Error saving payment request:", error);
    return json({ error: error.message }, { status: 500 });
  }
};

async function savePaymentRequest(paymentRequest) {
  const ref = db.ref("payments");
  const newPayment = ref.push();
  await newPayment.set(paymentRequest);
  return newPayment.key;
}
