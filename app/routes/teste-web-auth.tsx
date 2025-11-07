import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getWebUser } from "~/api/webAuth.server";
import { getUserPermissions } from "~/utils/authMiddleware";

export async function loader({ request }: LoaderFunctionArgs) {
  const webUser = await getWebUser(request);
  const { userPermissions } = await getUserPermissions(request);
  
  return json({ 
    webUser,
    userPermissions,
    hasWebSession: !!webUser,
    timestamp: new Date().toISOString()
  });
}

export default function TesteWebAuth() {
  const { webUser, userPermissions, hasWebSession, timestamp } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        🧪 Teste de Autenticação Web
      </h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Status da Sessão:</h2>
          <p><strong>Tem sessão web:</strong> {hasWebSession ? '✅ Sim' : '❌ Não'}</p>
          <p><strong>Timestamp:</strong> {timestamp}</p>
        </div>

        {webUser ? (
          <div className="bg-green-100 p-4 rounded">
            <h2 className="font-bold mb-2">Usuário Web Logado:</h2>
            <p><strong>Email:</strong> {webUser.email}</p>
            <p><strong>Nome:</strong> {webUser.name}</p>
            <p><strong>Categoria:</strong> {webUser.category}</p>
            {webUser.cpf && <p><strong>CPF:</strong> {webUser.cpf}</p>}
            {webUser.firebaseId && <p><strong>Firebase ID:</strong> {webUser.firebaseId}</p>}
          </div>
        ) : (
          <div className="bg-yellow-100 p-4 rounded">
            <h2 className="font-bold mb-2">Nenhum usuário web logado</h2>
            <p>Faça login para ver suas informações.</p>
          </div>
        )}

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-bold mb-2">Permissões Detectadas:</h2>
          <p>{userPermissions.join(', ')}</p>
        </div>

        <div className="flex gap-4">
          <Link 
            to="/login" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Ir para Login
          </Link>
          <Link 
            to="/" 
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Voltar ao Menu
          </Link>
          {webUser && (
            <form method="post" action="/auth/logout" className="inline">
              <button 
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}