'use client';

import { Link } from "@remix-run/react";
import WebApp from '@twa-dev/sdk'; // Importando o SDK do Telegram WebApp
import { useEffect, useState } from 'react';

// Define a interface para os dados do usuário
interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function Index() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Verifica se está no ambiente do navegador
    if (typeof window !== 'undefined' && WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData);
    }
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-teal-600 text-center">Ameciclobot Miniapp</h1>
      
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

      <div className="mt-6">
        <Link to="/criar-evento">
          <button className="button-full">
            📅 Criar Evento
          </button>
        </Link>
        <Link to="/solicitar-pagamento">
          <button className="button-full">
            💰 Solicitar Pagamento
          </button>
        </Link>
        <Link to="/adicionar-fornecedor">
          <button className="button-full">
            📦 Adicionar Fornecedor
          </button>
        </Link>
        <Link to="/links-uteis">
          <button className="button-full">
            🔗 Lista de Links Úteis
          </button>
        </Link>
        <Link to="/grupos-de-trabalho">
          <button className="button-full">
            👥 Grupos de Trabalho
          </button>
        </Link>
        <Link to="/lista-projetos">
          <button className="button-full">
            📊 Projetos em Andamento
          </button>
        </Link>
      </div>
    </div>
  );
}
