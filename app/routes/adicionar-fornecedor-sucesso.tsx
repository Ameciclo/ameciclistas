// routes/sucesso.tsx
import { useNavigate } from "@remix-run/react";

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
