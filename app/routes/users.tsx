import React, { useEffect, useState } from "react";
import { useLoaderData, Form } from "@remix-run/react";
import { UserCategory, UserData } from "~/utils/types";
import { loader } from "~/handlers/loaders/users";
import { action } from "~/handlers/actions/users-action";
import SendToAction from "~/components/Forms/SendToAction";
import { BackButton } from "~/components/Forms/CommonButtons";
import { isAuth } from "~/utils/isAuthorized";
import { getTelegramUsersInfo } from "~/utils/users";
import Unauthorized from "~/components/Unauthorized";
export { loader, action }

const roles = [
    UserCategory.AMECICLISTAS,
    UserCategory.PROJECT_COORDINATORS,
    UserCategory.AMECICLO_COORDINATORS,
    UserCategory.ANY_USER,
    UserCategory.DEVELOPMENT,
];

const UserManagement: React.FC = () => {
    const { usersInfo, currentUserCategories } = useLoaderData<typeof loader>();
    const [search, setSearch] = useState("");
    const [newRole, setNewRole] = useState("");
    const [userPermissions, setUserPermissions] = useState(currentUserCategories);
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        setUser(() => getTelegramUsersInfo());
    }, []);


    useEffect(() => {
        if (user?.id && usersInfo[user.id]) {
            setUserPermissions([usersInfo[user.id].role as any]);
        }
    }, [user]);

    const filteredUsers = Object.values(usersInfo).filter((user: any) =>
        user.name?.toLowerCase().includes(search.toLowerCase())
    );


    return isAuth(userPermissions, UserCategory.AMECICLO_COORDINATORS) ? (
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
                        {filteredUsers.map((user: any) => (
                            <tr key={user.id}>
                                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <Form method="post">
                                        <div className="flex justify-between items-center">
                                            <select
                                                name="role"
                                                className="form-select w-36"
                                                defaultValue={user.role}
                                                onChange={(e) => setNewRole(e.target.value)}
                                            >
                                                {roles.map((role) => (
                                                    <option key={role} value={role}>
                                                        {role}
                                                    </option>
                                                ))}
                                            </select>
                                            <SendToAction
                                                fields={[
                                                    { name: "user", value: JSON.stringify(user) },
                                                    { name: "role", value: newRole },
                                                ]}
                                            />
                                            <button
                                                className="ml-1 px-2 py-1 bg-blue-500 text-white rounded text-sm"
                                            >
                                                Atualizar
                                            </button>
                                        </div>
                                    </Form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <br />
                <BackButton />
            </div>
        </div>
    ) : (
        <Unauthorized
            pageName="Gerenciamento de Usuários"
            requiredPermission="Coordenador da Ameciclo"
        />
    );
};

export default UserManagement;
