// app/routes/user.tsx

import { useEffect, useState } from 'react';
import { Link } from '@remix-run/react';
import { UserData } from '~/api/types';
import { getTelegramUserInfo } from '~/api/users';


export default function User() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => setUserData(() => getTelegramUserInfo()), []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">Dados do Usuário</h1>
      
      {userData ? (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold">Bem-vindo, {userData.first_name}!</h2>
          <ul className="mt-2">
            <li>ID: {userData.id}</li>
            <li>Nome: {userData.first_name} {userData.last_name || ''}</li>
            <li>Usuário: {userData.username || 'N/A'}</li>
            <li>Código do Idioma: {userData.language_code}</li>
            <li>Premium: {userData.is_premium ? 'Sim' : 'Não'}</li>
          </ul>
        </div>
      ) : (
        <div className="mt-6 text-center">Carregando...</div>
      )}

      <Link to="/" className="mt-4 inline-block">
        <button className="button-secondary-full">
          Voltar
        </button>
      </Link>
    </div>
  );
}
