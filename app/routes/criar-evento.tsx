import { useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";

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
    const telegram = (window as any)?.Telegram?.WebApp;
    const userId = telegram?.initDataUnsafe?.user?.id;
  
    if (!userId) {
      console.error('User ID is undefined. Closing the app.');
      telegram?.close();
      return;
    }
  
    const allowedUserIds = [157783985];
    if (!allowedUserIds.includes(userId)) {
      console.error('User is not allowed. Closing the app.');
      telegram?.close();
    }
  }, []);
  

  const handleSubmit = () => {
    try {
      const eventoData = {
        titulo,
        data,
        hora,
        duracao,
        descricao,
        agenda,
      };

      const telegram = (window as any)?.Telegram?.WebApp;
      telegram?.sendData(JSON.stringify(eventoData));
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      // Adicione uma mensagem de erro ao usuário, se desejado
    }
  };

  return (
    <div className="container">
      <h2 className="text-primary">📅 Criar Evento</h2>

      <div className="form-group">
        <label className="form-label">Título do Evento:</label>
        <input
          className="form-input"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Data:</label>
        <input
          className="form-input"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Hora:</label>
        <input
          className="form-input"
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Duração (em horas):</label>
        <input
          className="form-input"
          type="number"
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          min="0"
          step="0.5"
          placeholder="Ex: 1.5"
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
        <label className="form-label">Agenda:</label>
        <select
          className="form-input"
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

      <button className="button-full" onClick={handleSubmit}>
        Criar Evento
      </button>
      <button className="button-secondary-full" onClick={() => navigate(-1)}>
        ⬅️ Voltar
      </button>
    </div>
  );
}
