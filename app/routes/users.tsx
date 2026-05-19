import React, { useState } from "react";
import { useLoaderData, Link } from "@remix-run/react";
import { UserCategory } from "~/utils/types";
import { loader as originalLoader } from "~/handlers/loaders/users";
import { action } from "~/handlers/actions/users-action";
import { BackButton } from "~/components/Forms/Buttons";
import { useAuth } from "~/utils/useAuth";
import { requireAuth } from "~/utils/authMiddleware";

export const loader = requireAuth(UserCategory.AMECICLO_COORDINATORS)(originalLoader);
export { action };

const roles = [
    UserCategory.ANY_USER,
    UserCategory.AMECICLISTAS,
    UserCategory.PROJECT_COORDINATORS,
    UserCategory.AMECICLO_COORDINATORS,
];

const roleLabels: Record<string, { label: string; color: string }> = {
    [UserCategory.ANY_USER]: { label: "Pessoa externa", color: "#6b7280" },
    [UserCategory.AMECICLISTAS]: { label: "Ameciclista", color: "#14b8a6" },
    [UserCategory.PROJECT_COORDINATORS]: { label: "Coordenação Genérica", color: "#f59e0b" },
    [UserCategory.AMECICLO_COORDINATORS]: { label: "Coordenação Ameciclo", color: "#ef4444" },
};

const UserManagement: React.FC = () => {
    const { usersInfo } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    useAuth();
    const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const filteredUsers = Object.values(usersInfo).filter((user: any) => {
        const matchName = user.name?.toLowerCase().includes(search.toLowerCase());
        const matchRole = !roleFilter || user.role === roleFilter;
        return matchName && matchRole;
    });

    const changeCount = Object.keys(pendingChanges).length;

    const handleRoleChange = (userId: string, originalRole: string, newRole: string) => {
        setPendingChanges(prev => {
            const next = { ...prev };
            if (newRole === originalRole) {
                delete next[userId];
            } else {
                next[userId] = newRole;
            }
            return next;
        });
    };

    const handleSave = async () => {
        if (changeCount === 0) return;
        setSubmitting(true);
        const formData = new FormData();
        formData.set("intent", "batch-update");
        formData.set("changes", JSON.stringify(pendingChanges));
        formData.set("usersInfo", JSON.stringify(usersInfo));
        await fetch("/users", { method: "POST", body: formData });
        setPendingChanges({});
        setSubmitting(false);
        window.location.reload();
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-4">
                <Link to="/" className="text-teal-600 hover:text-teal-700">
                    ← Voltar ao Menu Principal
                </Link>
            </div>
            
            <h1 className="text-3xl font-bold text-teal-600 text-center">
                Gerenciamento de Usuários
            </h1>

            {changeCount > 0 && (
                <div className="sticky top-0 z-10 bg-yellow-50 border border-yellow-300 rounded-lg p-3 mt-4 flex items-center justify-between shadow">
                    <span className="text-sm text-yellow-800 font-medium">
                        {changeCount} {changeCount === 1 ? "alteração pendente" : "alterações pendentes"}
                    </span>
                    <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                    >
                        {submitting ? "⏳ Salvando..." : "💾 Salvar alterações"}
                    </button>
                </div>
            )}

            {/* Filtros */}
            <div className="flex gap-2 mt-6 mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nome"
                    className="form-input px-4 py-2 border border-gray-300 rounded flex-1"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="form-select px-2 py-2 border border-gray-300 rounded"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">Todas as permissões</option>
                    {roles.map(role => (
                        <option key={role} value={role}>{roleLabels[role].label}</option>
                    ))}
                </select>
            </div>

            <div className="mt-6">
                <table className="table-auto w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">Nome</th>
                            <th className="border border-gray-300 px-4 py-2">Permissão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u: any) => (
                            <tr key={u.id} className={pendingChanges[u.id] ? "bg-yellow-50" : ""}>
                                <td className="border border-gray-300 px-4 py-2">{u.name}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="inline-block w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: roleLabels[u.role]?.color || "#6b7280" }}
                                        />
                                        <select
                                            className="form-select text-sm"
                                            defaultValue={u.role}
                                            onChange={(e) => handleRoleChange(u.id, u.role, e.target.value)}
                                        >
                                            {roles.map((role) => (
                                                <option key={role} value={role}>
                                                    {roleLabels[role].label}
                                                </option>
                                            ))}
                                        </select>
                                        {pendingChanges[u.id] && (
                                            <span className="text-xs text-yellow-600 font-medium">
                                                → {roleLabels[pendingChanges[u.id]]?.label || pendingChanges[u.id]}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="mt-8">
                    <BackButton />
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
