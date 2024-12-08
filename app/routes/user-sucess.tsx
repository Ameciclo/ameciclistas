// routes/sucesso.tsx
import { Link, useNavigate } from "@remix-run/react";

export default function Sucesso() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2 className="text-primary">✅ Usuário registrado com sucesso!</h2>
      <p>Agora você tem acesso a outros botoes na página principal</p>

      <div className="button-group">
        <br />
        <br />
        <Link to="/" className="mt-4">
          <button className="button-secondary-full">
            ⬅️ Voltar
          </button>
        </Link>
      </div>
    </div>
  );
}
