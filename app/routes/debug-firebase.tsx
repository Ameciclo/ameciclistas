import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUsersFirebase } from "~/api/firebaseConnection.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const users = await getUsersFirebase();
  
  // Buscar por dvalenca@gmail.com
  const userEntries = Object.entries(users || {}).filter(([id, user]) => 
    user.contacts?.some((contact: any) => 
      contact.type === "E-mail" && contact.value?.includes("dvalenca")
    )
  );
  
  return json({ 
    userEntries,
    totalUsers: Object.keys(users || {}).length,
    searchEmail: "dvalenca@gmail.com"
  });
}

export default function DebugFirebase() {
  const { userEntries, totalUsers, searchEmail } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Debug Firebase - Busca por {searchEmail}</h1>
      
      <div className="mb-4">
        <p><strong>Total de usuários no Firebase:</strong> {totalUsers}</p>
        <p><strong>Usuários encontrados com "dvalenca":</strong> {userEntries.length}</p>
      </div>

      {userEntries.length > 0 ? (
        <div className="space-y-4">
          {userEntries.map(([id, user]) => (
            <div key={id} className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold">ID: {id}</h3>
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>CPF:</strong> {user.id_number}</p>
              <p><strong>Role:</strong> {user.role || 'Não definido'}</p>
              <div>
                <strong>Contatos:</strong>
                <ul className="ml-4">
                  {user.contacts?.map((contact: any, i: number) => (
                    <li key={i}>{contact.type}: {contact.value}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-red-100 p-4 rounded">
          <p>Nenhum usuário encontrado com email contendo "dvalenca"</p>
          <p className="mt-2 text-sm">Verifique se seu email está cadastrado no Firebase com a estrutura correta.</p>
        </div>
      )}
    </div>
  );
}