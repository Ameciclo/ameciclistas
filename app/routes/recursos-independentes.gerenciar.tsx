import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
import { Form, useLoaderData, useActionData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getSales, getDonations, updateSaleStatus, updateDonationStatus, getUsersFirebase } from "~/api/firebaseConnection.server";
import { Sale, Donation, SaleStatus, UserCategory, UserData } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";

export const loader: LoaderFunction = async () => {
  const [sales, donations, users] = await Promise.all([
    getSales(),
    getDonations(),
    getUsersFirebase()
  ]);
  return json({ sales, donations, users });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");
  
  try {
    if (action === "confirmSale") {
      const saleId = formData.get("saleId") as string;
      await updateSaleStatus(saleId, SaleStatus.CONFIRMED);
      return json({ success: true });
    }
    
    if (action === "confirmDonation") {
      const donationId = formData.get("donationId") as string;
      await updateDonationStatus(donationId, SaleStatus.CONFIRMED);
      return json({ success: true });
    }
    
    if (action === "rejectSale") {
      const saleId = formData.get("saleId") as string;
      await updateSaleStatus(saleId, SaleStatus.CANCELLED);
      return json({ success: true });
    }
    
    if (action === "rejectDonation") {
      const donationId = formData.get("donationId") as string;
      await updateDonationStatus(donationId, SaleStatus.CANCELLED);
      return json({ success: true });
    }
    
    return json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export default function GerenciarRecursos() {
  const { sales, donations, users } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed">("pending");
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    telegramInit();
    const userData = getTelegramUsersInfo();
    setUser(userData);
    
    if (userData?.id && users[userData.id]) {
      const userRole = users[userData.id].role;
      setUserPermissions([userRole]);
    }
  }, [users]);

  const salesList = sales ? Object.values(sales) as Sale[] : [];
  const donationsList = donations ? Object.values(donations) as Donation[] : [];

  const pendingSales = salesList
    .filter(sale => sale.status === SaleStatus.PAID)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pendingDonations = donationsList
    .filter(donation => donation.status === SaleStatus.PAID)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const confirmedSales = salesList
    .filter(sale => sale.status === SaleStatus.CONFIRMED)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const confirmedDonations = donationsList
    .filter(donation => donation.status === SaleStatus.CONFIRMED)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusLabel = (status: SaleStatus) => {
    const labels = {
      [SaleStatus.PENDING]: { text: "Aguardando Pagamento", color: "bg-yellow-100 text-yellow-800" },
      [SaleStatus.PAID]: { text: "Pago - Aguardando Confirmação", color: "bg-blue-100 text-blue-800" },
      [SaleStatus.CONFIRMED]: { text: "Confirmado", color: "bg-green-100 text-green-800" },
      [SaleStatus.CANCELLED]: { text: "Cancelado", color: "bg-red-100 text-red-800" }
    };
    return labels[status] || { text: status, color: "bg-gray-100 text-gray-800" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)) {
    return (
      <>
        <div className="mb-4">
          <Link to="/recursos-independentes" className="text-teal-600 hover:text-teal-700">
            ← Voltar ao Menu
          </Link>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Acesso Negado:</strong> Você precisa ser Coordenador de Projeto para acessar esta página.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Link to="/recursos-independentes" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-teal-600 text-center mb-6">
        Gerenciar Recursos
      </h1>

      {actionData?.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Ação realizada com sucesso!
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "pending"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pendentes ({pendingSales.length + pendingDonations.length})
        </button>
        <button
          onClick={() => setActiveTab("confirmed")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "confirmed"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Confirmados ({confirmedSales.length + confirmedDonations.length})
        </button>
      </div>

      {activeTab === "pending" && (
        <div className="space-y-6">
          {/* Vendas Pendentes */}
          {pendingSales.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendas Aguardando Confirmação</h2>
              <div className="space-y-4">
                {pendingSales.map((sale) => (
                  <div key={sale.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {sale.productName}
                          {sale.variantName && ` (${sale.variantName})`}
                          {sale.registeredBy && (
                            <span className="text-sm text-blue-600 ml-2">
                              (via {sale.registeredByName})
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Cliente: {sale.userName} | Quantidade: {sale.quantity} | Total: R$ {sale.totalValue.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Pago em: {sale.paidAt ? formatDate(sale.paidAt) : "N/A"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(sale.status).color}`}>
                        {getStatusLabel(sale.status).text}
                      </span>
                    </div>

                    {sale.paymentProof && (
                      <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                        <strong>Comprovante:</strong> {sale.paymentProof}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="confirmSale" />
                        <input type="hidden" name="saleId" value={sale.id} />
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Confirmar
                        </button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="rejectSale" />
                        <input type="hidden" name="saleId" value={sale.id} />
                        <button
                          type="submit"
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Rejeitar
                        </button>
                      </Form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doações Pendentes */}
          {pendingDonations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Doações Aguardando Confirmação</h2>
              <div className="space-y-4">
                {pendingDonations.map((donation) => (
                  <div key={donation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Doação
                          {donation.registeredBy && (
                            <span className="text-sm text-blue-600 ml-2">
                              (via {donation.registeredByName})
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Doador: {donation.userName} | Valor: R$ {donation.value.toFixed(2)}
                        </p>
                        {donation.description && (
                          <p className="text-sm text-gray-600">Mensagem: {donation.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Pago em: {donation.paidAt ? formatDate(donation.paidAt) : "N/A"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(donation.status).color}`}>
                        {getStatusLabel(donation.status).text}
                      </span>
                    </div>

                    {donation.paymentProof && (
                      <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                        <strong>Comprovante:</strong> {donation.paymentProof}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="confirmDonation" />
                        <input type="hidden" name="donationId" value={donation.id} />
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Confirmar
                        </button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="rejectDonation" />
                        <input type="hidden" name="donationId" value={donation.id} />
                        <button
                          type="submit"
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Rejeitar
                        </button>
                      </Form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingSales.length === 0 && pendingDonations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Não há itens pendentes de confirmação.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "confirmed" && (
        <div className="space-y-6">
          {/* Vendas Confirmadas */}
          {confirmedSales.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendas Confirmadas (últimas 10)</h2>
              <div className="space-y-4">
                {confirmedSales.slice(0, 10).map((sale) => (
                  <div key={sale.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {sale.productName}
                          {sale.variantName && ` (${sale.variantName})`}
                          {sale.registeredBy && (
                            <span className="text-sm text-blue-600 ml-2">
                              (via {sale.registeredByName})
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Cliente: {sale.userName} | Quantidade: {sale.quantity} | Total: R$ {sale.totalValue.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Confirmado em: {sale.confirmedAt ? formatDate(sale.confirmedAt) : "N/A"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(sale.status).color}`}>
                        {getStatusLabel(sale.status).text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Doações Confirmadas */}
          {confirmedDonations.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Doações Confirmadas (últimas 10)</h2>
              <div className="space-y-4">
                {confirmedDonations.slice(0, 10).map((donation) => (
                  <div key={donation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Doação
                          {donation.registeredBy && (
                            <span className="text-sm text-blue-600 ml-2">
                              (via {donation.registeredByName})
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Doador: {donation.userName} | Valor: R$ {donation.value.toFixed(2)}
                        </p>
                        {donation.description && (
                          <p className="text-sm text-gray-600">Mensagem: {donation.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Confirmado em: {donation.confirmedAt ? formatDate(donation.confirmedAt) : "N/A"}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(donation.status).color}`}>
                        {getStatusLabel(donation.status).text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {confirmedSales.length === 0 && confirmedDonations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Não há itens confirmados ainda.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}