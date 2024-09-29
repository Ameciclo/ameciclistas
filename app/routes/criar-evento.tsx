import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";

export default function CriarEvento() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [duracao, setDuracao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [agenda, setAgenda] = useState("");

  const agendas = [
    "Eventos Internos",
    "Eventos Externos",
    "Divulgação de Eventos",
    "Organizacionais",
  ];

  useEffect(() => {
    const telegram = (window as any).Telegram.WebApp;
    const userId = telegram.initDataUnsafe.user?.id;
    const allowedUserIds = [123456789, 987654321];

    if (!allowedUserIds.includes(userId)) {
      telegram.close();
    }
  }, []);

  const handleSubmit = () => {
    const eventoData = {
      titulo,
      data,
      hora,
      duracao,
      descricao,
      agenda,
    };

    const telegram = (window as any).Telegram.WebApp;
    telegram.sendData(JSON.stringify(eventoData));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600">📅 Criar Evento</h2>

      <div className="form-group mb-4">
        <label className="font-bold">Título do Evento:</label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Data:</label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Hora:</label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
        />
      </div>

      <div className="form-group mb-4">
        <label className="font-bold">Duração (em horas):</label>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          type="number"
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          min="0"
          step="0.5"
          placeholder="Ex: 1.5"
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
        <label className="font-bold">Agenda:</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={agenda}
          onChange={(e) => setAgenda(e.target.value)}
        >
          <option value="">Selecione uma agenda</option>
          {agendas.map((ag, index) => (
            <option key={index} value={ag}>
              {ag}
            </option>
          ))}
        </select>
      </div>

      <button
        className="bg-teal-600 text-white p-3 rounded-md hover:bg-teal-700"
        onClick={handleSubmit}
      >
        Criar Evento
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
