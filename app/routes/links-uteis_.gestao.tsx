import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { BackButton } from "~/components/Forms/Buttons";
import { useAuth } from "~/utils/useAuth";
import { UserCategory, LinkUtil, LinkCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { getUserPermissions, requireAuth } from "~/utils/authMiddleware";
import { loadAllLinksUteis } from "~/handlers/loaders/links-uteis";
import { createLink, updateLink, deleteLink } from "~/handlers/actions/links-uteis";
import { syncRedirectsToCloudflare, findOrCreateRedirectRuleset } from "~/api/cloudflare.server";

async function gestaoLinksLoader({ request }: LoaderFunctionArgs) {
  const links = await loadAllLinksUteis();
  const domain = process.env.AMECICLO_DOMAIN || 'ameciclo.org';
  return json({ links, domain });
}

export const loader = requireAuth(UserCategory.PROJECT_COORDINATORS)(gestaoLinksLoader);

export async function action({ request }: ActionFunctionArgs) {
  const { userPermissions } = await getUserPermissions(request);
  
  if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
    return json({ success: false, message: "Sem permissão para gerenciar links" }, { status: 403 });
  }
  
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create" || intent === "update") {
    const linkData: Record<string, any> = {
      label: formData.get("label") as string,
      url: formData.get("url") as string,
      icon: formData.get("icon") as string,
      requiredPermission: formData.get("requiredPermission") as string,
      description: formData.get("description") as string || "",
      order: parseInt(formData.get("order") as string),
      startDate: formData.get("startDate") as string || "",
      endDate: formData.get("endDate") as string || "",
      color: formData.get("color") as string || "#14b8a6",
      categories: JSON.parse(formData.get("categories") as string),
      active: formData.get("active") === "true",
      subdomain: formData.get("subdomain") as string || "",
    };
    Object.keys(linkData).forEach(k => { if (linkData[k] === "") delete linkData[k]; });

    if (intent === "create") {
      await createLink(linkData as any);
    } else {
      const linkId = formData.get("linkId") as string;
      await updateLink(linkId, linkData);
    }

    const links = await loadAllLinksUteis();
    return json({ ok: true, links });
  }

  if (intent === "delete") {
    const linkId = formData.get("linkId") as string;
    await deleteLink(linkId);
    const links = await loadAllLinksUteis();
    return json({ ok: true, links });
  }

  if (intent === "sync-cloudflare") {
    try {
      const links = await loadAllLinksUteis();
      const domain = process.env.AMECICLO_DOMAIN || 'ameciclo.org';
      const redirects = links
        .filter(l => l.subdomain && !l.url.includes(`${l.subdomain}.${domain}`))
        .map(l => ({
          source_url: `https://${l.subdomain}.${domain}/`,
          target_url: l.url,
          status_code: 301,
        }));

      if (redirects.length === 0) {
        return json({ success: false, message: "Nenhum link com subdomínio ativo para sincronizar." });
      }

      await syncRedirectsToCloudflare(redirects);
      const listName = process.env.CLOUDFLARE_REDIRECT_LIST_NAME || 'ameciclo-links-redirects';
      await findOrCreateRedirectRuleset(listName);

      return json({ success: true, message: `${redirects.length} redirects sincronizados com Cloudflare.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      return json({ success: false, message: `Erro: ${message}` });
    }
  }

  return json({ ok: false });
}

interface SyncData { success: boolean; message?: string; }
interface CrudData { ok: boolean; links: LinkUtil[]; }

export default function GestaoLinksUteis() {
  const { links: initialLinks, domain } = useLoaderData<typeof loader>();
  const { userPermissions } = useAuth();
  const [editingLink, setEditingLink] = useState<LinkUtil | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [linksList, setLinksList] = useState(initialLinks);

  const crudFetcher = useFetcher<CrudData>({ key: "crud-links" });
  const syncFetcher = useFetcher<SyncData>({ key: "sync-cloudflare" });

  useEffect(() => {
    if (crudFetcher.data?.links) {
      setLinksList(crudFetcher.data.links);
      setShowForm(false);
      setEditingLink(null);
    }
  }, [crudFetcher.data]);

  useEffect(() => {
    setLinksList(initialLinks);
  }, [initialLinks]);

  const canManage = userPermissions.includes(UserCategory.AMECICLO_COORDINATORS) ||
                    userPermissions.includes(UserCategory.PROJECT_COORDINATORS);

  if (!canManage) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-red-600 text-center mb-4">⛔ Acesso Negado</h2>
        <p className="text-center">Você não tem permissão para acessar esta página.</p>
        <div className="mt-4"><BackButton /></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600 text-center mb-4">
        🔗 Gestão de Links Úteis
      </h2>

      <syncFetcher.Form method="post" onSubmit={(e) => {
        if (!confirm('Vai substituir todos os redirects no Cloudflare pelos atuais. Continuar?')) {
          e.preventDefault();
        }
      }} className="mb-4">
        <input type="hidden" name="intent" value="sync-cloudflare" />
        <button
          type="submit"
          disabled={syncFetcher.state === "submitting"}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
        >
          {syncFetcher.state === "submitting" ? "⏳ Sincronizando..." : "☁️ Sincronizar redirects com Cloudflare"}
        </button>
        {syncFetcher.data && (
          <div className={`mt-2 text-sm p-2 rounded ${syncFetcher.data.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {syncFetcher.data.message}
          </div>
        )}
      </syncFetcher.Form>

      <button
        onClick={() => { setEditingLink(null); setShowForm(true); }}
        className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg mb-4 hover:bg-teal-700"
      >
        ➕ Adicionar Novo Link
      </button>

      {showForm && !editingLink && (
        <LinkForm link={null} domain={domain} fetcher={crudFetcher} onClose={() => { setShowForm(false); }} />
      )}

      <div className="space-y-4">
        {linksList.map((link) => (
          <div key={link.id} className="bg-white border rounded-lg p-4 shadow">
            {editingLink?.id === link.id && showForm && (
              <LinkForm
                link={editingLink}
                domain={domain}
                fetcher={crudFetcher}
                onClose={() => { setShowForm(false); setEditingLink(null); }}
              />
            )}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{link.icon}</span>
                  <h3 className="font-bold text-lg">{link.label}</h3>
                  {!link.active && <span className="text-xs bg-gray-300 px-2 py-1 rounded">Inativo</span>}
                </div>
                <p className="text-sm text-gray-600 mt-1 break-all">{link.url}</p>
                {link.description && <p className="text-sm text-gray-500 mt-1 break-words">{link.description}</p>}
                {link.subdomain && (
                  <p className="text-sm text-orange-600 mt-1 font-mono break-all">
                    ↪ {link.subdomain}.{domain} → {link.url}
                  </p>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">Ordem: {link.order}</span>
                  <span className="text-xs bg-purple-100 px-2 py-1 rounded">{link.requiredPermission}</span>
                  <span className="text-xs bg-green-100 px-2 py-1 rounded">👆 {link.clicks} cliques</span>
                  {link.categories.map(cat => (
                    <span key={cat} className="text-xs bg-yellow-100 px-2 py-1 rounded">{cat}</span>
                  ))}
                </div>
                {(link.startDate || link.endDate) && (
                  <div className="text-xs text-gray-500 mt-2">
                    📅 {link.startDate && `De: ${new Date(link.startDate).toLocaleDateString()}`}
                    {link.endDate && ` Até: ${new Date(link.endDate).toLocaleDateString()}`}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditingLink(link); setShowForm(true); }} className="text-blue-600 hover:text-blue-800">✏️</button>
                <crudFetcher.Form method="post" onSubmit={(e) => {
                  if (!confirm('Tem certeza que deseja deletar este link?')) { e.preventDefault(); }
                }}>
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="linkId" value={link.id} />
                  <button type="submit" className="text-red-600 hover:text-red-800">🗑️</button>
                </crudFetcher.Form>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8"><BackButton /></div>
    </div>
  );
}

function LinkForm({ link, domain, fetcher, onClose }: { link: LinkUtil | null; domain: string; fetcher: ReturnType<typeof useFetcher>; onClose: () => void }) {
  const [categories, setCategories] = useState<LinkCategory[]>(
    link?.categories || [LinkCategory.PUBLICO, LinkCategory.AMECICLISTAS]
  );

  const [url, setUrl] = useState(link?.url || '');
  const isExternalUrl = !url.includes('ameciclo.org');

  const toggleCategory = (category: LinkCategory) => {
    setCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const isSaving = fetcher.state === "submitting";

  return (
    <div className="bg-white border rounded-lg p-4 shadow-lg mb-4">
      <h3 className="text-xl font-bold mb-4">{link ? "✏️ Editar Link" : "➕ Novo Link"}</h3>

      <fetcher.Form method="post" className="space-y-4">
        <input type="hidden" name="intent" value={link ? "update" : "create"} />
        {link && <input type="hidden" name="linkId" value={link.id} />}
        <input type="hidden" name="categories" value={JSON.stringify(categories)} />

        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input type="text" name="label" defaultValue={link?.label} required className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL *</label>
          <input type="url" name="url" value={url} onChange={e => setUrl(e.target.value)} required className="w-full border rounded px-3 py-2" />
        </div>

        {isExternalUrl ? (
          <div>
            <label className="block text-sm font-medium mb-1">Subdomínio (redirect)</label>
            <div className="flex items-center gap-1">
              <input type="text" name="subdomain" defaultValue={link?.subdomain || ''} placeholder="ex: ocupe" className="flex-1 border rounded px-3 py-2 font-mono" />
              <span className="text-sm text-gray-500 whitespace-nowrap">.{domain}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Se preenchido, cria um redirect: <span className="font-mono">subdomain.{domain}</span> → URL acima.
              Deixa vazio se for apenas um link na página.
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-500">
              🔗 Links para <strong>ameciclo.org</strong> não precisam de subdomínio de redirect.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Ícone (emoji) *</label>
          <input type="text" name="icon" defaultValue={link?.icon} required maxLength={2} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea name="description" defaultValue={link?.description} rows={2} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quem pode ver? *</label>
          <select name="requiredPermission" defaultValue={link?.requiredPermission || UserCategory.ANY_USER} required className="w-full border rounded px-3 py-2">
            <option value={UserCategory.ANY_USER}>Qualquer Usuário</option>
            <option value={UserCategory.AMECICLISTAS}>Ameciclistas</option>
            <option value={UserCategory.PROJECT_COORDINATORS}>Coordenadores de Projeto</option>
            <option value={UserCategory.AMECICLO_COORDINATORS}>Coordenadores Ameciclo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Onde aparece? *</label>
          <div className="space-y-2">
            {Object.values(LinkCategory).map(cat => (
              <label key={cat} className="flex items-center gap-2">
                <input type="checkbox" checked={categories.includes(cat)} onChange={() => toggleCategory(cat)} className="rounded" />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ordem *</label>
            <input type="number" name="order" defaultValue={link?.order || 1} required min={1} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <input type="color" name="color" defaultValue={link?.color || "#14b8a6"} className="w-full border rounded px-3 py-2 h-10" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <input type="date" name="startDate" defaultValue={link?.startDate?.split('T')[0]} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <input type="date" name="endDate" defaultValue={link?.endDate?.split('T')[0]} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" value="true" defaultChecked={link?.active !== false} className="rounded" />
            <span className="text-sm font-medium">Link Ativo</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={isSaving} className="flex-1 bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 disabled:opacity-50">
            {isSaving ? "⏳ Salvando..." : (link ? "💾 Salvar" : "➕ Criar")}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400">❌ Cancelar</button>
        </div>
      </fetcher.Form>
    </div>
  );
}
