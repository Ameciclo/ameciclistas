import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
import { Form, useLoaderData, useActionData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getSales, getDonations, updateSaleStatus, updateDonationStatus, getUsersFirebase, getProducts, saveProduct, updateProduct, deleteProduct } from "~/api/firebaseConnection.server";
import { Sale, Donation, SaleStatus, UserCategory, UserData, Product, ProductCategory } from "~/utils/types";
import { requireAuth } from "~/utils/authMiddleware";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";

const originalLoader: LoaderFunction = async () => {
  const [sales, donations, users, products] = await Promise.all([
    getSales(),
    getDonations(),
    getUsersFirebase(),
    getProducts()
  ]);
  return json({ sales, donations, users, products });
};

export const loader = requireAuth(UserCategory.PROJECT_COORDINATORS)(originalLoader);

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
    
    if (action === "createProduct") {
      const description = formData.get("description") as string;
      
      const productData = {
        name: formData.get("name") as string,
        category: formData.get("category") as ProductCategory,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string),
      };
      
      if (description && description.trim() !== "") {
        productData.description = description.trim();
      }
      
      await saveProduct(productData);
      return json({ success: "Produto criado com sucesso!" });
    }
    
    if (action === "updateProduct") {
      const productId = formData.get("productId") as string;
      const description = formData.get("description") as string;
      
      const productData = {
        name: formData.get("name") as string,
        category: formData.get("category") as ProductCategory,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string),
      };
      
      if (description && description.trim() !== "") {
        productData.description = description.trim();
      }
      
      await updateProduct(productId, productData);
      return json({ success: "Produto atualizado com sucesso!" });
    }
    
    if (action === "deleteProduct") {
      const productId = formData.get("productId") as string;
      await deleteProduct(productId);
      return json({ success: "Produto removido com sucesso!" });
    }
    
    return json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export default function GerenciarRecursos() {
  const { sales, donations, users, products } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "products" | "createProduct">("pending");
  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mostrarGestao, setMostrarGestao] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setMostrarGestao(urlParams.get('gestao') === 'true');
  }, []);

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
  const productsList = products ? Object.values(products) as Product[] : [];

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
  
  const getCategoryLabel = (category: ProductCategory) => {
    const labels = {
      [ProductCategory.LIQUIDOS]: "🍺 Líquidos",
      [ProductCategory.CAMISAS]: "👕 Camisas", 
      [ProductCategory.BROCHES]: "📌 Broches",
      [ProductCategory.PECAS_BICICLETA]: "🔧 Peças de Bicicleta",
      [ProductCategory.LIVROS]: "📚 Livros",
      [ProductCategory.SERVICOS]: "⚙️ Serviços"
    };
    return labels[category] || category;
  };
  
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setActiveTab("createProduct");
  };
  
  useEffect(() => {
    if (actionData?.success && activeTab === "createProduct") {
      setEditingProduct(null);
      setActiveTab("products");
    }
  }, [actionData, activeTab]);

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
    <>
      <div className="mb-4">
        <Link to="/" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu Principal
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
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pending")}
          className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === "pending"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pendentes ({pendingSales.length + pendingDonations.length})
        </button>
        <button
          onClick={() => setActiveTab("confirmed")}
          className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === "confirmed"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Confirmados ({confirmedSales.length + confirmedDonations.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === "products"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Produtos ({productsList.length})
        </button>
        <button
          onClick={() => setActiveTab("createProduct")}
          className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
            activeTab === "createProduct"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {editingProduct ? "Editar Produto" : "Criar Produto"}
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
      
      {activeTab === "products" && (
        <div className="space-y-4">
          {productsList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Nenhum produto cadastrado.</p>
              <button
                onClick={() => setActiveTab("createProduct")}
                className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700"
              >
                Criar Primeiro Produto
              </button>
            </div>
          ) : (
            productsList.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">
                      {getCategoryLabel(product.category)} | R$ {product.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Estoque: {product.stock} unidades
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Editar
                    </button>
                    <Form method="post" className="inline">
                      <input type="hidden" name="action" value="deleteProduct" />
                      <input type="hidden" name="productId" value={product.id} />
                      <button
                        type="submit"
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Remover
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {activeTab === "createProduct" && (
        <Form method="post" className="max-w-md mx-auto space-y-4">
          <input type="hidden" name="action" value={editingProduct ? "updateProduct" : "createProduct"} />
          {editingProduct && <input type="hidden" name="productId" value={editingProduct.id} />}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input
              type="text"
              name="name"
              defaultValue={editingProduct?.name || ""}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              name="category"
              defaultValue={editingProduct?.category || ""}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Selecione uma categoria</option>
              {Object.values(ProductCategory).map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço (R$)</label>
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              defaultValue={editingProduct?.price || ""}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editingProduct ? "Estoque" : "Estoque Inicial"}
            </label>
            <input
              type="number"
              name="stock"
              min="0"
              defaultValue={editingProduct?.stock || ""}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700"
            >
              {editingProduct ? "Atualizar Produto" : "Criar Produto"}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setActiveTab("products");
                }}
                className="bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </Form>
      )}
      
      <div className="mt-8">
        <Link 
          to="/" 
          className="button-secondary-full text-center"
        >
          ⬅️ Voltar ao Menu Principal
        </Link>
      </div>
    </>
  );
}