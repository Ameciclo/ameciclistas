import React from "react";
import { Project } from "~/utils/types";

interface BudgetItemsSelectProps {
  selectedProject: Project;
  selectedBudgetItem: string | null;
  setBudgetItem: React.Dispatch<React.SetStateAction<string | null>>;
}

const BudgetItemSelector: React.FC<BudgetItemsSelectProps> = ({
  selectedProject,
  selectedBudgetItem,
  setBudgetItem,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Rubrica:</label>
      <select
        name="budget_item"
        className="form-input"
        value={selectedBudgetItem || ""}
        onChange={(e) => setBudgetItem(e.target.value)}
      >
        <option value="">Selecione uma rubrica</option>
        {selectedProject.budget_items
          .sort((a, b) => a.localeCompare(b))
          .map((budget_item) => (
            <option key={budget_item} value={budget_item}>
              {budget_item}
            </option>
          ))}
      </select>
    </div>
  );
};

export default BudgetItemSelector;
