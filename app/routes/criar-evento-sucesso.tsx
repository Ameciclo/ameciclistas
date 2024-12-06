// routes/sucesso.tsx
import { useNavigate } from "@remix-run/react";

export default function Sucesso() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2 className="text-primary">✅ Evento criado com sucesso!</h2>

      <div className="button-group">
        <br />
        <br />
        <button
          className="button-full"
          onClick={() => navigate("/criar-evento")}
        >
          Criar Novo Evento
        </button>
        <button
          className="button-secondary-full"
          onClick={() => navigate("/")}
        >
          ⬅️ Voltar
        </button>
      </div>
    </div>
  );
}
