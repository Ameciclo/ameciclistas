import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { getSales, getDonations, updateSaleStatus, updateDonationStatus, getUsersFirebase } from "~/api/firebaseConnection.server";
import { Sale, Donation, SaleStatus, UserData, UserCategory } from "~/utils/types";
import { requireAuth } from "~/utils/authMiddleware";

const originalLoader: LoaderFunction = async () => {
  const [sales, donations, users] = await Promise.all([
    getSales(),
    getDonations(),
    getUsersFirebase()
  ]);
  return json({ sales, donations, users });
};

export const loader = requireAuth(UserCategory.AMECICLISTAS)(originalLoader);

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");
  
  try {
    if (action === "markAsPaid") {
      const saleId = formData.get("saleId") as string;
      await updateSaleStatus(saleId, SaleStatus.PAID);
      return json({ success: true });
    }
    
    if (action === "markDonationAsPaid") {
      const donationId = formData.get("donationId") as string;
      await updateDonationStatus(donationId, SaleStatus.PAID);
      return json({ success: true });
    }
    
    if (action === "cancel") {
      const saleId = formData.get("saleId") as string;
      await updateSaleStatus(saleId, SaleStatus.CANCELLED);
      return json({ success: true });
    }
    
    if (action === "cancelDonation") {
      const donationId = formData.get("donationId") as string;
      await updateDonationStatus(donationId, SaleStatus.CANCELLED);
      return json({ success: true });
    }
    
    return json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export default function MeusConsumos() {
  const { sales, donations, users } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sales" | "donations">("sales");
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

  const userSales = sales && user ? 
    Object.values(sales)
      .filter((sale: any) => sale.userId === user.id || sale.registeredBy === user.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as Sale[] : [];
  const userDonations = donations && user ? 
    Object.values(donations)
      .filter((donation: any) => donation.userId === user.id || donation.registeredBy === user.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as Donation[] : [];

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Link to="/" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu Principal
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-teal-600 text-center mb-6">
        Meus Consumos
      </h1>

      {searchParams.get("success") === "true" && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Consumo registrado com sucesso! Faça o pagamento para confirmar.
        </div>
      )}
      
      {searchParams.get("success") === "donation" && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Doação registrada com sucesso! Faça o pagamento para confirmar.
        </div>
      )}

      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Seção:</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab("sales")}
              className={`py-2 px-3 rounded text-sm font-medium ${
                activeTab === "sales"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Consumos ({userSales.length})
            </button>
            <button
              onClick={() => setActiveTab("donations")}
              className={`py-2 px-3 rounded text-sm font-medium ${
                activeTab === "donations"
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Doações ({userDonations.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "sales" && (
        userSales.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Você ainda não possui consumos registrados.</p>
            <Link
              to="/recursos-independentes/registrar-consumo"
              className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700"
            >
              Registrar Primeiro Consumo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userSales.map((sale) => {
              const statusInfo = getStatusLabel(sale.status);
              
              return (
                <div key={sale.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {sale.productName}
                        {sale.variantName && ` (${sale.variantName})`}
                        {sale.registeredBy && sale.registeredBy !== user?.id && (
                          <span className="text-sm text-blue-600 ml-2">
                            (via {sale.registeredByName})
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {sale.registeredBy && sale.registeredBy !== user?.id ? (
                          <>Consumidor: {sale.userName} | </>
                        ) : null}
                        Quantidade: {sale.quantity} | Valor: R$ {sale.totalValue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Registrado em: {formatDate(sale.createdAt)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>

                  {sale.status === SaleStatus.PENDING && (
                    <div className="flex gap-2 mt-3">
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="markAsPaid" />
                        <input type="hidden" name="saleId" value={sale.id} />
                        <input type="hidden" name="paymentProof" value="" />
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Marcar como Pago
                        </button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="cancel" />
                        <input type="hidden" name="saleId" value={sale.id} />
                        <button
                          type="submit"
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </Form>
                    </div>
                  )}



                  {sale.paymentProof && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <strong>Comprovante:</strong> {sale.paymentProof}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {activeTab === "donations" && (
        userDonations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Você ainda não fez doações.</p>
            <Link
              to="/recursos-independentes/fazer-doacao"
              className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700"
            >
              Fazer Primeira Doação
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userDonations.map((donation) => {
              const statusInfo = getStatusLabel(donation.status);
              
              return (
                <div key={donation.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Doação
                        {donation.registeredBy && donation.registeredBy !== user?.id && (
                          <span className="text-sm text-blue-600 ml-2">
                            (via {donation.registeredByName})
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {donation.registeredBy && donation.registeredBy !== user?.id ? (
                          <>Doador: {donation.userName} | </>
                        ) : null}
                        Valor: R$ {donation.value.toFixed(2)}
                      </p>
                      {donation.description && (
                        <p className="text-sm text-gray-600">
                          Mensagem: {donation.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Registrado em: {formatDate(donation.createdAt)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>

                  {donation.status === SaleStatus.PENDING && (
                    <div className="flex gap-2 mt-3">
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="markDonationAsPaid" />
                        <input type="hidden" name="donationId" value={donation.id} />
                        <input type="hidden" name="paymentProof" value="" />
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Marcar como Pago
                        </button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="cancelDonation" />
                        <input type="hidden" name="donationId" value={donation.id} />
                        <button
                          type="submit"
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                      </Form>
                    </div>
                  )}



                  {donation.paymentProof && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <strong>Comprovante:</strong> {donation.paymentProof}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
      
      <div className="mt-8">
        <Link 
          to="/" 
          className="button-secondary-full text-center"
        >
          ⬅️ Voltar ao Menu Principal
        </Link>
      </div>
    </div>
  );
}