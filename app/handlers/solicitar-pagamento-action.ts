import { redirect, ActionFunction } from "@remix-run/node";
import { saveRecipient } from "~/api/firebaseConnection.server";
// import { requireUserPermissions } from "~/utils/permissions";
// import { UserCategory } from "~/api/types";

export const action: ActionFunction = async ({ request }) => {
  // Garante a permissão do usuário
  // await requireUserPermissions(request, [UserCategory.PROJECT_COORDINATORS]);
  
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType !== "adicionarFornecedor") {
    return redirect("/");
  }

  // Obter dados do formulário
  const tipoPessoa = formData.get("tipoPessoa")?.toString(); // "fisica" ou "juridica"
  const nomeFantasia = formData.get("nomeFantasia")?.toString();
  const razaoSocial = formData.get("razaoSocial")?.toString();
  const cnpj = formData.get("cnpj")?.toString();
  const nomeCompleto = formData.get("nomeCompleto")?.toString();
  const cpf = formData.get("cpf")?.toString();
  const enderecoCompleto = formData.get("enderecoCompleto")?.toString() || "";
  const contatosJson = formData.get("contatos")?.toString();
  const formaPagamento = formData.get("formaPagamento")?.toString(); // PIX, Conta Bancária, Boleto, Dinheiro
  
  const chavePix = formData.get("chavePix")?.toString();
  const banco = formData.get("banco")?.toString();
  const agencia = formData.get("agencia")?.toString();
  const conta = formData.get("conta")?.toString();
  const tipoConta = formData.get("tipoConta")?.toString();

  let contatos: Array<{ type: string; value: string }> = [];
  if (contatosJson) {
    try {
      contatos = JSON.parse(contatosJson);
    } catch (error) {
      return new Response("Erro ao converter contatos para JSON", { status: 400 });
    }
  }

  // Validação mínima
  if (!tipoPessoa || !formaPagamento) {
    return new Response("Tipo de pessoa ou forma de pagamento ausente", { status: 400 });
  }

  let type = "";
  let name = "";
  let id_number = "";
  let address = "";

  if (tipoPessoa === "juridica") {
    type = "Pessoa Jurídica";
    if (!nomeFantasia || !cnpj) {
      return new Response("Faltando dados para Pessoa Jurídica", { status: 400 });
    }
    name = nomeFantasia;
    id_number = cnpj;
    // Razão social não é obrigatória no objeto final, mas se necessário, poderia ser adicionada separadamente.
  } else {
    type = "Pessoa Física";
    if (!nomeCompleto || !cpf) {
      return new Response("Faltando dados para Pessoa Física", { status: 400 });
    }
    name = nomeCompleto;
    id_number = cpf;
    address = enderecoCompleto; // Endereço apenas para PF
  }

  // Montar a lista de métodos de pagamento
  const payment_methods: Array<{ type: string; value: string }> = [];
  switch (formaPagamento) {
    case "PIX":
      if (!chavePix) {
        return new Response("Chave PIX ausente", { status: 400 });
      }
      payment_methods.push({ type: "PIX", value: chavePix });
      break;

    case "Conta Bancária":
      if (!banco || !agencia || !conta || !tipoConta) {
        return new Response("Dados da conta bancária incompletos", { status: 400 });
      }
      payment_methods.push({
        type: "Conta Bancária",
        value: `Banco: ${banco}, Agência: ${agencia}, Conta: ${conta} (${tipoConta})`,
      });
      break;

    case "Boleto":
      // Caso não tenha um valor específico para boleto, colocar algo fixo ou pedir do form
      payment_methods.push({ type: "Boleto", value: "boleto_info" });
      break;

    case "Dinheiro":
      payment_methods.push({ type: "Dinheiro", value: "Dinheiro" });
      break;

    default:
      return new Response("Forma de pagamento inválida", { status: 400 });
  }

  // Definir supplier_id como CPF ou CNPJ (id_number já está definido)
  const supplier_id = id_number;

  const supplierData = {
    type,
    name,
    id_number,
    contacts: contatos,
    address,
    payment_methods
  };

  // Estrutura final
  const finalData = {
    suppliers: {
      [supplier_id]: supplierData,
    },
  };

  // Salva no Firebase (adapte sua função saveRecipient conforme necessário)
  await saveRecipient(finalData);

  return redirect("/sucesso/adicionar-fornecedor");
};
