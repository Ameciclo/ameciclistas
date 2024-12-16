import { useState, useEffect } from "react";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { isAuth } from "~/hooks/isAuthorized";
import { action } from "../loaders/adicionar-fornecedor-action";
import { getTelegramUserInfo } from "~/api/users";
import { UserCategory, UserData } from "~/api/types";
import Unauthorized from "~/components/Unauthorized";
import { loader } from "~/loaders/solicitar-pagamento-loader";

const validateIdNumber = (personType: string, idNumber: string): boolean => {
  if (personType === "fisica") {
    return validateCPF(idNumber);
  } else if (personType === "juridica") {
    return validateCNPJ(idNumber);
  } else {
    return false;
  }
};

// Validação de CPF
const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;

  return true;
};

// Validação de CNPJ
const validateCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]+/g, "");
  if (cnpj.length !== 14) return false;

  // Elimina CNPJs invalidos conhecidos
  if (/^(.)\1+$/.test(cnpj)) return false;

  // Valida DVs
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length += 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  let pos2 = length - 7;
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos2--;
    if (pos2 < 2) pos2 = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

const formatIdNumber = (personType: string, value: string): string => {
  if (personType === "fisica") {
    return formatCPF(value.toString());
  } else if (personType === "juridica") {
    return formatCNPJ(value.toString());
  } else {
    return "";
  }
};

// Formatação de CPF
const formatCPF = (cpf: string): string => {
  const onlyDigits = cpf.replace(/\D/g, "");
  return onlyDigits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{2})$/, "$1-$2");
};

// Formatação de CNPJ
const formatCNPJ = (cnpj: string): string => {
  const onlyDigits = cnpj.replace(/\D/g, "");
  return onlyDigits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

// Formatação de Telefone
const formatPhone = (phone: string): string => {
  const onlyDigits = phone.replace(/\D/g, "");
  if (onlyDigits.length <= 8) {
    return onlyDigits.replace(/(\d{4})(\d)/, "$1-$2");
  } else if (onlyDigits.length === 9) {
    return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(
      2,
      7
    )}-${onlyDigits.slice(7)}`;
  } else if (onlyDigits.length === 10) {
    return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(
      2,
      6
    )}-${onlyDigits.slice(6)}`;
  } else {
    return `+${onlyDigits.slice(0, -10)} (${onlyDigits.slice(
      -10,
      -8
    )}) ${onlyDigits.slice(-8, -4)}-${onlyDigits.slice(-4)}`;
  }
};
// Formatação de Email (simplificada)
const formatEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export { loader, action };

export default function AddSupplier() {
  const { userCategoriesObject, currentUserCategories } =
    useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [userInfo, setUserInfo] = useState<UserData | null>({} as UserData);

  useEffect(() => {
    setUserInfo(getTelegramUserInfo());
  }, []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo]);

  // Person Type
  const [personType, setPersonType] = useState<"fisica" | "juridica">(
    "juridica"
  );

  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  // Contacts (Common to both types)
  const [contacts, setContacts] = useState<
    Array<{ type: string; value: string }>
  >([{ type: "E-mail", value: "" }]);

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<
    Array<{ type: string; value: string }>
  >([{ type: "PIX", value: "" }]);

  const getEmailValue = () => {
    const emailContact = contacts.find((contact) => contact.type === "E-mail");
    return emailContact ? emailContact.value : "";
  };

  const getPhoneValue = () => {
    const phoneContact = contacts.find(
      (contact) => contact.type === "Telefone"
    );
    return phoneContact ? phoneContact.value : "";
  };

  const getIdNumberValue = () => idNumber || "";

  const handleIdNumberChange = (personType: string, value: string) => {
    const formatted = formatIdNumber(personType, value);
    setIdNumber(formatted);
  };

  // Handling Phone changes with formatting
  const handlePhoneChange = (index: number, value: string) => {
    const formatted = formatPhone(value);
    const newContacts = [...contacts];
    newContacts[index].value = formatted;
    setContacts(newContacts);
  };

  // Handling Email changes with formatting
  const handleEmailChange = (index: number, value: string) => {
    const formatted = formatEmail(value);
    const newContacts = [...contacts];
    newContacts[index].value = formatted;
    setContacts(newContacts);
  };

  const handleAddContact = () => {
    setContacts([...contacts, { type: "E-mail", value: "" }]);
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleContactChange = (
    index: number,
    field: "type" | "value",
    newValue: string
  ) => {
    const updatedContacts = [...contacts];
    updatedContacts[index][field] = newValue;
    setContacts(updatedContacts);
  };

  // Handling Payment Methods
  const handleAddPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { type: "PIX", value: "" }]);
  };

  const handleRemovePaymentMethod = (index: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
  };

  const handlePaymentMethodChange = (
    index: number,
    field: "type" | "value",
    newValue: string
  ) => {
    const updatedPaymentMethods = [...paymentMethods];
    updatedPaymentMethods[index][field] = newValue;
    setPaymentMethods(updatedPaymentMethods);
  };

  // Form Validation
  const isFormValid =
    name !== "" &&
    fullName !== "" &&
    idNumber !== "" &&
    validateIdNumber(personType, idNumber) &&
    contacts.every((c) => c.value !== "") &&
    paymentMethods.some((pm) => pm.value !== "");

  return isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? (
    <Form className="container mx-auto p-4" method="post">
      <h2 className="text-2xl font-bold text-teal-600">
        📦 Adicionar Fornecedor
      </h2>

      <div className="form-group mb-4">
        <label className="font-bold">Tipo de pessoa:</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={personType}
          onChange={(e) =>
            setPersonType(e.target.value as "fisica" | "juridica")
          }
        >
          <option value="juridica">Pessoa Jurídica</option>
          <option value="fisica">Pessoa Física</option>
        </select>
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">
          {personType === "juridica" ? "Nome Fantasia:" : "Nome / Apelido:"}
        </label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={
            personType === "juridica"
              ? "Digite o nome fantasia"
              : "Digite o nome ou apelido"
          }
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">
          {personType === "juridica" ? "Razão Social:" : "Nome Completo:"}
          <button
            type="button"
            className="text-sm text-blue-600 underline ml-2"
            onClick={() => setFullName(name)}
          >
            Copiar{" "}
            {personType === "juridica" ? "Nome Fantasia" : "Nome / Apelido"}
          </button>
        </label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={
            personType === "juridica"
              ? "Digite a razão social"
              : "Digite o nome completo"
          }
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">
          {personType === "juridica" ? "CNPJ" : "CPF"}:
        </label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="text"
          value={idNumber}
          onChange={(e) => handleIdNumberChange(personType, e.target.value)}
          placeholder={
            personType === "juridica" ? "00.000.000/0000-00" : "000.000.000-00"
          }
        />
        {!validateIdNumber(personType, idNumber) && idNumber.length > 0 && (
          <span className="text-red-500 text-sm">
            {personType === "juridica" ? "CNPJ inválido" : "CPF inválido"}
          </span>
        )}
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Endereço completo (opcional):</label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          placeholder="Rua, endereço, número, complemento, bairro, cidade, estado"
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Contatos:</label>
        {contacts.map((contact, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <select
              className="p-2 border border-gray-300 rounded-md"
              value={contact.type}
              onChange={(e) =>
                handleContactChange(index, "type", e.target.value)
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
              type={contact.type === "E-mail" ? "email" : "text"}
              value={contact.value}
              onChange={(e) =>
                contact.type === "E-mail"
                  ? handleEmailChange(index, e.target.value)
                  : handlePhoneChange(index, e.target.value)
              }
              placeholder="Contato..."
            />
            {contacts.length > 1 && (
              <button
                type="button"
                className="text-red-500"
                onClick={() => handleRemoveContact(index)}
              >
                Remover
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="text-blue-600 underline mt-2"
          onClick={handleAddContact}
        >
          + Adicionar outro contato
        </button>
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Método de pagamento:</label>
        {paymentMethods.map((method, index) => (
          <div key={index} className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <select
                className="p-2 border border-gray-300 rounded-md"
                value={method.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  const newValue =
                    newType === "bill" || newType === "cash" ? newType : "";
                  handlePaymentMethodChange(index, "type", newType);
                  handlePaymentMethodChange(index, "value", newValue);
                }}
              >
                <option value="PIX">PIX</option>
                <option value="account">Conta Bancária</option>
                <option value="bill">Boleto</option>
                <option value="cash">Dinheiro</option>
              </select>

              {method.type === "PIX" && (
                <input
                  className="p-2 border border-gray-300 rounded-md flex-grow"
                  type="text"
                  value={method.value}
                  onChange={(e) =>
                    handlePaymentMethodChange(index, "value", e.target.value)
                  }
                  placeholder="Entre a chave PIX"
                />
              )}

              {method.type === "account" && (
                <input
                  className="p-2 border border-gray-300 rounded-md flex-grow"
                  type="text"
                  value={method.value}
                  onChange={(e) =>
                    handlePaymentMethodChange(index, "value", e.target.value)
                  }
                  placeholder="Banco / Agência / Conta corrente / Poupança?"
                />
              )}

              {(method.type === "bill" || method.type === "cash") && (
                <span className="flex-grow">
                  {method.type === "bill" ? "Boleto" : "Dinheiro"}
                </span>
              )}

              {paymentMethods.length > 1 && (
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => handleRemovePaymentMethod(index)}
                >
                  Remover
                </button>
              )}
            </div>

            {/* Botões para Copiar Valores ao Selecionar PIX */}
            {method.type === "PIX" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                  onClick={() =>
                    handlePaymentMethodChange(index, "value", getEmailValue())
                  }
                >
                  Copiar Email
                </button>
                <button
                  type="button"
                  className="px-2 py-1 bg-green-500 text-white rounded-md text-sm"
                  onClick={() =>
                    handlePaymentMethodChange(index, "value", getPhoneValue())
                  }
                >
                  Copiar Telefone
                </button>
                <button
                  type="button"
                  className="px-2 py-1 bg-yellow-500 text-white rounded-md text-sm"
                  onClick={() =>
                    handlePaymentMethodChange(
                      index,
                      "value",
                      getIdNumberValue()
                    )
                  }
                >
                  Copiar CPF/CNPJ
                </button>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          className="text-blue-600 underline mt-2"
          onClick={handleAddPaymentMethod}
        >
          + Adicionar outro método de pagamento
        </button>
      </div>

      {/* Hidden Inputs */}
      <input type="hidden" name="actionType" value="addSupplier" />
      <input type="hidden" name="personType" value={personType} />
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="fullName" value={fullName} />
      <input type="hidden" name="idNumber" value={idNumber} />
      <input type="hidden" name="fullAddress" value={fullAddress} />
      <input type="hidden" name="contacts" value={JSON.stringify(contacts)} />
      <input
        type="hidden"
        name="paymentMethods"
        value={JSON.stringify(paymentMethods)}
      />

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
        <button className="button-secondary-full">⬅️ Back</button>
      </Link>
    </Form>
  ) : (
    <Unauthorized
      pageName="Adicionar Fornecedor"
      requiredPermission="Coordenador de Projeto"
    />
  );
}
