import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useFetcher, useNavigate } from "@remix-run/react";
import { BackButton } from "~/components/Forms/Buttons";
import { UserCategory, LinkUtil, LinkCategory } from "~/utils/types";
import { ProtectedComponent } from "~/components/ProtectedComponent";
import { useAuth } from "~/utils/useAuth";
import { loadLinksUteis } from "~/handlers/loaders/links-uteis";
import { incrementClick } from "~/handlers/actions/links-uteis";
import { useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const gestao = url.searchParams.get('gestao');
  
  // Se tem parâmetro gestao=true, redirecionar para a página de gestão
  if (gestao === 'true') {
    return redirect('/links-uteis/gestao');
  }
  
  const links = await loadLinksUteis(LinkCategory.AMECICLISTAS);
  return json({ links });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "click") {
    const linkId = formData.get("linkId") as string;
    await incrementClick(linkId);
  }
  
  return json({ success: true });
}

export default function LinksUteis() {
  const { links } = useLoaderData<typeof loader>();
  const { userPermissions, isDevMode, devUser } = useAuth();
  const fetcher = useFetcher();

  const handleLinkClick = (linkId: string, url: string) => {
    fetcher.submit(
      { intent: "click", linkId },
      { method: "post" }
    );
    window.open(url, '_blank');
  };

  // Filtrar links por permissão do usuário (já vem filtrado por categoria AMECICLISTAS do loader)
  const filteredLinks = links.filter(link => {
    // Coordenadores veem tudo
    if (userPermissions.includes(UserCategory.PROJECT_COORDINATORS) || 
        userPermissions.includes(UserCategory.AMECICLO_COORDINATORS)) {
      return true;
    }
    // Links públicos todos veem
    if (link.requiredPermission === UserCategory.ANY_USER) {
      return true;
    }
    // Verifica se tem a permissão específica
    return userPermissions.includes(link.requiredPermission);
  });
  
  return (
    <div className="container mx-auto p-4 flex flex-col">
      <div className="mb-4">
        <Link to="/" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu Principal
        </Link>
      </div>
      
      <h2 className="text-2xl font-bold text-teal-600 text-center mb-4">
        🔗 Links Úteis
      </h2>

      {isDevMode && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            🧪 <strong>Modo Dev:</strong> Testando como {devUser?.name}
          </p>
          <p className="text-xs">Permissões: {userPermissions.join(", ")}</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => handleLinkClick(link.id, link.url)}
            className="w-full text-left bg-white border rounded-lg p-4 shadow hover:shadow-md transition-shadow"
            style={{ borderLeftColor: link.color, borderLeftWidth: '4px' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{link.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{link.label}</h3>
                {link.description && (
                  <p className="text-sm text-gray-600">{link.description}</p>
                )}
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </button>
        ))}
      </div>

      {filteredLinks.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Nenhum link disponível no momento.
        </div>
      )}

      <ProtectedComponent requiredPermission={UserCategory.AMECICLISTAS}>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          <p className="text-sm">
            ✅ <strong>Área para Ameciclistas:</strong> Você tem acesso aos links internos!
          </p>
        </div>
      </ProtectedComponent>

      <div className="mt-8">
        <BackButton />
      </div>
    </div>
  );
}
