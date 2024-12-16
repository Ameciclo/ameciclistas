// app/routes/user.tsx

import { useEffect, useState } from 'react';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { UserData } from '~/utils/types';
import { getTelegramUserInfo } from '~/utils/users';
import { loader } from "../handlers/solicitar-pagamento-loader";
import { action } from "../handlers/solicitar-pagamento-action";
export { loader, action }

export default function User() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const { userCategoriesObject } = useLoaderData<typeof loader>();

  useEffect(() => setUserData(() => getTelegramUserInfo()), []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">Dados do Usuário</h1>

      {userData ? (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold">Olá, {userData.first_name}!</h2>
          <ul className="mt-2">
            <li>ID: {userData.id}</li>
            <li>Nome: {userData.first_name} {userData.last_name || ''}</li>
            <li>Usuário: {userData.username || 'N/A'}</li>
            <li>Código do Idioma: {userData.language_code}</li>
            <li>Premium: {userData.is_premium ? 'Sim' : 'Não'}</li>
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

      <Form method='post' className='container'>
        <input type="hidden" name="actionType" value="createUser" />
        <input type="hidden" name="user" value={JSON.stringify(userData)} />
        {!userCategoriesObject[userData?.id as unknown as string] && <button className="button-full">SOU AMECICLISTA</button>}
        <Link to="/" className="mt-4">
          <button className="button-secondary-full">
          ⬅️ Voltar
          </button>
        </Link>
      </Form>

    </div>
  );
}
