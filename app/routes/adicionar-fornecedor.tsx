import { useState, useEffect } from "react";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { isAuth } from "~/hooks/isAuthorized";
import { action } from "../loaders/adicionar-fornecedor-action";
import { getTelegramUserInfo } from "~/api/users";
import { UserCategory, UserData } from "~/api/types";
import Unauthorized from "~/components/Unauthorized";
import { loader } from "~/loaders/solicitar-pagamento-loader";
export { loader, action };

export default function AdicionarFornecedor() {
  const { userCategoriesObject, currentUserCategories } =
    useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [userInfo, setUserInfo] = useState<UserData | null>({} as UserData);

  useEffect(() => setUserInfo(() => getTelegramUserInfo()), []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo]);

  // Tipo de Pessoa
  const [tipoPessoa, setTipoPessoa] = useState<"fisica" | "juridica">(
    "juridica"
  );

  // Campos Pessoa Jurídica
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");

  // Campos Pessoa Física
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [enderecoCompleto, setEnderecoCompleto] = useState("");

  // Contatos (Comum aos dois tipos)
  const [contatos, setContatos] = useState<
    Array<{ type: string; value: string }>
  >([{ type: "E-mail", value: "" }]);

  // Forma de pagamento
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [chavePix, setChavePix] = useState("");

  // Campos para conta bancária (somente se formaPagamento === 'Conta Bancária')
  const [banco, setBanco] = useState("");
  const [agencia, setAgencia] = useState("");
  const [conta, setConta] = useState("");
  const [tipoConta, setTipoConta] = useState("Corrente"); // Corrente ou Poupança

  // Caso CNPJ ou CPF, formatação pode ser adicionada, mas deixei básico
  const handleCnpjChange = (val: string) => {
    const onlyDigits = val.replace(/\D/g, "");
    // Aqui você pode formatar o CNPJ, se desejar
    setCnpj(onlyDigits);
  };

  const handleCpfChange = (val: string) => {
    const onlyDigits = val.replace(/\D/g, "");
    // Aqui você pode formatar o CPF, se desejar
    setCpf(onlyDigits);
  };

  const handleAddContato = () => {
    setContatos([...contatos, { type: "E-mail", value: "" }]);
  };

  const handleRemoveContato = (index: number) => {
    setContatos(contatos.filter((_, i) => i !== index));
  };

  const handleContatoChange = (
    index: number,
    field: "type" | "value",
    newValue: string
  ) => {
    const newContatos = [...contatos];
    newContatos[index][field] = newValue;
    setContatos(newContatos);
  };

  // Validação de formulário
  const isJuridicaValid =
    tipoPessoa === "juridica" &&
    nomeFantasia !== "" &&
    razaoSocial !== "" &&
    cnpj !== "" &&
    contatos.every((c) => c.value !== "");

  const isFisicaValid =
    tipoPessoa === "fisica" &&
    nomeCompleto !== "" &&
    cpf !== "" &&
    enderecoCompleto !== "" &&
    contatos.every((c) => c.value !== "");

  const isPagtoValido = () => {
    if (formaPagamento === "PIX") {
      return chavePix !== "";
    } else if (formaPagamento === "Conta Bancária") {
      return banco !== "" && agencia !== "" && conta !== "";
    } else if (formaPagamento === "Boleto" || formaPagamento === "Dinheiro") {
      return true; // Não exigindo campos extras por enquanto
    }
    return false;
  };

  const isFormValid =
    ((tipoPessoa === "juridica" && isJuridicaValid) ||
      (tipoPessoa === "fisica" && isFisicaValid)) &&
    isPagtoValido();

  return isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? (
    <Form className="container mx-auto p-4" method="post">
      <h2 className="text-2xl font-bold text-teal-600">
        📦 Adicionar Fornecedor
      </h2>

      <div className="form-group mb-4">
        <label className="font-bold">Tipo de Pessoa:</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={tipoPessoa}
          onChange={(e) =>
            setTipoPessoa(e.target.value as "fisica" | "juridica")
          }
        >
          <option value="juridica">Pessoa Jurídica</option>
          <option value="fisica">Pessoa Física</option>
        </select>
      </div>

      {tipoPessoa === "juridica" && (
        <>
          <div className="form-group mb-4">
            <label className="font-bold">Nome Fantasia:</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
            />
          </div>

          <div className="form-group mb-4">
            <label className="font-bold flex items-center gap-2">
              Razão Social:
              <button
                type="button"
                className="text-sm text-blue-600 underline"
                onClick={() => setRazaoSocial(nomeFantasia)}
              >
                Copiar Nome Fantasia
              </button>
            </label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
            />
          </div>

          <div className="form-group mb-4">
            <label className="font-bold">CNPJ:</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={cnpj}
              onChange={(e) => handleCnpjChange(e.target.value)}
              placeholder="Digite o CNPJ"
            />
          </div>
        </>
      )}

      {tipoPessoa === "fisica" && (
        <>
          <div className="form-group mb-4">
            <label className="font-bold">Nome Completo:</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
            />
          </div>

          <div className="form-group mb-4">
            <label className="font-bold">CPF:</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={cpf}
              onChange={(e) => handleCpfChange(e.target.value)}
              placeholder="Digite o CPF"
            />
          </div>

          <div className="form-group mb-4">
            <label className="font-bold">Endereço Completo:</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              value={enderecoCompleto}
              onChange={(e) => setEnderecoCompleto(e.target.value)}
              placeholder="Rua, Número, Bairro, Cidade, Estado, CEP"
            />
          </div>
        </>
      )}

      <div className="form-group mb-4">
        <label className="font-bold">Contatos:</label>
        {contatos.map((contato, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <select
              className="p-2 border border-gray-300 rounded-md"
              value={contato.type}
              onChange={(e) =>
                handleContatoChange(index, "type", e.target.value)
              }
            >
              <option value="E-mail">E-mail</option>
              <option value="Telefone">Telefone</option>
              <option value="Instagram">Instagram</option>
              <option value="Telegram">Telegram</option>
              <option value="Outro">Outro</option>
            </select>
            <input
              className="p-2 border border-gray-300 rounded-md flex-grow"
              type="text"
              value={contato.value}
              onChange={(e) =>
                handleContatoChange(index, "value", e.target.value)
              }
              placeholder="Valor do contato"
            />
            {contatos.length > 1 && (
              <button
                type="button"
                className="text-red-500"
                onClick={() => handleRemoveContato(index)}
              >
                Remover
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="text-blue-600 underline mt-2"
          onClick={handleAddContato}
        >
          + Adicionar Contato
        </button>
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Forma de Pagamento:</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
        >
          <option value="PIX">PIX</option>
          <option value="Conta Bancária">Conta Bancária</option>
          <option value="Boleto">Boleto</option>
          <option value="Dinheiro">Dinheiro</option>
        </select>
      </div>

      {formaPagamento === "PIX" && (
        <div className="form-group mb-4">
          <label className="font-bold">Chave PIX:</label>
          <input
            className="w-full p-2 border border-gray-300 rounded-md"
            type="text"
            value={chavePix}
            onChange={(e) => setChavePix(e.target.value)}
            placeholder="Digite a chave PIX"
          />
        </div>
      )}

      {formaPagamento === "Conta Bancária" && (
        <>
          <div className="form-group mb-4">
            <label className="font-bold">Banco:</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              placeholder="Nome do Banco"
            />
          </div>

          <div className="form-group mb-4">
            <label className="font-bold">Agência:</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={agencia}
              onChange={(e) => setAgencia(e.target.value)}
              placeholder="Agência"
            />
          </div>

          <div className="form-group mb-4">
            <label className="font-bold">Conta:</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={conta}
              onChange={(e) => setConta(e.target.value)}
              placeholder="Conta"
            />
          </div>

          <div className="form-group mb-4">
            <label className="font-bold">Tipo de Conta:</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={tipoConta}
              onChange={(e) => setTipoConta(e.target.value)}
            >
              <option value="Corrente">Corrente</option>
              <option value="Poupança">Poupança</option>
            </select>
          </div>
        </>
      )}

      <input type="hidden" name="actionType" value="adicionarFornecedor" />
      <input type="hidden" name="tipoPessoa" value={tipoPessoa} />
      <input type="hidden" name="nomeFantasia" value={nomeFantasia} />
      <input type="hidden" name="razaoSocial" value={razaoSocial} />
      <input type="hidden" name="cnpj" value={cnpj} />
      <input type="hidden" name="nomeCompleto" value={nomeCompleto} />
      <input type="hidden" name="cpf" value={cpf} />
      <input type="hidden" name="enderecoCompleto" value={enderecoCompleto} />
      <input type="hidden" name="contatos" value={JSON.stringify(contatos)} />
      <input type="hidden" name="formaPagamento" value={formaPagamento} />
      <input type="hidden" name="chavePix" value={chavePix} />
      <input type="hidden" name="banco" value={banco} />
      <input type="hidden" name="agencia" value={agencia} />
      <input type="hidden" name="conta" value={conta} />
      <input type="hidden" name="tipoConta" value={tipoConta} />

      <button
        type="submit"
        className={isFormValid ? "button-full" : "button-full button-disabled"}
        disabled={!isFormValid}
      >
        🤞 Adicionar Fornecedor
      </button>

      <Link to="/solicitar-pagamento">
        <button className="button-full">💰 Solicitar Pagamento</button>
      </Link>

      <Link to="/" className="mt-4">
        <button className="button-secondary-full">⬅️ Voltar</button>
      </Link>
    </Form>
  ) : (
    <Unauthorized
      pageName="Adicionar Fornecedor"
      requiredPermission="Coordenador de Projeto"
    />
  );
}
