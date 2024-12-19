// routes/solicitar-pagamento.tsx
// Group external libraries
import { useEffect, useState } from "react";
import { useLoaderData, Form, Link } from "@remix-run/react";

// Group internal components
import ProjectSelect from "~/components/Forms/ProjectSelect";
import RubricaSelect from "~/components/Forms/RubricaSelect";
import FornecedorInput from "~/components/Forms/FornecedorInput";
import RealValueInput from "~/components/Forms/Inputs/RealValueInput";

// Group utilities and types
import { UserCategory, UserData } from "../utils/types";
import { Project } from "~/utils/types";

import { getTelegramUsersInfo } from "~/utils/users";
import { isAuth } from "~/utils/isAuthorized";
import Unauthorized from "~/components/Unauthorized";
import { BackButton } from "~/components/CommonButtons";

import { action } from "~/handlers/actions/solicitar-pagamento";
import { loader } from "~/handlers/loaders/solicitar-pagamento";
import SendToAction from "~/components/SendToAction";
import DescriptionInput from "~/components/Forms/Inputs/DescriptionInput";
import FormTitle from "~/components/Forms/FormTitle";
export { loader, action };

export default function SolicitarPagamento() {
  const { projects, suppliers, currentUserCategories, usersInfo } =
    useLoaderData<typeof loader>();
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

  useEffect(() => {
    setUser(() => getTelegramUsersInfo());
  }, []);

  useEffect(() => {
    if (user?.id && usersInfo[user.id]) {
      setUserPermissions([usersInfo[user.id].role as any]);
    }
  }, [user, usersInfo]);

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
  const suppliersJSONStringfyed = JSON.stringify(suppliers);
  const supplierJSONStringfyed = fornecedorSelecionado
    ? JSON.stringify(fornecedorSelecionado)
    : "";
  const userJSONStringfyed = user
    ? JSON.stringify(user)
    : JSON.stringify({
      err: "Informações de usuário do telegram nao encontrado",
    });

  return isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS) ? (
    <Form method="post" className="container">
      <FormTitle>💰 Solicitar Pagamento</FormTitle>

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

      <DescriptionInput descricao={descricao} setDescricao={setDescricao} />


      <RealValueInput name="valor" valor={valor} setValor={setValor} />

      <SendToAction
        fields={[
          { name: "telegramusersInfo", value: userJSONStringfyed },
          { name: "project", value: projectJSONStringfyed },
          { name: "fornecedor", value: supplierJSONStringfyed },
          { name: "fornecedores", value: suppliersJSONStringfyed },
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
          className={`button-full ${!isAuth(userPermissions, UserCategory.PROJECT_COORDINATORS)
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
      pageName="Gerenciamento de Usuários"
      requiredPermission="Coordenador da Ameciclo"
    />
  );
}
