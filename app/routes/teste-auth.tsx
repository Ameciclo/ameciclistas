import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/utils/authMiddleware";
import { UserCategory } from "~/utils/types";

const originalLoader = async ({ request }: LoaderFunctionArgs) => {
  return json({ 
    message: "Você tem acesso a esta página protegida!",
    timestamp: new Date().toISOString()
  });
};

export const loader = requireAuth(UserCategory.AMECICLISTAS)(originalLoader);

export default function TesteAuth() {
  const { message, timestamp } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ✅ Teste de Autorização
      </h1>
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p className="font-semibold">{message}</p>
        <p className="text-sm">Carregado em: {timestamp}</p>
        <p className="text-sm mt-2">
          <strong>Permissão necessária:</strong> AMECICLISTAS ou superior
        </p>
      </div>

      <div className="mt-6">
        <a href="/" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
          Voltar ao Menu
        </a>
      </div>
    </div>
  );
}