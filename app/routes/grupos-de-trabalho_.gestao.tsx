import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { UserCategory, type FirebaseWorkgroup } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { getUserPermissions, requireAuth } from "~/utils/authMiddleware";
import { getWorkgroups, updateWorkgroupMeta } from "~/api/firebaseConnection.server";
import { BackButton } from "~/components/Forms/Buttons";
import FormTitle from "~/components/Forms/FormTitle";

export const loader = requireAuth(UserCategory.AMECICLO_COORDINATORS)(
  async () => {
    const workgroups: FirebaseWorkgroup[] = await getWorkgroups();
    const sorted = [...workgroups].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    return json({ workgroups: sorted });
  }
);

const sanitizeLabel = (label: string) =>
  label.trim().replace(/[.#$/[\]]/g, "").toLowerCase();

function parseLabels(raw: FormDataEntryValue | null): Record<string, boolean> | null {
  if (typeof raw !== "string") return null;

  const labels = raw
    .split(",")
    .map(sanitizeLabel)
    .filter(Boolean);

  if (labels.length === 0) return null;

  return Object.fromEntries(labels.map((label) => [label, true]));
}

export async function action({ request }: ActionFunctionArgs) {
  const { userPermissions } = await getUserPermissions(request);

  if (!isAuth(userPermissions, UserCategory.AMECICLO_COORDINATORS)) {
    return json({ error: "Sem permissão" }, { status: 403 });
  }

  const formData = await request.formData();

  if (formData.get("action") !== "atualizar_meta") {
    return json({ error: "Ação não reconhecida" }, { status: 400 });
  }

  const workgroupKey = formData.get("workgroupKey") as string;
  if (!workgroupKey) {
    return json({ error: "Grupo não informado" }, { status: 400 });
  }

  try {
    await updateWorkgroupMeta(workgroupKey, {
      inviteLink: (formData.get("inviteLink") as string) || "",
      folderUrl: (formData.get("folderUrl") as string) || "",
      folderId: (formData.get("folderId") as string) || "",
      labels: parseLabels(formData.get("labels")),
      lastMetaUpdate: new Date().toISOString(),
    });

    return redirect("/sucesso/workgroup-atualizado");
  } catch (error: any) {
    console.error("Erro ao atualizar grupo de trabalho:", error);
    return json({ error: error.message }, { status: 500 });
  }
}

export default function GruposTrabalhoGestao() {
  const { workgroups } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ error?: string }>();

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton />
      <FormTitle>👥 Gestão de Grupos de Trabalho</FormTitle>

      {fetcher.data?.error && (
        <p className="text-red-600 mb-4">{fetcher.data.error}</p>
      )}

      <p className="text-sm text-gray-600 mb-6">
        Edite o link de convite, a pasta de trabalho e as labels de cada grupo.
        Labels conhecidas: <strong>oculto</strong> (não aparece na listagem geral),{" "}
        <strong>financeiro</strong> (grupo usado pela função financeira).
      </p>

      <div className="space-y-6">
        {workgroups.map((group: FirebaseWorkgroup) => {
          const labels = Object.keys(group.labels || {});

          return (
            <fetcher.Form
              key={group.firebaseKey}
              method="post"
              className="border rounded-lg p-4"
            >
              <input type="hidden" name="action" value="atualizar_meta" />
              <input type="hidden" name="workgroupKey" value={group.firebaseKey} />

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">
                  {group.title || group.name}
                  {group.labels?.oculto && (
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-500 text-white">
                      oculto
                    </span>
                  )}
                </h3>
                {group.memberCount ? (
                  <span className="text-sm text-gray-500">
                    {group.memberCount} membros
                  </span>
                ) : null}
              </div>

              <label className="block text-sm font-medium mb-1">
                Link de convite (inviteLink)
                <input
                  type="url"
                  name="inviteLink"
                  defaultValue={group.inviteLink || ""}
                  placeholder="https://t.me/+..."
                  className="w-full border rounded p-2 mt-1 font-normal"
                />
              </label>

              <label className="block text-sm font-medium mb-1 mt-3">
                Pasta de Trabalho (folderUrl)
                <input
                  type="url"
                  name="folderUrl"
                  defaultValue={group.folderUrl || ""}
                  placeholder="https://drive.google.com/..."
                  className="w-full border rounded p-2 mt-1 font-normal"
                />
              </label>

              <label className="block text-sm font-medium mb-1 mt-3">
                ID da Pasta (folderId)
                <input
                  type="text"
                  name="folderId"
                  defaultValue={group.folderId || ""}
                  className="w-full border rounded p-2 mt-1 font-normal"
                />
              </label>

              <label className="block text-sm font-medium mb-1 mt-3">
                Labels (separadas por vírgula)
                <input
                  type="text"
                  name="labels"
                  defaultValue={labels.join(", ")}
                  placeholder="oculto, financeiro"
                  className="w-full border rounded p-2 mt-1 font-normal"
                />
              </label>

              <button
                type="submit"
                className="button-full mt-4 bg-teal-600 text-white py-2 rounded"
              >
                Salvar
              </button>
            </fetcher.Form>
          );
        })}
      </div>
    </div>
  );
}
