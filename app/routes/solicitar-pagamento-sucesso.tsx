// routes/sucesso.tsx
import { useNavigate } from "@remix-run/react";

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
        <button
          className="button-secondary-full"
          onClick={() => navigate(-1)} // Voltar à página anterior
        >
          ⬅️ Voltar
        </button>
      </div>
    </div>
  );
}
