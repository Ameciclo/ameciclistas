// routes/solicitar-pagamento.tsx
// Group external libraries
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate, Form } from "@remix-run/react";

// Group internal components
import ProjectSelect from "~/components/SolicitarPagamento/ProjectSelect";
import RubricaSelect from "~/components/SolicitarPagamento/RubricaSelect";
import FornecedorInput from "~/components/SolicitarPagamento/FornecedorInput";
import DescricaoInput from "~/components/SolicitarPagamento/DescricaoInput";
import ValorInput from "~/components/ValorInput";

// Group utilities and types
import { UserCategory, UserData } from "../api/types";
import { Project } from "~/api/types";

import { loader } from "~/loaders/solicitar-pagamento-loader";
import { action } from "~/loaders/solicitar-pagamento-action";
import { getTelegramUserInfo } from "~/api/users";
import { isAuth } from "~/hooks/isAuthorized";
import Unauthorized from "~/components/Unauthorized";

export { loader, action };

export default function SolicitarPagamento() {
  const { projects, suppliers, currentUserCategories, userCategoriesObject } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories)
  const navigate = useNavigate();
  const [projetoSelecionado, setProjetoSelecionado] = useState<Project | null>(
    null
  );
  const [rubricaSelecionada, setRubricaSelecionada] = useState<string | null>(
    null
  );
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("0");
  const [fornecedor, setFornecedor] = useState("");
  const [userInfo, setUserInfo] = useState<UserData | null>(null);

  useEffect(() => {
    setUserInfo(() => getTelegramUserInfo());
  }, []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo])

  // Verifica se todos os campos obrigatórios estão preenchidos
  const isFormValid =
    projetoSelecionado !== null &&
    rubricaSelecionada !== null &&
    descricao.trim() !== "" &&
    valor !== "0" &&
    fornecedor.trim() !== "";

  // Filtra o fornecedor selecionado, se necessário
  const fornecedorSelecionado = suppliers.find((s: any) => s.id === fornecedor);

  // Prepara os dados do projeto e fornecedor como JSON
  const projectJSONStringfyed = projetoSelecionado
    ? JSON.stringify(projetoSelecionado)
    : "";
  const suppliersJSONStringfyed = JSON.stringify(suppliers)
  const supplierJSONStringfyed = fornecedorSelecionado
    ? JSON.stringify(fornecedorSelecionado)
    : "";
  const userJSONStringfyed = userInfo ? JSON.stringify(userInfo) : "";

  return isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? (
    <Form method="post" className="container">
      <h2 className="text-primary">💰 Solicitar Pagamento</h2>

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

      <DescricaoInput descricao={descricao} setDescricao={setDescricao} />

      <div className="form-group">
        <label className="form-label">Valor:</label>
        <ValorInput name="valor" valor={valor} setValor={setValor} />
      </div>

      <input type="hidden" name="telegramUserInfo" value={userJSONStringfyed} />
      <input type="hidden" name="project" value={projectJSONStringfyed} />
      <input type="hidden" name="fornecedor" value={supplierJSONStringfyed} />
      <input type="hidden" name="fornecedores" value={suppliersJSONStringfyed} />

      <button type="submit" className={isFormValid ? "button-full" : "button-full button-disabled"} disabled={!isFormValid}>
        Enviar Solicitação
      </button>
      <button
        type="button"
        className="button-secondary-full"
        onClick={() => navigate(-1)}
      >
        ⬅️ Voltar
      </button>
    </Form>
  ): <Unauthorized pageName="Solicitar Pagamentos" requiredPermission="Coordenador de Projeto"/>
}
