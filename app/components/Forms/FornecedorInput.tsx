// components/SolicitarPagamento/FornecedorInput.tsx
import React from "react";
import SupplierAutocomplete from "~/components/Forms/SupplierAutocomplete";
import SendToAction from "../SendToAction";

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
      <SupplierAutocomplete
        fornecedores={fornecedores}
        value={fornecedor}
        onChange={setFornecedor}
      />
      <SendToAction fields={[{ name: "fornecedor", value: fornecedor }]} />
    </div>
  );
};

export default FornecedorInput;
