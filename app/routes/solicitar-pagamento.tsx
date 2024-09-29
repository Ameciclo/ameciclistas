import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import ValorInput from '~/components/ValorInput';
import FornecedorAutocomplete from "~/components/FornecedorAutocomplete";

interface Projeto {
  id: number;
  nome: string;
  status: string;
  rubricas: Rubrica[];
}

interface Rubrica {
  id: number;
  nome: string;
}

const projetosMock: Projeto[] = [
  {
    id: 1,
    nome: "Projeto A",
    status: "em andamento",
    rubricas: [{ id: 1, nome: "Rubrica A1" }, { id: 2, nome: "Rubrica A2" }],
  },
  {
    id: 2,
    nome: "Projeto B",
    status: "concluído",
    rubricas: [{ id: 3, nome: "Rubrica B1" }, { id: 4, nome: "Rubrica B2" }],
  },
];

const fornecedoresMock = [
  { label: "Fornecedor X", value: "Fornecedor X" },
  { label: "Fornecedor Y", value: "Fornecedor Y" },
];

export default function SolicitarPagamento() {
  const navigate = useNavigate();
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);
  const [rubricaSelecionada, setRubricaSelecionada] = useState<Rubrica | null>(null);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [fornecedor, setFornecedor] = useState("");

  const projetosEmAndamento = projetosMock.filter((p) => p.status === "em andamento");

  useEffect(() => {
    const telegram = (window as any).Telegram.WebApp;
    const userId = telegram.initDataUnsafe.user?.id;
    const allowedUserIds = [123456789, 987654321];

    if (!allowedUserIds.includes(userId)) {
      telegram.close();
    }
  }, []);

  const handleSubmit = () => {
    const data = {
      projeto: projetoSelecionado?.nome,
      rubrica: rubricaSelecionada?.nome,
      fornecedor,
      descricao,
      valor,
    };

    const telegram = (window as any).Telegram.WebApp;
    telegram.sendData(JSON.stringify(data));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600">💰 Solicitar Pagamento</h2>

      <div className="form-group mb-4">
        <label className="font-bold">Projeto:</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={projetoSelecionado?.id || ""}
          onChange={(e) => {
            const projeto = projetosEmAndamento.find((p) => p.id === Number(e.target.value));
            setProjetoSelecionado(projeto || null);
            setRubricaSelecionada(null);
          }}
        >
          <option value="">Selecione um projeto</option>
          {projetosEmAndamento.map((projeto) => (
            <option key={projeto.id} value={projeto.id}>
              {projeto.nome}
            </option>
          ))}
        </select>
      </div>

      {projetoSelecionado && (
        <div className="form-group mb-4">
          <label className="font-bold">Rubrica:</label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
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

      <div className="form-group mb-4">
        <label className="font-bold">Fornecedor:</label>
        <FornecedorAutocomplete
          fornecedores={fornecedoresMock}
          value={fornecedor}
          onChange={setFornecedor}
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Descrição:</label>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
        ></textarea>
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Valor:</label>
        <ValorInput valor={valor} setValor={setValor} />
      </div>

      <button
        className="bg-teal-600 text-white p-3 rounded-md hover:bg-teal-700"
        onClick={handleSubmit}
      >
        Enviar Solicitação
      </button>
      <button
        className="bg-gray-600 text-white p-3 rounded-md ml-2 hover:bg-gray-700"
        onClick={() => navigate(-1)}
      >
        ⬅️ Voltar
      </button>
    </div>
  );
}
