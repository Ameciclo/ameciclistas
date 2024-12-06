// routes/sucesso.tsx
import { Link, useNavigate } from "@remix-run/react";

export default function Sucesso() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2 className="text-primary">✅ Solicitação Enviada com Sucesso!</h2>
      <p>A sua solicitação de pagamento foi processada e está em andamento.</p>

      <div className="button-group">
        <br />
        <br />
        <button
          className="button-full"
          onClick={() => navigate("/solicitar-pagamento")}
        >
          Solicitar Novo Pagamento
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
