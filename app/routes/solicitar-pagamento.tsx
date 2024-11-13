import { useState, useEffect } from "react";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import ValorInput from "~/components/ValorInput";
import FornecedorAutocomplete from "~/components/FornecedorAutocomplete";
import Unauthorized from "~/components/Unauthorized";
import { getProjects } from "../api/firebaseConnection";

export async function loader() {
  const data = await getProjects();
  return json(data);
}

export default function SolicitarPagamento() {
  const data = useLoaderData<typeof loader>();
  console.log(data)
  const navigate = useNavigate();
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [projectsNames, setProjectsNames] = useState(
    Object.values(data).map((item: any) => item?.name)
  );
  const [fornecedores, setFornecedores] = useState<any[]>([]);

  return (
    <div className="container">
      <h2 className="text-primary"> Solicitar Pagamento</h2>
      <div className="form-group">
        <label className="form-label">Projeto:</label>
        <select name="projects">
          {projectsNames.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </select>
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
      <button className="button-full" onClick={() => console.log(projectsNames)}>
        Enviar Solicitação
      </button>
      <button className="button-secondary-full" onClick={() => navigate(-1)}>
        ⬅️ Voltar
      </button>
    </div>
  );
}