import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getTelegramUserInfo } from "../api/users";
import { UserCategory, UserData } from "~/api/types";
import { Agenda } from "../api/types"; // Importe a interface Agenda
import { isAuth } from "~/hooks/isAuthorized";
import Unauthorized from "~/components/Unauthorized";
import { loader } from "../loaders/solicitar-pagamento-loader";
export { loader }

export default function CriarEvento() {
  const { userCategoriesObject, currentUserCategories } = useLoaderData<typeof loader>();
  const [userPermissions, setUserPermissions] = useState(currentUserCategories)
  const [userInfo, setUserInfo] = useState<UserData | null>({} as UserData)

  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [duracao, setDuracao] = useState("");
  const [descricao, setDescricao] = useState("");
  const [agenda, setAgenda] = useState("");
  const [agendas, setAgendas] = useState<Agenda[]>([]);

  useEffect(() => setUserInfo(() => getTelegramUserInfo()), []);

  useEffect(() => {
    if (userInfo?.id && userCategoriesObject[userInfo.id]) {
      setUserPermissions([userCategoriesObject[userInfo.id] as any]);
    }
  }, [userInfo])

  useEffect(() => {
    // Carregar as agendas do calendars.json
    fetch("/app/mockup/calendars.json")
      .then((response) => response.json())
      .then((data) => setAgendas(data)) // Ajustado para a nova estrutura
      .catch((error) => {
        console.error("Error loading calendars:", error);
      });
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
    }
  };

  return isAuth(userPermissions, UserCategory.AMECICLISTAS) ? (
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
            <option key={index} value={ag.name}>
              {ag.name}
            </option>
          ))}
        </select>
      </div>
      <button className="button-full" onClick={handleSubmit}>
        Criar Evento
      </button>
    </div>
  ) : <Unauthorized pageName="Calendario" requiredPermission="Ameciclista" />
}