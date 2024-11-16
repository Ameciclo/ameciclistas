import { useState, useEffect } from "react";
import {
  json,
  redirect,
  useLoaderData,
  useNavigate,
  Form,
} from "@remix-run/react";
import ValorInput from "~/components/ValorInput";
import FornecedorAutocomplete from "~/components/FornecedorAutocomplete";
import { getUserCategories, UserCategory } from "../api/users";
import Unauthorized from "~/components/Unauthorized";
import { Project } from "~/api/types";
import {
  getProjects,
  getSuppliers,
  savePaymentRequest,
} from "~/api/firebaseConnection.server"; // Importação atualizada

import { ActionFunction } from "@remix-run/node";

const parseFormattedValue = (formattedValue: string): number => {
  return parseFloat(
    formattedValue.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
  );
};

export async function loader() {
  let projects = await getProjects();
  let suppliers = await getSuppliers();

  suppliers = Object.values(suppliers).map((supplier: any) => {
    let tipoChavePix: string;

    // Determina o tipo da chave PIX
    if (supplier.id.startsWith("CPF")) {
      tipoChavePix = "cpf/cnpj";
    } else if (supplier.bank_code === "PIX") {
      tipoChavePix = "pix";
    } else {
      tipoChavePix = "outro";
    }

    // Retorna no formato esperado
    return {
      id: supplier.id,
      nome: supplier.name,
      cpfCnpj: supplier.id, // Assume-se que o ID é o CPF ou CNPJ
      email: "", // Preenchido manualmente ou mantido vazio se não disponível
      telefone: "", // Não há telefone disponível nos dados reais
      chavePix: supplier.id, // Usa o ID como chave PIX por padrão
      tipoChavePix: tipoChavePix,
    };
  });

  projects = Object.values(projects).map((project: any, index: number) => {
    return {
      id: index + 1, // Gera um id numérico temporário (começando de 1)
      spreadsheet_id: project.spreadsheet_id, // Mantém o spreadsheet_id original
      nome: project.name,
      rubricas: project.budget_items,
    };
  });

  return json({ projects, suppliers });
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  console.log(formData);
  const paymentRequest = {
    projeto: formData.get("projeto"),
    rubrica: formData.get("rubrica"),
    fornecedor: formData.get("fornecedor"),
    descricao: formData.get("descricao"),
    valor: formData.get("valor"),
  };

  try {
    await savePaymentRequest(paymentRequest);
    return redirect("/solicitar-pagamento-sucesso"); 
  } catch (error: any) {
    console.error("Erro ao enviar solicitação:", error);
    return json({ error: error.message }, { status: 500 });
  }
};

export default function SolicitarPagamento() {
  const navigate = useNavigate();
  const { projects, suppliers } = useLoaderData<typeof loader>();

  const [projetoSelecionado, setProjetoSelecionado] = useState<Project | null>(
    null
  );
  const [rubricaSelecionada, setRubricaSelecionada] = useState<string | null>(
    null
  );
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [projetos, setProjetos] = useState<Project[]>(projects);
  const [fornecedores, setFornecedores] = useState<any[]>(suppliers);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setProjetos(projects);
    setFornecedores(suppliers);

    let userId;
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      fetch("/devUserId.json")
        .then((response) => response.json())
        .then((data) => {
          userId = data.userId;
          checkPermissions(userId);
        })
        .catch((error) => {
          console.error(
            "Error loading the user ID from devUserId.json:",
            error
          );
        });
    } else {
      const telegram = (window as any)?.Telegram?.WebApp;
      userId = telegram?.initDataUnsafe?.user?.id;

      if (!userId) {
        console.error("User ID is undefined. Closing the app.");
        telegram?.close();
        return;
      }
      checkPermissions(userId);
    }
  }, [projects, suppliers]);

  const checkPermissions = (userId: number) => {
    const userCategories = getUserCategories(userId);
    setIsAuthorized(userCategories.includes(UserCategory.AMECICLISTAS));
  };

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
      <h2 className="text-primary">💰 Solicitar Pagamento</h2>

      <div className="form-group">
        <label className="form-label">Projeto:</label>
        <select
          name="projeto" // Adicionado
          className="form-input"
          value={projetoSelecionado?.id || ""}
          onChange={(e) => {
            const projeto = projetos.find(
              (p) => p.id === Number(e.target.value) // Converte e.target.value para número
            );
            setProjetoSelecionado(projeto || null);
            setRubricaSelecionada(null); // Resetar a rubrica quando mudar o projeto
          }}
        >
          <option value="">Selecione um projeto</option>
          {projetos.map((projeto) => (
            <option key={projeto.id} value={projeto.id}>
              {projeto.nome}
            </option>
          ))}
        </select>
      </div>

      {projetoSelecionado && (
        <div className="form-group">
          <label className="form-label">Rubrica:</label>
          <select
            name="rubrica" // Adicionado
            className="form-input"
            value={rubricaSelecionada || ""}
            onChange={(e) => setRubricaSelecionada(e.target.value)}
          >
            <option value="">Selecione uma rubrica</option>
            {projetoSelecionado.rubricas.map((rubrica) => (
              <option key={rubrica} value={rubrica}>
                {rubrica}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Fornecedor:</label>
        <FornecedorAutocomplete
          fornecedores={fornecedores}
          value={fornecedor}
          onChange={setFornecedor}
        />
        <input type="hidden" name="fornecedor" value={fornecedor} />{" "}
        {/* Adicionado */}
      </div>

      <div className="form-group">
        <label className="form-label">Descrição:</label>
        <textarea
          name="descricao"
          className="form-input"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
        ></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">Valor:</label>
        <ValorInput name="valor" valor={valor} setValor={setValor} />
      </div>

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
