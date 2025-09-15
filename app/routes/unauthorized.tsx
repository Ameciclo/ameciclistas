import { Link } from "@remix-run/react";
import { useAuth } from "~/utils/useAuth";

export default function Unauthorized() {
  const { isDevMode, devUser } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          🚫 Acesso Negado
        </h1>
        
        <p className="text-gray-600 mb-6">
          Você não tem permissão para acessar esta página.
        </p>

        {isDevMode && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="text-sm">
              <strong>Modo Dev:</strong> Usuário atual: {devUser?.name}
            </p>
            <p className="text-xs">
              Permissões: {devUser?.categories.join(", ")}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link 
            to="/" 
            className="block bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
          >
            Voltar ao Menu Principal
          </Link>
          
          {!isDevMode && (
            <p className="text-sm text-gray-500">
              Entre em contato com a coordenação se precisar de acesso.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}