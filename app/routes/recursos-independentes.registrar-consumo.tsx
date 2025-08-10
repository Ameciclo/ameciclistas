import { ActionFunction, LoaderFunction, json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getTelegramUsersInfo } from "~/utils/users";
import telegramInit from "~/utils/telegramInit";
import { getProducts, saveSale } from "~/api/firebaseConnection.server";
import { Product, ProductCategory, SaleStatus, UserData } from "~/utils/types";

export const loader: LoaderFunction = async () => {
  const products = await getProducts();
  return json({ products });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  
  try {
    const saleData = {
      userId: parseInt(formData.get("userId") as string),
      userName: formData.get("userName") as string,
      productId: formData.get("productId") as string,
      productName: formData.get("productName") as string,
      variantId: formData.get("variantId") as string || undefined,
      variantName: formData.get("variantName") as string || undefined,
      quantity: parseInt(formData.get("quantity") as string),
      unitPrice: parseFloat(formData.get("unitPrice") as string),
      totalValue: parseFloat(formData.get("totalValue") as string),
      status: SaleStatus.PENDING,
    };

    await saveSale(saleData);
    return redirect("/recursos-independentes/meus-consumos?success=true");
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};

export default function RegistrarConsumo() {
  const { products } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [user, setUser] = useState<UserData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    telegramInit();
    setUser(getTelegramUsersInfo());
  }, []);

  const productsList = products ? Object.values(products) as Product[] : [];
  const currentPrice = selectedProduct?.variants?.find(v => v.id === selectedVariant)?.price || selectedProduct?.price || 0;
  const totalValue = currentPrice * quantity;

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
        Registrar Consumo
      </h1>

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="max-w-md mx-auto space-y-4">
        <input type="hidden" name="userId" value={user?.id || ""} />
        <input type="hidden" name="userName" value={user?.first_name || ""} />
        <input type="hidden" name="productName" value={selectedProduct?.name || ""} />
        <input type="hidden" name="unitPrice" value={currentPrice} />
        <input type="hidden" name="totalValue" value={totalValue} />
        
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
              productsList.reduce((acc, product) => {
                if (!acc[product.category]) acc[product.category] = [];
                acc[product.category].push(product);
                return acc;
              }, {} as Record<ProductCategory, Product[]>)
            ).map(([category, products]) => (
              <optgroup key={category} label={getCategoryLabel(category as ProductCategory)}>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - R$ {product.price.toFixed(2)}
                  </option>
                ))}
              </optgroup>
            ))}
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
            <input type="hidden" name="variantName" value={
              selectedProduct.variants.find(v => v.id === selectedVariant)?.name || ""
            } />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantidade
          </label>
          <input
            type="number"
            name="quantity"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
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
          disabled={!selectedProduct || !user}
          className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Registrar Consumo
        </button>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Após registrar, você receberá as instruções para pagamento via PIX
        </p>
      </div>
    </div>
  );
}