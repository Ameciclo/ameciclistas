// routes/sucesso.tsx
import { useNavigate } from "@remix-run/react";

export default function Sucesso() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2 className="text-primary">✅ Usuário registrado com sucesso!</h2>
      <p>Agora você tem acesso a outros botoes na página principal</p>

      <div className="button-group">
        <br />
        <br />
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
