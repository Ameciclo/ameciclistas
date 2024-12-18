import React, { useState } from "react";
import { UserCategory } from "~/utils/types";

const roles = [
    UserCategory.AMECICLISTAS,
    UserCategory.PROJECT_COORDINATORS,
    UserCategory.AMECICLO_COORDINATORS,
    UserCategory.ANY_USER,
];

const usersExemple = [
    {
        id: 1,
        name: "João Silva",
        role: "Administrador",
    },
    {
        id: 2,
        name: "Maria Oliveira",
        role: "Editor",
    },
    {
        id: 3,
        name: "Pedro Souza",
        role: "Contribuidor",
    },
    {
        id: 4,
        name: "Ana Costa",
        role: "Leitor",
    },
    {
        id: 5,
        name: "Carlos Almeida",
        role: "Moderador",
    },
];

const UserManagement: React.FC = () => {
    const [users, _setUsers] = useState(usersExemple);
    const [search, setSearch] = useState(""); // Estado para armazenar a pesquisa

    // Função de filtro para o nome do usuário
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-teal-600 text-center">
                Gerenciamento de Usuários
            </h1>

            {/* Filtro de pesquisa */}
            <div className="mt-6 mb-4">
                <input
                    type="text"
                    placeholder="Buscar por nome"
                    className="form-input px-4 py-2 border border-gray-300 rounded"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
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
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <select className="form-select" value={user.role}>
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
