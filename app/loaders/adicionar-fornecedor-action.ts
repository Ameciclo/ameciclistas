import { redirect } from "@remix-run/node";

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();

  const actionType = formData.get("actionType")?.toString();
  if (actionType !== "adicionarFornecedor") {
    return redirect("/");
  }

  // Coleta campos do formulário
  const tipoPessoa = formData.get("tipoPessoa")?.toString();
  const nomeFantasia = formData.get("nomeFantasia")?.toString();
  const razaoSocial = formData.get("razaoSocial")?.toString();
  const cnpj = formData.get("cnpj")?.toString();
  const nomeCompleto = formData.get("nomeCompleto")?.toString();
  const cpf = formData.get("cpf")?.toString();
  const enderecoCompleto = formData.get("enderecoCompleto")?.toString();
  const contatosJson = formData.get("contatos")?.toString();
  const formaPagamento = formData.get("formaPagamento")?.toString();
  const chavePix = formData.get("chavePix")?.toString();
  const banco = formData.get("banco")?.toString();
  const agencia = formData.get("agencia")?.toString();
  const conta = formData.get("conta")?.toString();
  const tipoConta = formData.get("tipoConta")?.toString();

  let contatos: Array<{ type: string; value: string }> = [];
  try {
    if (contatosJson) {
      contatos = JSON.parse(contatosJson);
    }
  } catch (e) {
    console.error("Erro ao converter contatos JSON:", e);
    return redirect("/");
  }

  // Validação básica
  if (!tipoPessoa || !formaPagamento) {
    console.error("Tipo de pessoa ou forma de pagamento ausente");
    return redirect("/");
  }

  // Validações específicas
  if (tipoPessoa === "juridica") {
    if (!nomeFantasia || !razaoSocial || !cnpj) {
      console.error("Campos obrigatórios para Pessoa Jurídica ausentes");
      return redirect("/");
    }
  } else if (tipoPessoa === "fisica") {
    if (!nomeCompleto || !cpf || !enderecoCompleto) {
      console.error("Campos obrigatórios para Pessoa Física ausentes");
      return redirect("/");
    }
  }

  // Dependendo da forma de pagamento, verifique os campos necessários
  if (formaPagamento === "PIX" && !chavePix) {
    console.error("Chave PIX ausente");
    return redirect("/");
  }
  if (formaPagamento === "Conta Bancária" && (!banco || !agencia || !conta)) {
    console.error("Dados da conta bancária incompletos");
    return redirect("/");
  }

  // Montando objeto para salvar no banco de dados
  const fornecedorData = {
    tipoPessoa,
    nomeFantasia: nomeFantasia || null,
    razaoSocial: razaoSocial || null,
    cnpj: cnpj || null,
    nomeCompleto: nomeCompleto || null,
    cpf: cpf || null,
    enderecoCompleto: enderecoCompleto || null,
    contatos,
    formaPagamento,
    pix: formaPagamento === "PIX" ? chavePix : null,
    contaBancaria:
      formaPagamento === "Conta Bancária"
        ? { banco, agencia, conta, tipo: tipoConta }
        : null,
    boleto: formaPagamento === "Boleto",
    dinheiro: formaPagamento === "Dinheiro",
  };

  // Log dos dados coletados para validação
  console.log("Dados do fornecedor a serem salvos:", fornecedorData);

  // Aqui entra a lógica de persistência:
  // Por exemplo, se você usa Prisma, poderia fazer algo como:
  // await db.fornecedor.create({ data: fornecedorData });

  // Após salvar, redireciona para alguma página de confirmação ou listagem
  return redirect("/adicionar-fornecedor-sucesso");
}
