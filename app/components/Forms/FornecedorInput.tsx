// components/SolicitarPagamento/FornecedorInput.tsx
import React from "react";
import FornecedorAutocomplete from "~/components/Forms/FornecedorAutocomplete";

interface FornecedorInputProps {
  fornecedores: any[];
  fornecedor: string;
  setFornecedor: React.Dispatch<React.SetStateAction<string>>;
}

const FornecedorInput: React.FC<FornecedorInputProps> = ({
  fornecedores,
  fornecedor,
  setFornecedor,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Fornecedor:</label>
      <FornecedorAutocomplete
        fornecedores={fornecedores}
        value={fornecedor}
        onChange={setFornecedor}
      />
      <input type="hidden" name="fornecedor" value={fornecedor} />
    </div>
  );
};

export default FornecedorInput;
