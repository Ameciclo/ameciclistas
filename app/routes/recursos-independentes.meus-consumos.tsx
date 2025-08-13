import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { getSales, getDonations, updateSaleStatus, updateDonationStatus } from "~/api/firebaseConnection.server";
import { Sale, Donation, SaleStatus, UserData } from "~/utils/types";

export const loader: LoaderFunction = async () => {
  const [sales, donations] = await Promise.all([
    getSales(),
    getDonations()
  ]);
  return json({ sales, donations });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");
  
  try {
    if (action === "markAsPaid") {
      const saleId = formData.get("saleId") as string;
      const paymentProof = formData.get("paymentProof") as string;
      
      await updateSaleStatus(saleId, SaleStatus.PAID, { paymentProof });
      return json({ success: true });
    }
    
    if (action === "markDonationAsPaid") {
      const donationId = formData.get("donationId") as string;
      const paymentProof = formData.get("paymentProof") as string;
      
      await updateDonationStatus(donationId, SaleStatus.PAID, { paymentProof });
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
  const { sales, donations } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sales" | "donations">("sales");

  useEffect(() => {
    telegramInit();
    setUser(getTelegramUsersInfo());
  }, []);

  const userSales = sales && user ? 
    Object.values(sales).filter((sale: any) => sale.userId === user.id) as Sale[] : [];
  const userDonations = donations && user ? 
    Object.values(donations).filter((donation: any) => donation.userId === user.id) as Donation[] : [];

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
        <Link to="/recursos-independentes" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("sales")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "sales"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Consumos ({userSales.length})
        </button>
        <button
          onClick={() => setActiveTab("donations")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "donations"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Doações ({userDonations.length})
        </button>
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
                      </h3>
                      <p className="text-sm text-gray-600">
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
                      <button
                        onClick={() => setShowPaymentForm(sale.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Marcar como Pago
                      </button>
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="cancel" />
                        <input type="hidden" name="saleId" value={sale.id} />
                        <button
                          type="submit"
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          onClick={(e) => {
                            if (!confirm("Tem certeza que deseja cancelar este consumo?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Cancelar
                        </button>
                      </Form>
                    </div>
                  )}

                  {showPaymentForm === sale.id && (
                    <Form method="post" className="mt-3 p-3 bg-gray-50 rounded">
                      <input type="hidden" name="action" value="markAsPaid" />
                      <input type="hidden" name="saleId" value={sale.id} />
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          PIX: <span className="font-mono bg-gray-200 px-2 py-1 rounded">doe@ameciclo.org</span>
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Valor: R$ {sale.totalValue.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comprovante de Pagamento (opcional)
                        </label>
                        <textarea
                          name="paymentProof"
                          placeholder="Cole aqui o ID da transação ou outras informações do comprovante"
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Confirmar Pagamento
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPaymentForm(null)}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </Form>
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
                      <h3 className="font-medium text-gray-900">Doação</h3>
                      <p className="text-sm text-gray-600">
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
                      <button
                        onClick={() => setShowPaymentForm(`donation-${donation.id}`)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Marcar como Pago
                      </button>
                      <Form method="post" className="inline">
                        <input type="hidden" name="action" value="cancelDonation" />
                        <input type="hidden" name="donationId" value={donation.id} />
                        <button
                          type="submit"
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          onClick={(e) => {
                            if (!confirm("Tem certeza que deseja cancelar esta doação?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Cancelar
                        </button>
                      </Form>
                    </div>
                  )}

                  {showPaymentForm === `donation-${donation.id}` && (
                    <Form method="post" className="mt-3 p-3 bg-gray-50 rounded">
                      <input type="hidden" name="action" value="markDonationAsPaid" />
                      <input type="hidden" name="donationId" value={donation.id} />
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          PIX: <span className="font-mono bg-gray-200 px-2 py-1 rounded">doe@ameciclo.org</span>
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Valor: R$ {donation.value.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comprovante de Pagamento (opcional)
                        </label>
                        <textarea
                          name="paymentProof"
                          placeholder="Cole aqui o ID da transação ou outras informações do comprovante"
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          rows={2}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Confirmar Pagamento
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowPaymentForm(null)}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    </Form>
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
    </div>
  );
}