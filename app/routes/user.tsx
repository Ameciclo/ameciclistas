// app/routes/user.tsx

import { useEffect, useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { UserData } from "~/utils/types";
import { getTelegramUserInfo } from "~/utils/users";
import { BackButton } from "~/components/CommonButtons";

import { action } from "~/handlers/actions/user-action";
import { loader } from "~/handlers/loaders/user";
import SendToAction from "~/components/SendToAction";
export { loader, action };

export default function User() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const { currentUserCategories, userCategoriesObject } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [userInfo, setUserInfo] = useState<UserData | null>(null);

  useEffect(() => {
    setUserInfo(() => getTelegramUserInfo());
  }, []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo]);

  useEffect(() => setUserData(() => getTelegramUserInfo()), []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Dados do Usuário
      </h1>

      {userData ? (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold">Olá, {userData.first_name}!</h2>
          <ul className="mt-2">
            <li>ID: {userData.id}</li>
            <li>
              Nome: {userData.first_name} {userData.last_name || ""}
            </li>
            <li>Usuário: {userData.username || "N/A"}</li>
            <li>Código do Idioma: {userData.language_code}</li>
            <li>Premium: {userData.is_premium ? "Sim" : "Não"}</li>
            <li>Permissao: {userPermissions}</li>
          </ul>
          <br />
          <br />
        </div>
      ) : (
        <div className="mt-6 text-center">
          {process.env.NODE_ENV === "development"
            ? "O ambiente de Desenvolvimento não é capaz de carregar as informações de usuário telegram"
            : "Carregando..."}
          <br />
          <br />
        </div>
      )}

      <Form method="post" className="container">
        <SendToAction
          fields={[
            { name: "user", value: JSON.stringify(userData) },
          ]}
        />
        
        {
          !userCategoriesObject[userData?.id as unknown as string] && (
            <button className="button-full">SOU AMECICLISTA</button>
          )
        }
        <BackButton />
      </Form>
    </div>
  );
}
