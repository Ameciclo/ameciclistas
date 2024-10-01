import { useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getUserCategories, UserCategory } from "../api/users";
import { Agenda } from "../api/types"; // Importe a interface Agenda

export default function CriarEvento() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [duracao, setDuracao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [agenda, setAgenda] = useState("");
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
          console.error("Error loading the user ID from devUserId.json:", error);
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

    // Carregar as agendas do calendars.json
    fetch("/app/api/calendars.json")
      .then((response) => response.json())
      .then((data) => setAgendas(data)) // Ajustado para a nova estrutura
      .catch((error) => {
        console.error("Error loading calendars:", error);
      });
  }, []);

  const checkPermissions = (userId: number) => {
    const userCategories = getUserCategories(userId);
    setIsAuthorized(userCategories.includes(UserCategory.AMECICLISTAS));
  };

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
    }
  };

  return (
    <div className="container">
      <h2 className="text-primary">📅 Criar Evento</h2>
      {isAuthorized ? (
        <>
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
                <option key={index} value={ag.name}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>
          <button className="button-full" onClick={handleSubmit}>
            Criar Evento
          </button>
        </>
      ) : (
        <>
          <p>Você não tem permissão para criar eventos.</p>
          <button
            className="button-full"
            onClick={() => (window.location.href = "https://www.ameciclo.org")}
          >
            Visite o Site da Ameciclo
          </button>
        </>
      )}
      <button className="button-secondary-full" onClick={() => navigate(-1)}>
        ⬅️ Voltar
      </button>
    </div>
  );
}