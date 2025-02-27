import { useState, useEffect } from "react";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { isAuth } from "~/utils/isAuthorized";
import { getTelegramUsersInfo } from "~/utils/users";
import { UserCategory, UserData } from "~/utils/types";
import Unauthorized from "~/components/Unauthorized";
import { formatEmail, formatIdNumber, formatPhone } from "~/utils/format";
import { validateIdNumber } from "~/utils/idNumber";
import { BackButton } from "~/components/Forms/Buttons";

import { action } from "../handlers/actions/adicionar-fornecedor";
import { loader } from "~/handlers/loaders/adicionar-fornecedor";
import SendToAction from "~/components/Forms/SendToAction";
import SelectInput from "~/components/Forms/Inputs/SelectInput";
import FormTitle from "~/components/Forms/FormTitle";
export { loader, action };

export default function AdicionarFornecedor() {
  const { usersInfo, currentUserCategories } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [user, setUser] = useState<UserData | null>({} as UserData);

  useEffect(() => {
    setUser(getTelegramUsersInfo());
  }, []);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as any]);
    }
  }, [user]);

  const [personType, setPersonType] = useState<"fisica" | "juridica">(
    "juridica"
  );

  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  const [contacts, setContacts] = useState<
    Array<{ type: string; value: string }>
  >([{ type: "E-mail", value: "" }]);

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

  const handlePhoneChange = (index: number, value: string) => {
    const formatted = formatPhone(value);
    const newContacts = [...contacts];
    newContacts[index].value = formatted;
    setContacts(newContacts);
  };

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

  const isFormValid =
    name !== "" &&
    fullName !== "" &&
    idNumber !== "" &&
    validateIdNumber(personType, idNumber) &&
    contacts.every((c) => c.value !== "") &&
    paymentMethods.some((pm) => pm.value !== "");

  return isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? (
    <Form className="container mx-auto p-4" method="post">
      <FormTitle> 📦 Adicionar Fornecedor </FormTitle>

      <SelectInput
        label="Tipo de pessoa: "
        value={personType}
        onChange={(e) => setPersonType(e.target.value as "fisica" | "juridica")}
        options={[
          { value: "juridica", label: "Pessoa Jurídica" },
          { value: "fisica", label: "Pessoa Física" },
        ]}
      />

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
              onChange={(e) => {
                const newType = e.target.value;
                // Atualiza o tipo
                handleContactChange(index, "type", newType);
                // Se selecionar "Sem contato", define o valor automaticamente
                if (newType === "Sem contato") {
                  handleContactChange(index, "value", "sem contato");
                } else if (contact.value === "sem contato") {
                  // Se voltar de "Sem contato", limpa o valor
                  handleContactChange(index, "value", "");
                }
              }}
            >
              <option value="E-mail">E-mail</option>
              <option value="Telefone">Telefone</option>
              <option value="Instagram">Instagram</option>
              <option value="Telegram">Telegram</option>
              <option value="Outro">Outro</option>
              <option value="Sem contato">Sem contato</option>
            </select>

            {/* Renderiza o input apenas se o tipo não for "Sem contato" */}
            {contact.type !== "Sem contato" && (
              <input
                className="p-2 border border-gray-300 rounded-md flex-grow"
                type={contact.type === "E-mail" ? "email" : "text"}
                value={contact.value}
                onChange={(e) => {
                  if (contact.type === "E-mail") {
                    handleEmailChange(index, e.target.value);
                  } else if (contact.type === "Telefone") {
                    handlePhoneChange(index, e.target.value);
                  } else {
                    handleContactChange(index, "value", e.target.value);
                  }
                }}
                placeholder="Contato..."
              />
            )}

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
                  // Para os tipos que não exigem input manual, já define o valor
                  const newValue =
                    newType === "bill" ||
                    newType === "cash" ||
                    newType === "PIX Código"
                      ? newType
                      : "";
                  handlePaymentMethodChange(index, "type", newType);
                  handlePaymentMethodChange(index, "value", newValue);
                }}
              >
                <option value="PIX">PIX</option>
                <option value="PIX Código">PIX Código</option>
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

              {(method.type === "bill" ||
                method.type === "cash" ||
                method.type === "PIX Código") && (
                <span className="flex-grow">
                  {method.type === "bill"
                    ? "Boleto"
                    : method.type === "cash"
                    ? "Dinheiro"
                    : "PIX Código"}
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

      <SendToAction
        fields={[
          { name: "personType", value: personType },
          { name: "name", value: name },
          { name: "fullName", value: fullName },
          { name: "idNumber", value: idNumber },
          { name: "fullAddress", value: fullAddress },
          { name: "contacts", value: JSON.stringify(contacts) },
          { name: "paymentMethods", value: JSON.stringify(paymentMethods) },
        ]}
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

      <BackButton />
    </Form>
  ) : (
    <Unauthorized
      pageName="Adicionar Fornecedor"
      requiredPermission="Coordenador de Projeto"
    />
  );
}
