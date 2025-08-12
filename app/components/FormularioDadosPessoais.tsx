import { useState } from "react";
import { Form } from "@remix-run/react";

interface FormularioDadosPessoaisProps {
  onSubmit: (dados: { cpf: string; telefone: string }) => void;
  onCancel: () => void;
  dadosExistentes?: { cpf?: string; telefone?: string };
}

export function FormularioDadosPessoais({ onSubmit, onCancel, dadosExistentes }: FormularioDadosPessoaisProps) {
  const [cpf, setCpf] = useState(dadosExistentes?.cpf || "");
  const [telefone, setTelefone] = useState(dadosExistentes?.telefone || "");

  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cpf.trim() && !telefone.trim()) {
      alert("Por favor, preencha pelo menos um dos campos (CPF ou telefone)");
      return;
    }
    
    onSubmit({ cpf: cpf.trim(), telefone: telefone.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Dados Pessoais</h3>
        <p className="text-gray-600 mb-4">
          Para solicitar um livro, precisamos de pelo menos um contato (CPF ou telefone).
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <input
              type="text"
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(formatarCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              placeholder="(81) 99999-9999"
              maxLength={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Salvar e Solicitar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}