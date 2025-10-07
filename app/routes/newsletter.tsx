import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import { getCalendarEvents } from "~/api/calendar.server";
import { sendNewsletter } from "~/api/newsletter.server";
import { NewsletterPreview } from "~/components/NewsletterPreview";
import { UserCategory } from "~/utils/types";
import { requireAuth, getUserPermissions } from "~/utils/authMiddleware";
import { getWebUser } from "~/api/webAuth.server";
import { isAuth } from "~/utils/isAuthorized";
import { useAuth } from "~/utils/useAuth";
import { getUsersFirebase } from "~/api/firebaseConnection.server";

async function originalLoader({ request }: LoaderFunctionArgs) {
  const { userPermissions } = await getUserPermissions(request);
  const canSend = isAuth(userPermissions, UserCategory.AMECICLO_COORDINATORS);
  
  // Buscar email do usuário logado (web ou telegram)
  let userEmail = null;
  
  // Primeiro, tentar usuário web
  const webUser = await getWebUser(request);
  if (webUser) {
    userEmail = webUser.email;
  } else {
    // Fallback para usuário Telegram
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get("userId");
      
      if (userId) {
        const users = await getUsersFirebase();
        const user = users?.[userId];
        userEmail = user?.ameciclo_register?.email || null;
      }
      
      // Em desenvolvimento, usar email padrão se não encontrar
      if (!userEmail && process.env.NODE_ENV === "development") {
        userEmail = "ti@ameciclo.org";
      }
    } catch (error) {
      console.warn("Erro ao buscar email do usuário:", error);
      // Fallback para desenvolvimento
      if (process.env.NODE_ENV === "development") {
        userEmail = "ti@ameciclo.org";
      }
    }
  }

  try {
    const url = new URL(request.url);
    const monthOffset = parseInt(url.searchParams.get("month") || "-1");
    
    const events = await getCalendarEvents(monthOffset);
    const subject = getSubject(monthOffset);
    
    return json({ events, subject, canSend, userEmail, monthOffset });
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
    return json({ events: [], subject: "", error: "Erro ao carregar eventos", canSend: false, userEmail, monthOffset: -1 });
  }
}

export const loader = requireAuth(UserCategory.PROJECT_COORDINATORS)(originalLoader);

export async function action({ request }: ActionFunctionArgs) {
  const { userPermissions } = await getUserPermissions(request);
  
  if (!isAuth(userPermissions, UserCategory.AMECICLO_COORDINATORS)) {
    return json({ error: "Acesso negado" }, { status: 403 });
  }

  const formData = await request.formData();
  const isTest = formData.get("isTest") === "true";
  const userEmail = formData.get("userEmail") as string;
  
  try {
    const monthOffset = parseInt(formData.get("monthOffset") as string || "-1");
    const events = await getCalendarEvents(monthOffset);
    const result = await sendNewsletter(events, isTest, userEmail);
    
    return json({ 
      success: true, 
      message: `Newsletter enviada com sucesso! ${result.emailsSent} emails enviados.`
    });
  } catch (error) {
    console.error("Erro ao enviar newsletter:", error);
    return json({ error: "Erro ao enviar newsletter" }, { status: 500 });
  }
}

function getSubject(monthOffset = -1) {
  const now = new Date();
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  return `Boletim informativo ${monthNames[targetMonth.getMonth()]} de ${targetMonth.getFullYear()}`;
}

export default function Newsletter() {
  const { events, subject, error, canSend, userEmail, monthOffset } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { userPermissions, isDevMode } = useAuth();
  const [isTest, setIsTest] = useState(true);
  
  // Verificar se pode enviar baseado nas permissões do cliente também
  const canSendClient = isAuth(userPermissions, UserCategory.AMECICLO_COORDINATORS);

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Erro: {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Newsletter Ameciclo</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">{subject}</h2>
          <div className="flex gap-2">
            <a 
              href="?month=-1" 
              className={`px-3 py-1 rounded text-sm ${monthOffset === -1 ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 border'}`}
            >
              Mês Anterior
            </a>
            <a 
              href="?month=0" 
              className={`px-3 py-1 rounded text-sm ${monthOffset === 0 ? 'bg-teal-600 text-white' : 'bg-white text-teal-600 border'}`}
            >
              Mês Atual
            </a>
          </div>
        </div>
        <p className="text-sm text-gray-600">{events.length} eventos encontrados</p>
      </div>

      <NewsletterPreview events={events} subject={subject} />

      {(canSend || canSendClient) && (
        <div className="mt-8 p-4 bg-teal-50 rounded">
          <h3 className="text-lg font-semibold mb-4">Enviar Newsletter</h3>
          
          <Form method="post" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="isTest"
                    value="true"
                    checked={isTest}
                    onChange={() => setIsTest(true)}
                  />
                  <span>Teste (enviar para: {userEmail || 'email não cadastrado'})</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="isTest"
                    value="false"
                    checked={!isTest}
                    onChange={() => setIsTest(false)}
                  />
                  <span>Envio oficial (contato@ameciclo.org)</span>
                </label>
              </div>
              
              {isTest && !userEmail && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Você precisa cadastrar seu email em "Suas informações" para receber o teste
                </p>
              )}
            </div>
            
            <input type="hidden" name="userEmail" value={userEmail || ""} />
            <input type="hidden" name="monthOffset" value={monthOffset} />
            
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-3 px-6 rounded text-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              TUDO CERTO, ENVIAR!
            </button>
          </Form>

          {actionData?.error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {actionData.error}
            </div>
          )}

          {actionData?.success && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              {actionData.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}