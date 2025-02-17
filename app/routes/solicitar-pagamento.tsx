// routes/solicitar-pagamento.tsx

import { useEffect, useState } from "react";
import { useLoaderData, Form, Link } from "@remix-run/react";

import CurrenyValueInput from "~/components/Forms/Inputs/CurrencyValueInput";
import LongTextInput from "~/components/Forms/Inputs/LongTextInput";
import FormTitle from "~/components/Forms/FormTitle";
import {
  SubmitButton,
  BackButton,
  GenericButton,
} from "~/components/Forms/Buttons";
import SendToAction from "~/components/Forms/SendToAction";
import SelectInput from "~/components/Forms/Inputs/SelectInput";
import DateInput from "~/components/Forms/Inputs/DateInput";
import Checkbox from "~/components/Forms/Inputs/CheckBoxI";
import GenericAutosuggest from "~/components/Forms/Inputs/GenericAutosuggest";

import { Supplier, UserCategory, UserData } from "../utils/types";

import { getTelegramUsersInfo } from "~/utils/users";
import { isAuth } from "~/utils/isAuthorized";
import Unauthorized from "~/components/Unauthorized";

import { action } from "~/handlers/actions/solicitar-pagamento";
import { loader } from "~/handlers/loaders/solicitar-pagamento";
export { loader, action };

export default function SolicitarPagamento() {
  const { projects, suppliers, currentUserCategories, usersInfo } =
    useLoaderData<typeof loader>();

  const [user, setUser] = useState<UserData | null>(null);
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [transactionType, setTransactionType] = useState("Solicitar Pagamento");
  const [projectId, setProjectId] = useState("");
  const [budgetItem, setBudgetItem] = useState("");
  const [supplierInput, setSupplierInput] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [isRefund, setIsRefund] = useState(false);
  const [refundSupplierInput, setRefundSupplierInput] = useState("");
  const [refundSupplierId, setRefundSupplierId] = useState("");
  const [description, setDescription] = useState("");
  const [paymentValue, setPaymentValue] = useState("0");

  useEffect(() => {
    setUser(() => getTelegramUsersInfo());
  }, [usersInfo]);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as any]);
    }
  }, [user]);

  useEffect(() => {
    if (!isRefund) {
      setRefundSupplierId("");
      setRefundSupplierInput("");
    }
  }, [isRefund]);

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

  const projectJSONStringfyed = selectedProject
    ? JSON.stringify(selectedProject)
    : "";

  const selectedSupplier = suppliers.find((s: any) => s.id === supplierId);
  const supplierJSONStringfyed = selectedSupplier
    ? JSON.stringify(selectedSupplier)
    : "";

  const selectedRefundSupplier = suppliers.find(
    (s: any) => s.id === refundSupplierId
  );
  const refundSupplierJSONStringfyed = selectedRefundSupplier
    ? JSON.stringify(selectedRefundSupplier)
    : "";

  const userJSONStringfyed = user
    ? JSON.stringify(user)
    : JSON.stringify({
        err: "Informações de usuário do telegram não encontrado",
      });

  const isFormValid =
    paymentDate !== "" &&
    transactionType !== "" &&
    projectId !== null &&
    budgetItem !== null &&
    supplierId.trim() !== "" &&
    description.trim() !== "" &&
    paymentValue !== "0";
    
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
        name="projectId"
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

      <GenericAutosuggest<Supplier>
        title="Fornecedor:"
        items={suppliers}
        value={supplierInput}
        onChange={setSupplierInput}
        onSuggestionSelected={(_event, { suggestion }) => {
          setSupplierId(suggestion.id);
          setSupplierInput(
            suggestion.nickname
              ? `${suggestion.nickname} (${suggestion.name})`
              : suggestion.name
          );
        }}
        getItemValue={(item) => item.name}
        getItemLabel={(item) =>
          item.nickname ? `${item.nickname} (${item.name})` : item.name
        }
        filterFunction={(item, query) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          (item.nickname
            ? item.nickname.toLowerCase().includes(query.toLowerCase())
            : false)
        }
      />

      <Checkbox label="Reembolso" checked={isRefund} onChange={setIsRefund} />
      {isRefund && (
        <GenericAutosuggest<Supplier>
          title="Pessoa Reembolsada:"
          items={suppliers}
          value={refundSupplierInput}
          onChange={setRefundSupplierInput}
          onSuggestionSelected={(_event, { suggestion }) => {
            setRefundSupplierId(suggestion.id);
            setRefundSupplierInput(
              suggestion.nickname
                ? `${suggestion.nickname} (${suggestion.name})`
                : suggestion.name
            );
          }}
          getItemValue={(item) => item.name}
          getItemLabel={(item) =>
            item.nickname ? `${item.nickname} (${item.name})` : item.name
          }
          filterFunction={(item, query) =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            (item.nickname
              ? item.nickname.toLowerCase().includes(query.toLowerCase())
              : false)
          }
        />
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
          { name: "supplier", value: supplierJSONStringfyed },
          { name: "refundSupplier", value: refundSupplierJSONStringfyed },
          { name: "isRefund", value: JSON.stringify(isRefund) },
          { name: "paymentDate", value: paymentDate },
        ]}
      />
      <SubmitButton
        isEnabled={isFormValid}
        label="🤞 Enviar Solicitação"
        userPermissions={userPermissions}
        requiredPermission={UserCategory.PROJECT_COORDINATORS}
      />
      {/* Botão único para adicionar fornecedor */}
      <GenericButton
        to="/adicionar-fornecedor"
        label="📦 Adicionar Fornecedor"
        userPermissions={userPermissions}
        requiredPermission={UserCategory.PROJECT_COORDINATORS}
      />
      <BackButton />
    </Form>
  ) : (
    <Unauthorized
      pageName="Solicitar Pagamentos"
      requiredPermission="Coordenador de Projeto"
    />
  );
}
