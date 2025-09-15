import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getProducts, saveSale, saveDonation, getUsersFirebase } from "~/api/firebaseConnection.server";
import { Product, ProductCategory, SaleStatus, UserData, UserCategory } from "~/utils/types";
import { requireAuth } from "~/utils/authMiddleware";
import { useAuth } from "~/utils/useAuth";
import { isAuth } from "~/utils/isAuthorized";

const originalLoader: LoaderFunction = async () => {
  const products = await getProducts();
  return json({ products });
};

export const loader = requireAuth(UserCategory.AMECICLISTAS)(originalLoader);

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  
  try {
    if (actionType === "donation") {
      const isForOther = formData.get("isForOther") === "true";
      const registeredById = formData.get("registeredById") as string;
      const registeredByName = formData.get("registeredByName") as string;
      
      const donationData = {
        userId: parseInt(formData.get("userId") as string),
        userName: formData.get("userName") as string,
        value: parseFloat(formData.get("value") as string),
        status: SaleStatus.PENDING,
      };
      
      if (isForOther && registeredById && registeredByName) {
        donationData.registeredBy = parseInt(registeredById);
        donationData.registeredByName = registeredByName;
      }

      await saveDonation(donationData);
      return redirect("/recursos-independentes/meus-consumos?success=donation");
    } else {
      const variantId = formData.get("variantId") as string;
      const variantName = formData.get("variantName") as string;
      const isForOther = formData.get("isForOther") === "true";
      const registeredById = formData.get("registeredById") as string;
      const registeredByName = formData.get("registeredByName") as string;
      
      const saleData = {
        userId: parseInt(formData.get("userId") as string),
        userName: formData.get("userName") as string,
        productId: formData.get("productId") as string,
        productName: formData.get("productName") as string,
        quantity: parseInt(formData.get("quantity") as string),
        unitPrice: parseFloat(formData.get("unitPrice") as string),
        totalValue: parseFloat(formData.get("totalValue") as string),
        status: SaleStatus.PENDING,
      };
      
      if (variantId && variantId !== "" && variantId !== "undefined") {
        saleData.variantId = variantId;
      }
      if (variantName && variantName !== "" && variantName !== "undefined") {
        saleData.variantName = variantName;
      }
      
      if (isForOther && registeredById && registeredByName) {
        saleData.registeredBy = parseInt(registeredById);
        saleData.registeredByName = registeredByName;
      }

      await saveSale(saleData);
      return redirect("/recursos-independentes/meus-consumos?success=true");
    }
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export default function RegistrarConsumo() {
  const { products } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { userPermissions, isDevMode, devUser, realUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"consumo" | "doacao">("consumo");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [donationValue, setDonationValue] = useState("");

  const user = isDevMode && devUser ? {
    id: devUser.id,
    first_name: devUser.name.split(" ")[0],
    last_name: devUser.name.split(" ").slice(1).join(" ")
  } : realUser;

  const isCoordinator = isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS);

  const productsList = products ? Object.values(products) as Product[] : [];
  const currentPrice = selectedProduct?.variants?.find(v => v.id === selectedVariant)?.price || selectedProduct?.price || 0;
  const totalValue = currentPrice * quantity;
  
  const getAvailableStock = () => {
    if (!selectedProduct) return 0;
    if (selectedVariant) {
      const variant = selectedProduct.variants?.find(v => v.id === selectedVariant);
      return variant?.stock || 0;
    }
    return selectedProduct.stock || 0;
  };
  
  const availableStock = getAvailableStock();
  const isOutOfStock = availableStock === 0;
  const isQuantityExceeded = quantity > availableStock;

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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Link to="/recursos-independentes" className="text-teal-600 hover:text-teal-700">
          ← Voltar ao Menu
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-teal-600 text-center mb-6">
        {activeTab === "consumo" ? "Registrar Consumo" : "Registrar Doação Livre"}
      </h1>
      
      {isCoordinator && (
        <div className="flex border-b border-gray-200 mb-6 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("consumo")}
            className={`py-2 px-4 border-b-2 font-medium text-sm flex-1 ${
              activeTab === "consumo"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Registrar Consumo
          </button>
          <button
            onClick={() => setActiveTab("doacao")}
            className={`py-2 px-4 border-b-2 font-medium text-sm flex-1 ${
              activeTab === "doacao"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Registrar Doação Livre
          </button>
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      {activeTab === "consumo" ? (
        <Form method="post" className="max-w-md mx-auto space-y-4">
          <input type="hidden" name="actionType" value="consumo" />
          <input type="hidden" name="userId" value={showCustomerForm ? "0" : (user?.id || "")} />
          <input type="hidden" name="userName" value={showCustomerForm ? customerName : (user?.first_name || "")} />
          <input type="hidden" name="productName" value={selectedProduct?.name || ""} />
          <input type="hidden" name="unitPrice" value={currentPrice} />
          <input type="hidden" name="totalValue" value={totalValue} />
          <input type="hidden" name="isForOther" value={showCustomerForm.toString()} />
          <input type="hidden" name="registeredById" value={showCustomerForm ? (user?.id || "") : ""} />
          <input type="hidden" name="registeredByName" value={showCustomerForm ? (user?.first_name || "") : ""} />
        
        {isCoordinator && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Registrar consumo:</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="customerType"
                  checked={!showCustomerForm}
                  onChange={() => setShowCustomerForm(false)}
                  className="text-teal-600"
                />
                <span>Registrar consumo próprio</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="customerType"
                  checked={showCustomerForm}
                  onChange={() => setShowCustomerForm(true)}
                  className="text-teal-600"
                />
                <span>Registrar consumo alheio</span>
              </label>
            </div>
            
            {showCustomerForm && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Nome da pessoa para quem está registrando"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required={showCustomerForm}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Registrando via {user?.first_name}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Produto
          </label>
          <select
            name="productId"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            onChange={(e) => {
              const product = productsList.find(p => p.id === e.target.value);
              setSelectedProduct(product || null);
              setSelectedVariant("");
            }}
          >
            <option value="">Selecione um produto</option>
            {Object.entries(
              productsList.filter(product => (product.stock || 0) > 0).reduce((acc, product) => {
                if (!acc[product.category]) acc[product.category] = [];
                acc[product.category].push(product);
                return acc;
              }, {} as Record<ProductCategory, Product[]>)
            ).map(([category, products]) => (
              <optgroup key={category} label={getCategoryLabel(category as ProductCategory)}>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - R$ {product.price.toFixed(2)} (Estoque: {product.stock})
                  </option>
                ))}
              </optgroup>
            ))}
            {productsList.filter(product => (product.stock || 0) === 0).length > 0 && (
              <optgroup label="🚫 Sem Estoque">
                {productsList.filter(product => (product.stock || 0) === 0).map((product) => (
                  <option key={product.id} value={product.id} disabled>
                    {product.name} - Sem estoque
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {selectedProduct?.variants && selectedProduct.variants.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variação
            </label>
            <select
              name="variantId"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              onChange={(e) => setSelectedVariant(e.target.value)}
            >
              <option value="">Selecione uma variação</option>
              {selectedProduct.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} {variant.price && `- R$ ${variant.price.toFixed(2)}`}
                </option>
              ))}
            </select>
            {selectedVariant && (
              <input type="hidden" name="variantName" value={
                selectedProduct.variants.find(v => v.id === selectedVariant)?.name || ""
              } />
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantidade {selectedProduct && `(Disponível: ${availableStock})`}
          </label>
          <input
            type="number"
            name="quantity"
            min="1"
            max={availableStock || 1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            required
            className={`w-full p-3 border rounded-lg focus:ring-2 ${
              isQuantityExceeded 
                ? "border-red-300 focus:ring-red-500" 
                : "border-gray-300 focus:ring-teal-500"
            }`}
          />
          {isQuantityExceeded && (
            <p className="text-red-500 text-sm mt-1">
              Quantidade solicitada excede o estoque disponível ({availableStock})
            </p>
          )}
        </div>

        {selectedProduct && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Resumo</h3>
            <p className="text-sm text-gray-600">
              Produto: {selectedProduct.name}
              {selectedVariant && ` (${selectedProduct.variants?.find(v => v.id === selectedVariant)?.name})`}
            </p>
            <p className="text-sm text-gray-600">
              Quantidade: {quantity}
            </p>
            <p className="text-sm text-gray-600">
              Valor unitário: R$ {currentPrice.toFixed(2)}
            </p>
            <p className="text-lg font-bold text-teal-600">
              Total: R$ {totalValue.toFixed(2)}
            </p>
          </div>
        )}

          <button
            type="submit"
            disabled={!selectedProduct || !user || (showCustomerForm && !customerName) || isOutOfStock || isQuantityExceeded}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isOutOfStock ? "Produto sem estoque" : isQuantityExceeded ? "Quantidade excede estoque" : "Registrar Consumo"}
          </button>
        </Form>
      ) : (
        <Form method="post" className="max-w-md mx-auto space-y-4">
          <input type="hidden" name="actionType" value="donation" />
          <input type="hidden" name="userId" value={showCustomerForm ? "0" : (user?.id || "")} />
          <input type="hidden" name="userName" value={showCustomerForm ? customerName : (user?.first_name || "")} />
          <input type="hidden" name="isForOther" value={showCustomerForm.toString()} />
          <input type="hidden" name="registeredById" value={showCustomerForm ? (user?.id || "") : ""} />
          <input type="hidden" name="registeredByName" value={showCustomerForm ? (user?.first_name || "") : ""} />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Registrar doação:</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="customerType"
                  checked={!showCustomerForm}
                  onChange={() => setShowCustomerForm(false)}
                  className="text-teal-600"
                />
                <span>Registrar doação própria</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="customerType"
                  checked={showCustomerForm}
                  onChange={() => setShowCustomerForm(true)}
                  className="text-teal-600"
                />
                <span>Registrar doação alheia</span>
              </label>
            </div>
            
            {showCustomerForm && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Nome da pessoa que está doando"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required={showCustomerForm}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Registrando via {user?.first_name}
                </p>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Doação (R$)
            </label>
            <input
              type="number"
              name="value"
              min="1"
              step="0.01"
              value={donationValue}
              onChange={(e) => setDonationValue(e.target.value)}
              placeholder="Digite o valor da doação"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          {donationValue && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Resumo da Doação</h3>
              <p className="text-lg font-bold text-teal-600">
                Valor: R$ {parseFloat(donationValue || "0").toFixed(2)}
              </p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={!donationValue || !user || (showCustomerForm && !customerName)}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Registrar Doação
          </button>
        </Form>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Após registrar, você receberá as instruções para pagamento via PIX
        </p>
      </div>
      
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