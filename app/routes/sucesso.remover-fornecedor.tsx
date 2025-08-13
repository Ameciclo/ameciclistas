import { Link } from "@remix-run/react";
import { BackButton } from "~/components/Forms/Buttons";

export default function SucessoRemoverFornecedor() {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">🗑️ Fornecedor Removido com Sucesso!</h1>
      <p className="mb-6">O fornecedor foi removido permanentemente do sistema.</p>
      
      <div className="space-y-4">
        <Link to="/adicionar-fornecedor">
          <button className="button-full">
            📦 Gerenciar Fornecedores
          </button>
        </Link>
        
        <Link to="/solicitar-pagamento">
          <button className="button-full">
            💰 Solicitar Pagamento
          </button>
        </Link>
        
        <BackButton />
      </div>
    </div>
  );
}