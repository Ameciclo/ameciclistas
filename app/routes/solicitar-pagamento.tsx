import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import ValorInput from "~/components/ValorInput";
import FornecedorAutocomplete from "~/components/FornecedorAutocomplete";
import Unauthorized from "~/components/Unauthorized";
import { getProjects } from "../api/firebaseConnection";

export default function SolicitarPagamento() {
  const navigate = useNavigate();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [projetos, setProjetos] = useState([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data =  await getProjects();
        setProjetos(data);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="container">
      <h2 className="text-primary"> Solicitar Pagamento</h2>
      <div className="form-group">
        <label className="form-label">Projeto:</label>
        {/* Renderizar projetos aqui based on fetched data in 'projetos' */}
      </div>
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
      <button className="button-full" onClick={() => console.log(projetos)}>
        Enviar Solicitação
      </button>
      <button className="button-secondary-full" onClick={() => navigate(-1)}>
        ⬅️ Voltar
      </button>
    </div>
  );
}