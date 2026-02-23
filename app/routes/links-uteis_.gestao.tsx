import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, Form } from "@remix-run/react";
import { useState } from "react";
import { BackButton } from "~/components/Forms/Buttons";
import { ProtectedComponent } from "~/components/ProtectedComponent";
import { useAuth } from "~/utils/useAuth";
import { UserCategory, LinkUtil, LinkCategory } from "~/utils/types";
import { loadLinksUteis } from "~/handlers/loaders/links-uteis";
import { createLink, updateLink, deleteLink } from "~/handlers/actions/links-uteis";

export async function loader({ request }: LoaderFunctionArgs) {
  const links = await loadLinksUteis(); // Sem filtro de categoria - carrega todos
  return json({ links });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create" || intent === "update") {
    const linkData = {
      label: formData.get("label") as string,
      url: formData.get("url") as string,
      icon: formData.get("icon") as string,
      requiredPermission: formData.get("requiredPermission") as UserCategory,
      description: formData.get("description") as string || undefined,
      order: parseInt(formData.get("order") as string),
      startDate: formData.get("startDate") as string || undefined,
      endDate: formData.get("endDate") as string || undefined,
      color: formData.get("color") as string || "#14b8a6",
      categories: JSON.parse(formData.get("categories") as string) as LinkCategory[],
      active: formData.get("active") === "true"
    };

    if (intent === "create") {
      await createLink(linkData);
    } else {
      const linkId = formData.get("linkId") as string;
      await updateLink(linkId, linkData);
    }
    
    return redirect('/links-uteis/gestao');
  }

  if (intent === "delete") {
    const linkId = formData.get("linkId") as string;
    await deleteLink(linkId);
    return redirect('/links-uteis/gestao');
  }

  return json({ success: false });
}

export default function GestaoLinksUteis() {
  const { links } = useLoaderData<typeof loader>();
  const { userPermissions } = useAuth();
  const navigate = useNavigate();
  const [editingLink, setEditingLink] = useState<LinkUtil | null>(null);
  const [showForm, setShowForm] = useState(false);

  const canManage = userPermissions.includes(UserCategory.AMECICLO_COORDINATORS) || 
                    userPermissions.includes(UserCategory.PROJECT_COORDINATORS);

  if (!canManage) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-red-600 text-center mb-4">
          ⛔ Acesso Negado
        </h2>
        <p className="text-center">Você não tem permissão para acessar esta página.</p>
        <div className="mt-4">
          <BackButton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600 text-center mb-4">
        🔗 Gestão de Links Úteis
      </h2>

      <button
        onClick={() => {
          setEditingLink(null);
          setShowForm(true);
        }}
        className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg mb-4 hover:bg-teal-700"
      >
        ➕ Adicionar Novo Link
      </button>

      {showForm && !editingLink && (
        <LinkForm
          link={null}
          onClose={() => {
            setShowForm(false);
          }}
        />
      )}

      <div className="space-y-4">
        {links.map((link) => (
          <div key={link.id} className="bg-white border rounded-lg p-4 shadow">
            {editingLink?.id === link.id && showForm && (
              <LinkForm
                link={editingLink}
                onClose={() => {
                  setShowForm(false);
                  setEditingLink(null);
                }}
              />
            )}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{link.icon}</span>
                  <h3 className="font-bold text-lg">{link.label}</h3>
                  {!link.active && (
                    <span className="text-xs bg-gray-300 px-2 py-1 rounded">Inativo</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{link.url}</p>
                {link.description && (
                  <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                    Ordem: {link.order}
                  </span>
                  <span className="text-xs bg-purple-100 px-2 py-1 rounded">
                    {link.requiredPermission}
                  </span>
                  <span className="text-xs bg-green-100 px-2 py-1 rounded">
                    👆 {link.clicks} cliques
                  </span>
                  {link.categories.map(cat => (
                    <span key={cat} className="text-xs bg-yellow-100 px-2 py-1 rounded">
                      {cat}
                    </span>
                  ))}
                </div>
                {(link.startDate || link.endDate) && (
                  <div className="text-xs text-gray-500 mt-2">
                    📅 {link.startDate && `De: ${new Date(link.startDate).toLocaleDateString()}`}
                    {link.endDate && ` Até: ${new Date(link.endDate).toLocaleDateString()}`}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingLink(link);
                    setShowForm(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✏️
                </button>
                <Form method="post" onSubmit={(e) => {
                  if (!confirm('Tem certeza que deseja deletar este link?')) {
                    e.preventDefault();
                  }
                }}>
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="linkId" value={link.id} />
                  <button type="submit" className="text-red-600 hover:text-red-800">
                    🗑️
                  </button>
                </Form>
              </div>
            </div>
            {editingLink?.id === link.id && showForm && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Editando este link acima ↑</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <BackButton />
      </div>
    </div>
  );
}

function LinkForm({ link, onClose }: { link: LinkUtil | null; onClose: () => void }) {
  const [categories, setCategories] = useState<LinkCategory[]>(
    link?.categories || [LinkCategory.PUBLICO, LinkCategory.AMECICLISTAS]
  );

  const toggleCategory = (category: LinkCategory) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-lg mb-4">
      <h3 className="text-xl font-bold mb-4">
        {link ? "✏️ Editar Link" : "➕ Novo Link"}
      </h3>
      
      <Form method="post" className="space-y-4">
        <input type="hidden" name="intent" value={link ? "update" : "create"} />
        {link && <input type="hidden" name="linkId" value={link.id} />}
        <input type="hidden" name="categories" value={JSON.stringify(categories)} />

        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input
            type="text"
            name="label"
            defaultValue={link?.label}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL *</label>
          <input
            type="url"
            name="url"
            defaultValue={link?.url}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ícone (emoji) *</label>
          <input
            type="text"
            name="icon"
            defaultValue={link?.icon}
            required
            maxLength={2}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            name="description"
            defaultValue={link?.description}
            rows={2}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Permissão Necessária *</label>
          <select
            name="requiredPermission"
            defaultValue={link?.requiredPermission || UserCategory.ANY_USER}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value={UserCategory.ANY_USER}>Qualquer Usuário</option>
            <option value={UserCategory.AMECICLISTAS}>Ameciclistas</option>
            <option value={UserCategory.PROJECT_COORDINATORS}>Coordenadores de Projeto</option>
            <option value={UserCategory.AMECICLO_COORDINATORS}>Coordenadores Ameciclo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Categorias *</label>
          <div className="space-y-2">
            {Object.values(LinkCategory).map(cat => (
              <label key={cat} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="rounded"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ordem *</label>
            <input
              type="number"
              name="order"
              defaultValue={link?.order || 1}
              required
              min={1}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <input
              type="color"
              name="color"
              defaultValue={link?.color || "#14b8a6"}
              className="w-full border rounded px-3 py-2 h-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Data Início</label>
            <input
              type="date"
              name="startDate"
              defaultValue={link?.startDate?.split('T')[0]}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data Fim</label>
            <input
              type="date"
              name="endDate"
              defaultValue={link?.endDate?.split('T')[0]}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              value="true"
              defaultChecked={link?.active !== false}
              className="rounded"
            />
            <span className="text-sm font-medium">Link Ativo</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700"
          >
            {link ? "💾 Salvar" : "➕ Criar"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            ❌ Cancelar
          </button>
        </div>
      </Form>
    </div>
  );
}
