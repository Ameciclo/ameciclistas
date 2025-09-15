import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getSales, getDonations, getUsersFirebase } from "~/api/firebaseConnection.server";
import { Sale, Donation, SaleStatus, UserCategory, UserData } from "~/utils/types";
import { requireAuth } from "~/utils/authMiddleware";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";

const originalLoader: LoaderFunction = async () => {
  const [sales, donations, users] = await Promise.all([
    getSales(),
    getDonations(),
    getUsersFirebase()
  ]);
  return json({ sales, donations, users });
};

export const loader = requireAuth(UserCategory.AMECICLISTAS)(originalLoader);

export default function HistoricoVendas() {
  const { sales, donations, users } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<"sales" | "donations" | "summary">("summary");
  const [dateFilter, setDateFilter] = useState<"all" | "month" | "week">("month");
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

  const salesList = sales ? 
    Object.values(sales)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as Sale[] : [];
  const donationsList = donations ? 
    Object.values(donations)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as Donation[] : [];

  const confirmedSales = salesList.filter(sale => sale.status === SaleStatus.CONFIRMED);
  const confirmedDonations = donationsList.filter(donation => donation.status === SaleStatus.CONFIRMED);

  const filterByDate = (items: (Sale | Donation)[]) => {
    if (dateFilter === "all") return items;
    
    const now = new Date();
    const filterDate = new Date();
    
    if (dateFilter === "month") {
      filterDate.setMonth(now.getMonth() - 1);
    } else if (dateFilter === "week") {
      filterDate.setDate(now.getDate() - 7);
    }
    
    return items.filter(item => {
      const itemDate = new Date(item.confirmedAt || item.createdAt);
      return itemDate >= filterDate;
    });
  };

  const filteredSales = filterByDate(confirmedSales);
  const filteredDonations = filterByDate(confirmedDonations);

  // Estatísticas
  const totalSalesValue = filteredSales.reduce((sum, sale) => sum + (sale.totalValue || 0), 0);
  const totalDonationsValue = filteredDonations.reduce((sum, donation) => sum + (donation.value || 0), 0);
  const totalRevenue = totalSalesValue + totalDonationsValue;

  // Vendas por categoria
  const salesByCategory = filteredSales.reduce((acc, sale) => {
    const category = getCategoryFromProductName(sale.productName || '');
    if (!acc[category]) acc[category] = { count: 0, value: 0 };
    acc[category].count += sale.quantity || 0;
    acc[category].value += sale.totalValue || 0;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  // Top produtos
  const productSales = filteredSales.reduce((acc, sale) => {
    const key = `${sale.productName || 'Produto'}${sale.variantName ? ` (${sale.variantName})` : ''}`;
    if (!acc[key]) acc[key] = { count: 0, value: 0 };
    acc[key].count += sale.quantity || 0;
    acc[key].value += sale.totalValue || 0;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const topProducts = Object.entries(productSales)
    .sort(([,a], [,b]) => b.value - a.value)
    .slice(0, 5);

  function getCategoryFromProductName(productName: string): string {
    if (productName.toLowerCase().includes('cerveja')) return 'Líquidos';
    if (productName.toLowerCase().includes('camisa')) return 'Camisas';
    if (productName.toLowerCase().includes('broche')) return 'Broches';
    if (productName.toLowerCase().includes('câmara') || productName.toLowerCase().includes('kit')) return 'Peças';
    if (productName.toLowerCase().includes('manual') || productName.toLowerCase().includes('livro')) return 'Livros';
    if (productName.toLowerCase().includes('aluguel') || productName.toLowerCase().includes('manutenção')) return 'Serviços';
    return 'Outros';
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getDateFilterLabel = () => {
    const labels = {
      all: "Todos os períodos",
      month: "Último mês",
      week: "Última semana"
    };
    return labels[dateFilter];
  };

  return (
    <>
      <div className="mb-4">
        <Link to="/recursos-independentes" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-teal-600 text-center mb-6">
        Histórico de Vendas e Doações
      </h1>

      {/* Filtro de Data */}
      <div className="mb-6 flex justify-center">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as "all" | "month" | "week")}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        >
          <option value="week">Última semana</option>
          <option value="month">Último mês</option>
          <option value="all">Todos os períodos</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("summary")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "summary"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Resumo
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "sales"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Vendas ({filteredSales.length})
        </button>
        <button
          onClick={() => setActiveTab("donations")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "donations"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Doações ({filteredDonations.length})
        </button>
      </div>

      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Receita Total</h3>
              <p className="text-3xl font-bold text-teal-600">R$ {totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">{getDateFilterLabel()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendas</h3>
              <p className="text-3xl font-bold text-blue-600">R$ {totalSalesValue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">{filteredSales.length} transações</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Doações</h3>
              <p className="text-3xl font-bold text-green-600">R$ {totalDonationsValue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">{filteredDonations.length} doações</p>
            </div>
          </div>

          {/* Histórico de Vendas */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Vendas</h3>
            {filteredSales.length === 0 ? (
              <p className="text-gray-600">Nenhuma venda no período selecionado.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredSales.slice(0, 10).map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">
                        {sale.productName}
                        {sale.variantName && ` (${sale.variantName})`}
                        {sale.registeredBy && (
                          <span className="text-xs text-blue-600 ml-1">
                            (via {sale.registeredByName})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {sale.userName} • {sale.quantity} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">R$ {sale.totalValue.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {sale.confirmedAt ? formatDate(sale.confirmedAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico de Doações */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Doações</h3>
            {filteredDonations.length === 0 ? (
              <p className="text-gray-600">Nenhuma doação no período selecionado.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredDonations.slice(0, 10).map((donation) => (
                  <div key={donation.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">
                        Doação
                        {donation.registeredBy && (
                          <span className="text-xs text-blue-600 ml-1">
                            (via {donation.registeredByName})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {donation.userName}
                        {donation.description && ` • ${donation.description}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">R$ {donation.value.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {donation.confirmedAt ? formatDate(donation.confirmedAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vendas por Categoria */}
          {Object.keys(salesByCategory).length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Categoria</h3>
              <div className="space-y-3">
                {Object.entries(salesByCategory).map(([category, data]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-700">{category}</span>
                    <div className="text-right">
                      <span className="font-semibold">R$ {data.value.toFixed(2)}</span>
                      <span className="text-sm text-gray-500 ml-2">({data.count} itens)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Produtos */}
          {topProducts.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Produtos</h3>
              <div className="space-y-3">
                {topProducts.map(([product, data], index) => (
                  <div key={product} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 mr-3">#{index + 1}</span>
                      <span className="text-gray-700">{product}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">R$ {data.value.toFixed(2)}</span>
                      <span className="text-sm text-gray-500 ml-2">({data.count} vendidos)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "sales" && (
        <div className="space-y-4">
          {filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhuma venda encontrada para o período selecionado.</p>
            </div>
          ) : (
            filteredSales.map((sale) => (
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
                      Cliente: {sale.userName} | Quantidade: {sale.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      Confirmado em: {sale.confirmedAt ? formatDate(sale.confirmedAt) : "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">R$ {sale.totalValue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">R$ {sale.unitPrice.toFixed(2)} cada</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "donations" && (
        <div className="space-y-4">
          {filteredDonations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhuma doação encontrada para o período selecionado.</p>
            </div>
          ) : (
            filteredDonations.map((donation) => (
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
                    <p className="text-sm text-gray-600">Doador: {donation.userName}</p>
                    {donation.description && (
                      <p className="text-sm text-gray-600">Mensagem: {donation.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Confirmado em: {donation.confirmedAt ? formatDate(donation.confirmedAt) : "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">R$ {donation.value.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      <div className="mt-8">
        <Link 
          to="/recursos-independentes" 
          className="button-secondary-full text-center"
        >
          ⬅️ Voltar ao Menu
        </Link>
      </div>
    </>
  );
}