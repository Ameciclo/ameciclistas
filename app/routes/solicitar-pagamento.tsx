// routes/solicitar-pagamento.tsx

import { useEffect, useState } from "react";
import { useLoaderData, Form, Link } from "@remix-run/react";

// Componentes internos
import AutosuggestInput from "~/components/Forms/SupplierSelect";
import CurrenyValueInput from "~/components/Forms/Inputs/CurrencyValueInput";
import LongTextInput from "~/components/Forms/Inputs/LongTextInput";
import FormTitle from "~/components/Forms/FormTitle";
import { BackButton } from "~/components/CommonButtons";
import SendToAction from "~/components/SendToAction";
import SelectInput from "~/components/Forms/Inputs/SelectInput";

// Utilitários e tipos
import { UserCategory, UserData } from "../utils/types";

import { getTelegramUsersInfo } from "~/utils/users";
import { isAuth } from "~/utils/isAuthorized";
import Unauthorized from "~/components/Unauthorized";

import { action } from "~/handlers/actions/solicitar-pagamento";
import { loader } from "~/handlers/loaders/solicitar-pagamento";
import DateInput from "~/components/Forms/Inputs/DateInput";
import Checkbox from "~/components/Forms/Inputs/CheckBoxI";
export { loader, action };

export default function SolicitarPagamento() {
  const { projects, suppliers, currentUserCategories, usersInfo } =
    useLoaderData<typeof loader>();

  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Formato "YYYY-MM-DD"
  });
  const [transactionType, setTransactionType] = useState("Solicitar Pagamento");
  const [projectId, setProjectId] = useState("");
  const [budgetItem, setBudgetItem] = useState("");
  const [supplier, setSupplier] = useState("");
  const [isRefund, setIsRefund] = useState(false);
  const [refundSupplier, setRefundSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [paymentValue, setPaymentValue] = useState("0");

  const projectOptions = projects
    .map((project) => ({
      value: project.spreadsheet_id,
      label: project.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  projectOptions.unshift({ value: "", label: "Selecione um projeto" });

  const selectedProject = projects.find(
    (project) => project.spreadsheet_id === projectId
  );

  const budgetOptions = selectedProject
    ? selectedProject.budget_items
        .sort((a, b) => a.localeCompare(b))
        .map((item) => ({ value: item, label: item }))
    : [{ value: "", label: "Selecione uma rubrica" }];

  useEffect(() => {
    setUser(() => getTelegramUsersInfo());
  }, [usersInfo]);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as any]);
    }
  }, [user]);

  const isFormValid =
    projectId !== null &&
    budgetItem !== null &&
    description.trim() !== "" &&
    paymentValue !== "0" &&
    supplier.trim() !== "" &&
    (!isRefund || refundSupplier.trim() !== "");

  // Encontrar o fornecedor selecionado na lista (para enviar o objeto completo)
  const selectedSupplier = suppliers.find((s: any) => s.id === supplier);

  const projectJSONStringfyed = projectId ? JSON.stringify(projectId) : "";
  const supplierJSONStringfyed = selectedSupplier
    ? JSON.stringify(selectedSupplier)
    : "";
  const userJSONStringfyed = user
    ? JSON.stringify(user)
    : JSON.stringify({
        err: "Informações de usuário do telegram não encontrado",
      });

  return isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? (
    <Form method="post" className="container">
      <FormTitle>💰 Solicitar Pagamento</FormTitle>

      <DateInput
        label="Data do pagamento:"
        value={paymentDate}
        onChange={(e: any) => setPaymentDate(e.target.value)}
      />

      <SelectInput
        label="Tipo de Transação:"
        name="transactionType"
        value={transactionType}
        onChange={(e) => setTransactionType(e.target.value)}
        options={[
          { value: "Solicitar Pagamento", label: "Solicitar Pagamento" },
          { value: "Registrar pagamento", label: "Registrar pagamento" },
          { value: "Registrar Caixa Físico", label: "Registrar Caixa Físico" },
          { value: "Agendar pagamento", label: "Agendar pagamento" },
        ]}
      />

      <SelectInput
        label="Projeto:"
        name="project"
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        options={projectOptions}
      />

      {projectId && (
        <SelectInput
          label="Rubrica:"
          name="budgetItem"
          value={budgetItem}
          onChange={(e) => setBudgetItem(e.target.value)}
          options={budgetOptions}
        />
      )}

      <AutosuggestInput
        suggestionsList={suppliers}
        suggestion={supplier}
        setSuggestion={setSupplier}
      />

      <Checkbox label="Reembolso" checked={isRefund} onChange={setIsRefund} />
      {isRefund && (
        <div className="form-group">
          <label className="form-label">Pessoa do Reembolso:</label>
          <AutosuggestInput
            suggestionsList={suppliers}
            suggestion={refundSupplier}
            setSuggestion={setRefundSupplier}
          />
        </div>
      )}

      <LongTextInput
        title={"Descrição"}
        text={description}
        setText={setDescription}
      />

      <CurrenyValueInput
        name="paymentValue"
        currencyValue={paymentValue}
        setCurrencyValue={setPaymentValue}
      />

      <SendToAction
        fields={[
          { name: "telegramUsersInfo", value: userJSONStringfyed },
          { name: "project", value: projectJSONStringfyed },
          { name: "budgetItem", value: budgetItem || "" },
          { name: "description", value: description },
          { name: "paymentValue", value: paymentValue },
          { name: "supplier", value: supplierJSONStringfyed },
          { name: "transactionType", value: transactionType },
          { name: "isRefund", value: JSON.stringify(isRefund) },
          { name: "refundSupplier", value: refundSupplier },
          { name: "paymentDate", value: paymentDate },
        ]}
      />

      <button
        type="submit"
        className={isFormValid ? "button-full" : "button-full button-disabled"}
        disabled={!isFormValid}
      >
        🤞 Enviar Solicitação
      </button>
      <Link to="/adicionar-fornecedor">
        <button
          type="button"
          className={`button-full ${
            !isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)
              ? "button-disabled"
              : ""
          }`}
          disabled={!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)}
        >
          📦 Adicionar Fornecedor
        </button>
      </Link>
      <BackButton />
    </Form>
  ) : (
    <Unauthorized
      pageName="Solicitar Pagamentos"
      requiredPermission="Coordenador de Projeto"
    />
  );
}
