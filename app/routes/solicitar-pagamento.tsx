// routes/solicitar-pagamento.tsx

import { useEffect, useState } from "react";
import { useLoaderData, Form, Link } from "@remix-run/react";

// Componentes internos
import ProjectSelect from "~/components/Forms/ProjectSelect";
import RubricaSelect from "~/components/Forms/RubricaSelect";
import FornecedorInput from "~/components/Forms/FornecedorInput";
import RealValueInput from "~/components/Forms/Inputs/RealValueInput";
import DescriptionInput from "~/components/Forms/Inputs/DescriptionInput";
import FormTitle from "~/components/Forms/FormTitle";
import { BackButton } from "~/components/CommonButtons";
import SendToAction from "~/components/SendToAction";

// Utilitários e tipos
import { UserCategory, UserData } from "../utils/types";
import { Project } from "~/utils/types";

import { getTelegramUsersInfo } from "~/utils/users";
import { isAuth } from "~/utils/isAuthorized";
import Unauthorized from "~/components/Unauthorized";

import { action } from "~/handlers/actions/solicitar-pagamento";
import { loader } from "~/handlers/loaders/solicitar-pagamento";
export { loader, action };

export default function SolicitarPagamento() {
  const { projects, suppliers, currentUserCategories, usersInfo } =
    useLoaderData<typeof loader>();

  // Estados existentes
  const [userPermissions, setUserPermissions] = useState(currentUserCategories);
  const [projetoSelecionado, setProjetoSelecionado] = useState<Project | null>(
    null
  );
  const [rubricaSelecionada, setRubricaSelecionada] = useState<string | null>(
    null
  );
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("0");
  const [fornecedor, setFornecedor] = useState("");
  const [user, setUser] = useState<UserData | null>(null);

  // Estados novos para transação, reembolso e data de pagamento
  const [transactionType, setTransactionType] = useState("Solicitar Pagamento");
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
    projetoSelecionado !== null &&
    rubricaSelecionada !== null &&
    descricao.trim() !== "" &&
    valor !== "0" &&
    fornecedor.trim() !== "" &&
    (!isReembolso || reembolsoFornecedor.trim() !== "");

  // Encontrar o fornecedor selecionado na lista (para enviar o objeto completo)
  const fornecedorSelecionado = suppliers.find((s: any) => s.id === fornecedor);

  const projectJSONStringfyed = projetoSelecionado
    ? JSON.stringify(projetoSelecionado)
    : "";
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

      {/* Campo para selecionar o tipo de transação */}
      <div className="form-group">
        <label className="form-label">Tipo de Transação:</label>
        <select
          className="form-input"
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
        >
          <option value="Solicitar Pagamento">Solicitar Pagamento</option>
          <option value="Registrar pagamento">Registrar pagamento</option>
          <option value="Registrar Caixa Físico">Registrar Caixa Físico</option>
          <option value="Agendar pagamento">Agendar pagamento</option>
        </select>
      </div>

      <ProjectSelect
        projetos={projects}
        projetoSelecionado={projetoSelecionado}
        setProjetoSelecionado={setProjetoSelecionado}
        setRubricaSelecionada={setRubricaSelecionada}
      />

      {projetoSelecionado && (
        <RubricaSelect
          projetoSelecionado={projetoSelecionado}
          rubricaSelecionada={rubricaSelecionada}
          setRubricaSelecionada={setRubricaSelecionada}
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
          { name: "budgetItem", value: rubricaSelecionada || "" },
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
