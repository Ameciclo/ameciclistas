// routes/sucesso.tsx
import { Link, useNavigate } from "@remix-run/react";

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
        <Link to="/" className="mt-4">
          <button className="button-secondary-full">
            ⬅️ Voltar
          </button>
        </Link>
      </div>
    </div>
  );
}
