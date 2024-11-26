import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import Unauthorized from "~/components/Unauthorized"; // Importar o componente Unauthorized
import { getUserCategories } from "../api/users";
import { UserCategory } from "~/api/types";

export default function AdicionarFornecedor() {
  const navigate = useNavigate();
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoChavePix, setTipoChavePix] = useState("email");
  const [chavePix, setChavePix] = useState("");
  const [banco, setBanco] = useState("");
  const [agencia, setAgencia] = useState("");
  const [conta, setConta] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let userId;
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      // Carregar o ID do usuário a partir do arquivo JSON em desenvolvimento
      fetch("/devUserId.json")
        .then((response) => response.json())
        .then((data) => {
          userId = data.userId;
          checkPermissions(userId);
        })
        .catch((error) => {
          console.error("Error loading the user ID from devUserId.json:", error);
        });
    } else {
      const telegram = (window as any)?.Telegram?.WebApp;
      userId = telegram?.initDataUnsafe?.user?.id;

      if (!userId) {
        console.error("User ID is undefined. Closing the app.");
        telegram?.close();
        return;
      }
      checkPermissions(userId);
    }
  }, []);

  const checkPermissions = (userId: number) => {
    const userCategories = getUserCategories(userId);
    setIsAuthorized(userCategories.includes(UserCategory.PROJECT_COORDINATORS));
  };

  const handleCpfCnpjChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, ""); // Remove all non-digit characters
    setCpfCnpj(onlyDigits);

    // Format CPF/CNPJ
    if (onlyDigits.length <= 11) {
      setCpfCnpj(
        onlyDigits
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d)/, "$1.$2")
          .replace(/(\d{3})(\d{2})$/, "$1-$2")
      );
    } else {
      setCpfCnpj(
        onlyDigits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d)/, "$1.$2.$3/$4-$5")
      );
    }
  };

  const handleTelefoneChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, ""); // Remove all non-digit characters
    setTelefone(onlyDigits);

    // Format Telefone
    let formatted = onlyDigits;
    if (onlyDigits.length <= 8) {
      formatted = onlyDigits.replace(/(\d{4})(\d)/, "$1-$2");
    } else if (onlyDigits.length <= 10) {
      formatted = `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(
        2,
        6
      )}-${onlyDigits.slice(6)}`;
    } else if (onlyDigits.length <= 11) {
      formatted = `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(
        2,
        7
      )}-${onlyDigits.slice(7)}`;
    } else {
      formatted = `+${onlyDigits.slice(
        0,
        onlyDigits.length - 10
      )} (${onlyDigits.slice(-10, -8)}) ${onlyDigits.slice(
        -8,
        -4
      )}-${onlyDigits.slice(-4)}`;
    }

    setTelefone(formatted);
  };

  const handleTipoChavePixChange = (value: string) => {
    setTipoChavePix(value);
    if (value === "email") {
      setChavePix(email);
    } else if (value === "cpf/cnpj") {
      setChavePix(cpfCnpj);
    } else if (value === "telefone") {
      setChavePix(telefone);
    } else {
      setChavePix(""); // Reset if "aleatória"
    }
  };

  const handleSubmit = () => {
    const fornecedorData = {
      nomeFantasia,
      razaoSocial,
      cpfCnpj,
      email,
      telefone,
      tipoChavePix,
      chavePix,
      banco,
      agencia,
      conta,
    };

    console.log(fornecedorData); // Aqui você pode enviar os dados para a API ou fazer o que for necessário
  };

  // Se não autorizado, renderizar o componente Unauthorized
  if (!isAuthorized) {
    return <Unauthorized pageName="Adicionar Fornecedor" requiredPermission="PROJECT_COORDINATORS" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600">📦 Adicionar Fornecedor</h2>

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
        <label className="font-bold">Razão Social:</label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="text"
          value={razaoSocial}
          onChange={(e) => setRazaoSocial(e.target.value)}
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">CPF/CNPJ:</label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="text"
          value={cpfCnpj}
          onChange={(e) => handleCpfCnpjChange(e.target.value)}
          placeholder="Apenas números"
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Email:</label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contato@ameciclo.org"
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Telefone:</label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="text"
          value={telefone}
          onChange={(e) => handleTelefoneChange(e.target.value)}
          placeholder="Apenas números"
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Tipo de Chave PIX:</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={tipoChavePix}
          onChange={(e) => handleTipoChavePixChange(e.target.value)}
        >
          <option value="email">Email</option>
          <option value="cpf/cnpj">CPF/CNPJ</option>
          <option value="telefone">Telefone</option>
          <option value="aleatoria">Aleatória</option>
        </select>
      </div>

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

      {tipoChavePix === "outro" && (
        <>
          <div className="form-group mb-4">
            <label className="font-bold">Banco:</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              placeholder="Digite o nome do banco"
            />
          </div>

          <div className="form-group mb-4">
            <label className="font-bold">Agência:</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={agencia}
              onChange={(e) => setAgencia(e.target.value.replace(/\D/g, ""))} // Permitir apenas números
              placeholder="Apenas números"
            />
          </div>

          <div className="form-group mb-4">
            <label className="font-bold">Conta:</label>
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              type="text"
              value={conta}
              onChange={(e) => setConta(e.target.value.replace(/\D/g, ""))} // Permitir apenas números
              placeholder="Apenas números ou 'X'"
            />
          </div>
        </>
      )}

      <button className="button-full" onClick={handleSubmit}>
        Enviar Solicitação
      </button>
      <button className="button-secondary-full" onClick={() => navigate(-1)}>
        ⬅️ Voltar
      </button>
    </div>
  );
}
