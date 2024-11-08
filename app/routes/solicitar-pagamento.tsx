import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import ValorInput from "~/components/ValorInput";
import FornecedorAutocomplete from "~/components/FornecedorAutocomplete";
import { getUserCategories, UserCategory } from "../api/users";
import Unauthorized from "~/components/Unauthorized";
import { Project, Budget } from "~/api/types";
import googleService from '../services/googleService';


export default function SolicitarPagamento() {
  const navigate = useNavigate();
  const [projetoSelecionado, setProjetoSelecionado] = useState<Project | null>(
    null
  );
  const [rubricaSelecionada, setRubricaSelecionada] = useState<Budget | null>(
    null
  );
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [projetos, setProjetos] = useState<Project[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  

  const handleRequestPayment = async () => {
    try {
      // Adicionar linha na planilha do Google Sheets
      await googleService.appendSheetRow(
        process.env.GOOGLE_SHEET_ID,
        'Página1!A1',
        [descricao, valor, fornecedor ]
      );

      // Criar evento no Google Calendar
     

      alert("Solicitação de pagamento enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
    }
  };

  useEffect(() => {
    let userId;
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      // Carregar o ID do usuário a partir do arquivo JSON em desenvolvimento
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

    // Carregar projetos e fornecedores
    fetch("/app/mockup/projects.json")
      .then((response) => response.json())
      .then((data) => setProjetos(data))
      .catch((error) => console.error("Failed to load projects:", error));

    fetch("/app/mockup/suppliers.json")
      .then((response) => response.json())
      .then((data) => setFornecedores(data))
      .catch((error) => console.error("Failed to load suppliers:", error));
  }, []);

  const checkPermissions = (userId: number) => {
    const userCategories = getUserCategories(userId);
    setIsAuthorized(userCategories.includes(UserCategory.AMECICLISTAS));
  };

  return (
    <div className="container">
      <h2 className="text-primary">💰 Solicitar Pagamento</h2>

      <div className="form-group">
        <label className="form-label">Projeto:</label>
        <select
          className="form-input"
          value={projetoSelecionado?.id || ""}
          onChange={(e) => {
            const projeto = projetos.find(
              (p) => p.id === Number(e.target.value)
            );
            setProjetoSelecionado(projeto || null);
            setRubricaSelecionada(null);
          }}
        >
          <option value="">Selecione um projeto</option>
          {projetos
            .filter((p) => p.status === "em andamento")
            .map((projeto) => (
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
            className="form-input"
            value={rubricaSelecionada?.id || ""}
            onChange={(e) => {
              const rubrica = projetoSelecionado.rubricas.find(
                (r) => r.id === Number(e.target.value)
              );
              setRubricaSelecionada(rubrica || null);
            }}
          >
            <option value="">Selecione uma rubrica</option>
            {projetoSelecionado.rubricas.map((rubrica) => (
              <option key={rubrica.id} value={rubrica.id}>
                {rubrica.nome}
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
      </div>

      <div className="form-group">
        <label className="form-label">Descrição:</label>
        <textarea
          className="form-input"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
        ></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">Valor:</label>
        <ValorInput valor={valor} setValor={setValor} />
      </div>

      <button className="button-full" onClick={handleRequestPayment}>
        Enviar Solicitação
      </button>
      <button className="button-secondary-full" onClick={() => navigate(-1)}>
        ⬅️ Voltar
      </button>
    </div>
  );
}
