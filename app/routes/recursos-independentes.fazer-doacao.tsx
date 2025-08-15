import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { saveDonation, getUsersFirebase } from "~/api/firebaseConnection.server";
import { SaleStatus, UserData, UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";

export const loader: LoaderFunction = async () => {
  const users = await getUsersFirebase();
  return json({ users });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  
  try {
    const description = formData.get("description") as string;
    
    const donationData = {
      userId: parseInt(formData.get("userId") as string),
      userName: formData.get("userName") as string,
      value: parseFloat(formData.get("value") as string),
      status: SaleStatus.PENDING,
      description: description,
    };
    
    // Apenas adicionar description se tiver valor válido
    if (description && description.trim() !== "") {
      donationData.description = description.trim();
    }

    await saveDonation(donationData);
    return redirect("/recursos-independentes/meus-consumos?success=donation");
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export default function FazerDoacao() {
  const { users } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [user, setUser] = useState<UserData | null>(null);
  const [value, setValue] = useState("");
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    telegramInit();
    const userData = getTelegramUsersInfo();
    setUser(userData);
    
    // Verificar se é coordenador e definir permissões
    if (userData?.id && users[userData.id]) {
      const userRole = users[userData.id].role;
      setIsCoordinator(userRole === UserCategory.PROJECT_COORDINATORS);
      setUserPermissions([userRole]);
    }
  }, [users]);

  const predefinedValues = [10, 20, 50, 100];

  if (!isAuth(userPermissions, UserCategory.AMECICLISTAS)) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-4">
          <Link to="/recursos-independentes" className="text-teal-600 hover:text-teal-700">
            ← Voltar ao Menu
          </Link>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Acesso Negado:</strong> Você precisa ser Ameciclista para acessar esta página.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Link to="/recursos-independentes" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-teal-600 text-center mb-6">
        Fazer Doação
      </h1>

      <div className="max-w-md mx-auto">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400">💝</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Sua doação ajuda a manter as atividades da Ameciclo e contribui para a mobilidade urbana sustentável!
              </p>
            </div>
          </div>
        </div>

        {actionData?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-4">
          <input type="hidden" name="userId" value={user?.id || ""} />
          <input type="hidden" name="userName" value={showCustomerForm ? customerName : (user?.first_name || "")} />
          
          {isCoordinator && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Registrar doação para:</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="customerType"
                    checked={!showCustomerForm}
                    onChange={() => setShowCustomerForm(false)}
                    className="text-teal-600"
                  />
                  <span>Para mim</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="customerType"
                    checked={showCustomerForm}
                    onChange={() => setShowCustomerForm(true)}
                    className="text-teal-600"
                  />
                  <span>Para outra pessoa</span>
                </label>
              </div>
              
              {showCustomerForm && (
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Nome completo do doador"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required={showCustomerForm}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Doação (R$)
            </label>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              {predefinedValues.map((predefinedValue) => (
                <button
                  key={predefinedValue}
                  type="button"
                  onClick={() => setValue(predefinedValue.toString())}
                  className={`p-2 border rounded-lg text-sm ${
                    value === predefinedValue.toString()
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  R$ {predefinedValue}
                </button>
              ))}
            </div>
            
            <input
              type="number"
              name="value"
              min="1"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ou digite um valor personalizado"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem (opcional)
            </label>
            <textarea
              name="description"
              placeholder="Deixe uma mensagem sobre sua doação..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              rows={3}
            />
          </div>

          {value && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Resumo da Doação</h3>
              <p className="text-lg font-bold text-teal-600">
                Valor: R$ {parseFloat(value || "0").toFixed(2)}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!value || !user || (showCustomerForm && !customerName)}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Registrar Doação
          </button>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Após registrar, você receberá as instruções para pagamento via PIX
          </p>
        </div>
      </div>
    </div>
  );
}