// routes/sucesso.tsx
import { Link, useNavigate } from "@remix-run/react";

export default function Sucesso() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h2 className="text-primary ">✅ Fornecedor adicionado com sucesso!</h2>

      <div className="button-group">
        <br />
        <br />
        <button
          className="button-full"
          onClick={() => navigate("/adicionar-fornecedor")}
        >
          Adicionar Novo Fornecedor
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
