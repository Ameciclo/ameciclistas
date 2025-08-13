import { Link } from "@remix-run/react";
import { BackButton } from "~/components/Forms/Buttons";

export default function SucessoEditarFornecedor() {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">✅ Fornecedor Editado com Sucesso!</h1>
      <p className="mb-6">As alterações do fornecedor foram salvas com sucesso.</p>
      
      <div className="space-y-4">
        <Link to="/adicionar-fornecedor">
          <button className="button-full">
            📝 Editar Outro Fornecedor
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