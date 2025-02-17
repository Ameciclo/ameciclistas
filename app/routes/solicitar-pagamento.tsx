// routes/solicitar-pagamento.tsx

import { useEffect, useState } from "react";
import { useLoaderData, Form, Link } from "@remix-run/react";

// Componentes internos
import FornecedorInput from "~/components/Forms/SupplierSelect";
import RealValueInput from "~/components/Forms/Inputs/RealValueInput";
import DescriptionInput from "~/components/Forms/Inputs/DescriptionInput";
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
export { loader, action };

export default function SolicitarPagamento() {
  const { projects, suppliers, currentUserCategories, usersInfo } =
    useLoaderData<typeof loader>();

  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [transactionType, setTransactionType] = useState("Solicitar Pagamento");

  const projectOptions = projects
    .map((project) => ({
      value: project.spreadsheet_id,
      label: project.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  projectOptions.unshift({ value: "", label: "Selecione um projeto" });

  const [projectId, setProjectId] = useState("");
  const [budgetItem, setBudgetItem] = useState("");

  const selectedProject = projects.find(
    (project) => project.spreadsheet_id === projectId
  );

  const budgetOptions = selectedProject
    ? selectedProject.budget_items
        .sort((a, b) => a.localeCompare(b))
        .map((item) => ({ value: item, label: item }))
    : [{ value: "", label: "Selecione uma rubrica" }];

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("0");
  const [fornecedor, setFornecedor] = useState("");
  const [user, setUser] = useState<UserData | null>(null);

  const [isReembolso, setIsReembolso] = useState(false);
  const [reembolsoFornecedor, setReembolsoFornecedor] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  useEffect(() => {
    setUser(() => getTelegramUsersInfo());
  }, [usersInfo]);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as any]);
    }
  }, [user]);

  // Validação do formulário: se reembolso estiver marcado, o campo da pessoa do reembolso deve ser preenchido.
  const isFormValid =
    projectId !== null &&
    budgetItem !== null &&
    descricao.trim() !== "" &&
    valor !== "0" &&
    fornecedor.trim() !== "" &&
    (!isReembolso || reembolsoFornecedor.trim() !== "");

  // Encontrar o fornecedor selecionado na lista (para enviar o objeto completo)
  const fornecedorSelecionado = suppliers.find((s: any) => s.id === fornecedor);

  const projectJSONStringfyed = projectId ? JSON.stringify(projectId) : "";
  const supplierJSONStringfyed = fornecedorSelecionado
    ? JSON.stringify(fornecedorSelecionado)
    : "";
  const userJSONStringfyed = user
    ? JSON.stringify(user)
    : JSON.stringify({
        err: "Informações de usuário do telegram não encontrado",
      });

  // Os tipos de transação que exigem o campo de data de pagamento
  const transactionTypesThatNeedDate = [
    "Agendar pagamento",
    "Registrar pagamento",
    "Registrar Caixa Físico",
  ];

  return isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? (
    <Form method="post" className="container">
      <FormTitle>💰 Solicitar Pagamento</FormTitle>

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

      <FornecedorInput
        fornecedores={suppliers}
        fornecedor={fornecedor}
        setFornecedor={setFornecedor}
      />

      {/* Checkbox para Reembolso e, se marcado, campo para a pessoa do reembolso */}
      <div className="form-group">
        <label className="form-label">
          <input
            type="checkbox"
            checked={isReembolso}
            onChange={(e) => setIsReembolso(e.target.checked)}
          />{" "}
          Reembolso
        </label>
      </div>
      {isReembolso && (
        <div className="form-group">
          <label className="form-label">Pessoa do Reembolso:</label>
          <FornecedorInput
            fornecedores={suppliers}
            fornecedor={reembolsoFornecedor}
            setFornecedor={setReembolsoFornecedor}
          />
        </div>
      )}

      <DescriptionInput descricao={descricao} setDescricao={setDescricao} />

      <RealValueInput name="valor" valor={valor} setValor={setValor} />

      {/* Exibe o campo de data somente para os tipos que exigem */}
      {transactionTypesThatNeedDate.includes(transactionType) && (
        <div className="form-group">
          <label className="form-label">Data de Pagamento:</label>
          <input
            type="date"
            className="form-input"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>
      )}

      {/* Envio dos dados com keys em inglês */}
      <SendToAction
        fields={[
          { name: "telegramUsersInfo", value: userJSONStringfyed },
          { name: "project", value: projectJSONStringfyed },
          { name: "budgetItem", value: budgetItem || "" },
          { name: "description", value: descricao },
          { name: "value", value: valor },
          { name: "supplier", value: supplierJSONStringfyed },
          { name: "transactionType", value: transactionType },
          { name: "isRefund", value: JSON.stringify(isReembolso) },
          { name: "refundSupplier", value: reembolsoFornecedor },
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
