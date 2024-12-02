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
import { UserData } from "../api/types";
import { Project } from "~/api/types";

import { useAuthorization } from "~/hooks/useAuthorization";
import { loader } from "~/loaders/solicitar-pagamento-loader";
import { action } from "~/loaders/solicitar-pagamento-action";
import { getTelegramGeneralDataInfo, getTelegramUserInfo } from "~/api/users";

export { loader, action };

export default function SolicitarPagamento() {
  const { projects, suppliers } = useLoaderData<typeof loader>();
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [telegramData, setTelegramData] = useState([]);

  useEffect(() => {
    setUserData(() => getTelegramUserInfo());
    setTelegramData(() => getTelegramGeneralDataInfo());
    console.log(telegramData);
  }, []);

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
  const projetoJSON = projetoSelecionado
    ? JSON.stringify(projetoSelecionado)
    : "";
  const fornecedorJSON = fornecedorSelecionado
    ? JSON.stringify(fornecedorSelecionado)
    : "";
  const userJSON = userData ? JSON.stringify(userData) : "";

  return (
    <Form method="post" className="container">
      <h2 className="text-xl font-semibold">
        Bem-vindo, {userData?.first_name}! Estamos no ambiente de{" "}
        {process.env.NODE_ENV === "production" ? "PRODUÇÃO" : "DESENVOLVIMENTO"}
      </h2>

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

      <input type="hidden" name="telegramUserInfo" value={userJSON} />
      <input type="hidden" name="project" value={projetoJSON} />
      <input type="hidden" name="fornecedor" value={fornecedorJSON} />

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
  );
}
