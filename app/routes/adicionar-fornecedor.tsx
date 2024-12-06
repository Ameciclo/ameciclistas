import { useState, useEffect } from "react";
import { Form, Link, useLoaderData, useNavigate } from "@remix-run/react";
import { isAuth } from "~/hooks/isAuthorized";
import { loader } from "../loaders/loader";
import { action } from "../loaders/action";
import { getTelegramUserInfo } from "~/api/users";
import { UserCategory, UserData } from "~/api/types";
import Unauthorized from "~/components/Unauthorized";
export { loader, action }

export default function AdicionarFornecedor() {
  const { userCategoriesObject, currentUserCategories } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories)
  const [userInfo, setUserInfo] = useState<UserData | null>({} as UserData)

  useEffect(() => setUserInfo(() => getTelegramUserInfo()), []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo])

  const navigate = useNavigate();
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoChavePix, setTipoChavePix] = useState("email");
  const [chavePix, setChavePix] = useState("");

  const isFormValid =
    nomeFantasia !== "" &&
    razaoSocial !== "" &&
    cpfCnpj !== "" &&
    email !== "" &&
    telefone !== "" &&
    tipoChavePix !== "" &&
    chavePix !== ""

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

  return isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? (
    <Form className="container mx-auto p-4" method="post">
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

      <input type="hidden" name="actionType" value="adicionarFornecedor" />
      <input type="hidden" name="nomeFantasia" value={nomeFantasia} />
      <input type="hidden" name="razaoSocial" value={razaoSocial} />
      <input type="hidden" name="cpfCnpj" value={cpfCnpj} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="telefone" value={telefone} />
      <input type="hidden" name="tipoChavePix" value={tipoChavePix} />
      <input type="hidden" name="chavePix" value={chavePix} />

      <button type="submit" className={isFormValid ? "button-full" : "button-full button-disabled"} disabled={!isFormValid} >
        Adicionar Fornecedor
      </button>
      <Link to="/" className="mt-4">
        <button className="button-secondary-full">
          ⬅️ Voltar
        </button>
      </Link>
    </Form>
  ) : <Unauthorized pageName="Adicionar Fornecedor" requiredPermission="Coordednador de Projeto" />
}
