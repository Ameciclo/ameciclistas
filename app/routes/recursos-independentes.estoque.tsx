import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
import { Form, useLoaderData, useActionData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getProducts, saveProduct, updateProduct, deleteProduct, updateProductStock, getUsersFirebase } from "~/api/firebaseConnection.server";
import { Product, ProductCategory, UserCategory, UserData } from "~/utils/types";
import { requireAuth } from "~/utils/authMiddleware";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";

const originalLoader: LoaderFunction = async () => {
  const [products, users] = await Promise.all([
    getProducts(),
    getUsersFirebase()
  ]);
  return json({ products, users });
};

export const loader = requireAuth(UserCategory.PROJECT_COORDINATORS)(originalLoader);

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("action");
  
  try {
    if (action === "create") {
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
    
    if (action === "update") {
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
    
    if (action === "delete") {
      const productId = formData.get("productId") as string;
      await deleteProduct(productId);
      return json({ success: "Produto removido com sucesso!" });
    }
    
    return json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export default function GerenciarEstoque() {
  const { products, users } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeTab, setActiveTab] = useState<"list" | "create" | "edit">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const productsList = products ? Object.values(products) as Product[] : [];

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
    setActiveTab("edit");
  };

  useEffect(() => {
    if (actionData?.success && activeTab === "edit") {
      setEditingProduct(null);
      setActiveTab("list");
    }
  }, [actionData, activeTab]);

  return (
    <>
      <div className="mb-4">
        <Link to="/recursos-independentes" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-teal-600 text-center mb-6">
        Gerenciar Estoque
      </h1>

      {actionData?.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {actionData.success}
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("list")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "list"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Lista de Produtos ({productsList.length})
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === "create"
              ? "border-teal-500 text-teal-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Criar Produto
        </button>
      </div>

      {activeTab === "list" && (
        <div className="space-y-4">
          {productsList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Nenhum produto cadastrado.</p>
              <button
                onClick={() => setActiveTab("create")}
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
                      <input type="hidden" name="action" value="delete" />
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

      {activeTab === "create" && (
        <Form method="post" className="max-w-md mx-auto space-y-4">
          <input type="hidden" name="action" value="create" />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input
              type="text"
              name="name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              name="category"
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
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Inicial</label>
            <input
              type="number"
              name="stock"
              min="0"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700"
          >
            Criar Produto
          </button>
        </Form>
      )}
    </>
  );
}