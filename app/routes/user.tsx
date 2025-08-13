import { useEffect, useState } from "react";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { UserCategory, UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import { BackButton } from "~/components/Forms/Buttons";
import { formatCPF, formatPhone } from "~/utils/format";
import { validateCPF } from "~/utils/idNumber";
import db from "~/api/firebaseAdmin.server.js";

import { loader } from "~/handlers/loaders/user";
import SendToAction from "~/components/Forms/SendToAction";
export { loader };

// Nova action para salvar dados pessoais
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  
  if (actionType === "updatePersonalInfo") {
    const userId = formData.get("userId") as string;
    const email = formData.get("email") as string;
    const cpf = formData.get("cpf") as string;
    const telefone = formData.get("telefone") as string;
    
    // Simular em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log("[DEV] Simulando salvamento de dados pessoais:", {
        userId,
        email,
        cpf,
        telefone
      });
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return json({ 
        success: true, 
        message: "[DEV] Informações simuladas salvas com sucesso!" 
      });
    }
    
    try {
      const userRef = db.ref(`subscribers/${userId}`);
      await userRef.update({
        "ameciclo_register/email": email || null,
        "ameciclo_register/cpf": cpf || null,
        "ameciclo_register/telefone": telefone || null,
        "ameciclo_register/updated_at": new Date().toISOString()
      });
      
      return json({ success: true, message: "Informações atualizadas com sucesso!" });
    } catch (error) {
      console.error("Erro ao atualizar informações:", error);
      return json({ success: false, error: "Erro ao salvar informações" });
    }
  }
  
  // Action original para cadastro
  const user = {
    id: JSON.parse(formData.get("user") as string).id,
    name: `${JSON.parse(formData.get("user") as string).first_name} ${
      JSON.parse(formData.get("user") as string).last_name || ""
    }`,
    role: UserCategory.ANY_USER,
    telegram_user: JSON.parse(formData.get("user") as string),
  };

  try {
    const userRef = db.ref(`subscribers/${user.id}`);
    await userRef.update(user);
    return json({ success: true, message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.log(error);
    return json({ success: false, error: "Erro ao cadastrar usuário" });
  }
}

export default function User() {
  const { currentUserCategories, usersInfo } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [user, setUser] = useState<UserData | null>(null);
  const [showPersonalForm, setShowPersonalForm] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    email: "",
    cpf: "",
    telefone: ""
  });

  useEffect(() => {
    const telegramUser = getTelegramUsersInfo();
    
    // Em desenvolvimento, simular dados do usuário
    if (process.env.NODE_ENV === "development" && !telegramUser) {
      setUser({
        id: 123456789,
        first_name: "João",
        last_name: "Silva",
        username: "joaosilva",
        language_code: "pt-br",
        is_premium: false
      } as UserData);
    } else {
      setUser(telegramUser);
    }
  }, []);

  useEffect(() => {
    const userId = user?.id?.toString();
    
    if (userId && usersInfo[userId]) {
      setUserPermissions([usersInfo[userId].role as any]);
      // Carregar dados pessoais existentes
      const userData = usersInfo[userId];
      if (userData.ameciclo_register) {
        setPersonalInfo({
          email: userData.ameciclo_register.email || "",
          cpf: userData.ameciclo_register.cpf || "",
          telefone: userData.ameciclo_register.telefone || ""
        });
      }
    } else if (process.env.NODE_ENV === "development" && userId) {
      // Simular dados existentes em desenvolvimento
      setPersonalInfo({
        email: "joao@exemplo.com",
        cpf: "123.456.789-00",
        telefone: "(81) 99999-9999"
      });
    }
  }, [user, usersInfo]);

  // Resetar formulário após sucesso
  useEffect(() => {
    if (actionData?.success) {
      setShowPersonalForm(false);
    }
  }, [actionData]);

  const handlePersonalInfoChange = (field: string, value: string) => {
    let formattedValue = value;
    if (field === "cpf") {
      formattedValue = formatCPF(value);
    } else if (field === "telefone") {
      formattedValue = formatPhone(value);
    }
    setPersonalInfo(prev => ({ ...prev, [field]: formattedValue }));
  };

  const isCPFValid = personalInfo.cpf ? validateCPF(personalInfo.cpf) : true;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Suas Informações
      </h1>

      {actionData?.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {actionData.message}
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      {user ? (
        <div className="mt-6">
          {process.env.NODE_ENV === "development" && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              <strong>Modo Desenvolvimento:</strong> Dados simulados para teste
            </div>
          )}
          
          {/* Informações do Telegram */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Informações do Telegram</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Nome:</span> {user.first_name} {user.last_name || ""}
              </div>
              <div>
                <span className="font-medium">Usuário:</span> {user.username || "N/A"}
              </div>
              <div>
                <span className="font-medium">ID:</span> {user.id}
              </div>
              <div>
                <span className="font-medium">Permissão:</span> {userPermissions}
              </div>
            </div>
          </div>

          {/* Informações Pessoais */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Informações Pessoais</h2>
              <button
                onClick={() => setShowPersonalForm(!showPersonalForm)}
                className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
              >
                {showPersonalForm ? "Cancelar" : "Editar"}
              </button>
            </div>
            
            {!showPersonalForm ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Email:</span> {personalInfo.email || "Não informado"}
                </div>
                <div>
                  <span className="font-medium">CPF:</span> {personalInfo.cpf || "Não informado"}
                </div>
                <div>
                  <span className="font-medium">Telefone:</span> {personalInfo.telefone || "Não informado"}
                </div>
              </div>
            ) : (
              <Form method="post" className="space-y-4">
                <input type="hidden" name="actionType" value="updatePersonalInfo" />
                <input type="hidden" name="userId" value={user.id?.toString()} />
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={personalInfo.cpf}
                    onChange={(e) => handlePersonalInfoChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                      personalInfo.cpf && !isCPFValid
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-teal-500"
                    }`}
                  />
                  {personalInfo.cpf && !isCPFValid && (
                    <span className="text-red-500 text-sm mt-1">CPF inválido</span>
                  )}
                </div>
                
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    value={personalInfo.telefone}
                    onChange={(e) => handlePersonalInfoChange("telefone", e.target.value)}
                    placeholder="(81) 99999-9999"
                    maxLength={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPersonalForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={personalInfo.cpf && !isCPFValid}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      personalInfo.cpf && !isCPFValid
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                    }`}
                  >
                    Salvar Informações
                  </button>
                </div>
              </Form>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 text-center">
          <div className="bg-gray-100 p-4 rounded">
            Carregando informações do usuário...
          </div>
        </div>
      )}

      {/* Cadastro inicial se usuário não existe */}
      {user && !usersInfo[user?.id?.toString() as string] && process.env.NODE_ENV !== "development" && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="mb-4">Você ainda não está cadastrado no sistema. Clique no botão abaixo para se cadastrar.</p>
          <Form method="post">
            <SendToAction
              fields={[
                { name: "user", value: JSON.stringify(user) },
              ]}
            />
            <button className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700">
              CADASTRAR
            </button>
          </Form>
        </div>
      )}

      <div className="mt-6">
        <BackButton />
      </div>
    </div>
  );
}
