// components/SolicitarPagamento/DescricaoInput.tsx
import React from "react";

interface DescricaoInputProps {
  descricao: string;
  setDescricao: React.Dispatch<React.SetStateAction<string>>;
}

const DescricaoInput: React.FC<DescricaoInputProps> = ({
  descricao,
  setDescricao,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Descrição:</label>
      <textarea
        name="descricao"
        className="form-input"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        rows={4}
      ></textarea>
    </div>
  );
};

export default DescricaoInput;
