// routes/sucesso.tsx
import { Link } from "@remix-run/react";

export default function Sucesso() {
  return (
    <div className="container">
      <h2 className="text-primary">✅ Solicitação Enviada com Sucesso!</h2>
      <p>A sua solicitação de pagamento foi processada e está em andamento.</p>

      <div className="button-group">
        <br />
        <br />
        <Link to="/solicitar-pagamento">
          <button className="button-full">💰 Solicitar Pagamento</button>
        </Link>
        <Link to="/adicionar-fornecedor">
          <button className="button-full">📦 Adicionar Fornecedor</button>
        </Link>
        <Link to="/" className="mt-4">
          <button className="button-secondary-full">⬅️ Voltar</button>
        </Link>
      </div>
    </div>
  );
}
