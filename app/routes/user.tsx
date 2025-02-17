import { useEffect, useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { UserCategory, UserData } from "~/utils/types";
import { getTelegramUsersInfo } from "~/utils/users";
import { BackButton } from "~/components/Forms/CommonButtons";

import { action } from "~/handlers/actions/user-action";
import { loader } from "~/handlers/loaders/user";
import SendToAction from "~/components/Forms/SendToAction";
export { loader, action };

export default function User() {
  const { currentUserCategories, usersInfo } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    setUser(() => getTelegramUsersInfo());
  }, []);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as any]);
    }
  }, [user]);

  useEffect(() => setUser(() => getTelegramUsersInfo()), []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">
        Dados do Usuário
      </h1>

      {user ? (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold">Olá, {user.first_name}!</h2>
          <ul className="mt-2">
            <li>ID: {user.id}</li>
            <li>
              Nome: {user.first_name} {user.last_name || ""}
            </li>
            <li>Usuário: {user.username || "N/A"}</li>
            <li>Código do Idioma: {user.language_code}</li>
            <li>Premium: {user.is_premium ? "Sim" : "Não"}</li>
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
        {process.env.NODE_ENV === "development" ? (
          <SendToAction
            fields={[
              {
                name: "user",
                value: JSON.stringify({ id: "123", name: "Dev User", role: UserCategory.ANY_USER }),
              },
            ]}
          />
        ) : (
          <SendToAction
            fields={[
              { name: "user", value: JSON.stringify(user) },
            ]}
          />
        )}


        {
          !usersInfo[user?.id as unknown as string] && (
            <button className="button-full">CADASTRAR</button>
          )
        }

        <BackButton />
      </Form>
    </div>
  );
}
