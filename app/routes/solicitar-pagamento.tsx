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
import Unauthorized from "~/components/Unauthorized";

// Group utilities and types
import { UserCategory, UserData } from "../api/types";
import { Project } from "~/api/types";

import { useAuthorization } from "~/hooks/useAuthorization";
import { loader } from "~/loaders/solicitar-pagamento-loader";
import { action } from "~/loaders/solicitar-pagamento-action";
import { getTelegramUserInfo } from "~/api/users";

export { loader, action };

export default function SolicitarPagamento() {
  const { projects, suppliers } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const isAuthorized = useAuthorization(UserCategory.ANY_USER);

  const [projetoSelecionado, setProjetoSelecionado] = useState<Project | null>(
    null
  );
  const [rubricaSelecionada, setRubricaSelecionada] = useState<string | null>(
    null
  );
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("0");
  const [fornecedor, setFornecedor] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    setUserData(() => getTelegramUserInfo());
    console.log(userData);
  }, []);

  // Filtra o fornecedor selecionado, se necessário
  const fornecedorSelecionado = suppliers.find((s: any) => s.id === fornecedor);

  // Prepara os dados do projeto e fornecedor como JSON
  const projetoJSON = projetoSelecionado
    ? JSON.stringify(projetoSelecionado)
    : "";
  const fornecedorJSON = fornecedorSelecionado
    ? JSON.stringify(fornecedorSelecionado)
    : "";

  if (!isAuthorized) {
    return (
      <Unauthorized
        pageName="Solicitar Pagamento"
        requiredPermission="AMECICLISTAS"
      />
    );
  }

  return (
    <Form method="post" className="container">
      <h2 className="text-xl font-semibold">Bem-vindo, {userData?.first_name}!</h2>

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

      <input
        type="hidden"
        name="telegramUserId"
        value={userData?.id || ""}
      />
      <input
        type="hidden"
        name="telegramUserName"
        value={userData?.username || ""}
      />
      <input
        type="hidden"
        name="telegramUserFirstName"
        value={userData?.first_name || ""}
      />

      <input
        type="hidden"
        name="project"
        value={projetoJSON} // Envia o objeto do projeto como JSON
      />

      <input
        type="hidden"
        name="fornecedor"
        value={fornecedorJSON} // Envia o objeto do fornecedor como JSON
      />

      <button type="submit" className="button-full">
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
  );
}
