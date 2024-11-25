// components/SolicitarPagamento/RubricaSelect.tsx
import React from "react";
import { Project } from "~/api/types";

interface RubricaSelectProps {
  projetoSelecionado: Project;
  rubricaSelecionada: string | null;
  setRubricaSelecionada: React.Dispatch<React.SetStateAction<string | null>>;
}

const RubricaSelect: React.FC<RubricaSelectProps> = ({
  projetoSelecionado,
  rubricaSelecionada,
  setRubricaSelecionada,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Rubrica:</label>
      <select
        name="rubrica"
        className="form-input"
        value={rubricaSelecionada || ""}
        onChange={(e) => setRubricaSelecionada(e.target.value)}
      >
        <option value="">Selecione uma rubrica</option>
        {projetoSelecionado.budget_items.map((rubrica) => (
          <option key={rubrica} value={rubrica}>
            {rubrica}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RubricaSelect;
