// components/SolicitarPagamento/ProjectSelect.tsx
import React from "react";
import { Project } from "~/utils/types";

interface ProjectSelectProps {
  projetos: Project[];
  projetoSelecionado: Project | null;
  setProjetoSelecionado: React.Dispatch<React.SetStateAction<Project | null>>;
  setRubricaSelecionada: React.Dispatch<React.SetStateAction<string | null>>;
}

const ProjectSelect: React.FC<ProjectSelectProps> = ({
  projetos,
  projetoSelecionado,
  setProjetoSelecionado,
  setRubricaSelecionada,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Projeto:</label>
      <select
        name="projeto"
        className="form-input"
        value={projetoSelecionado?.spreadsheet_id || ""}
        onChange={(e) => {
          const projeto = projetos.find(
            (p) => p.spreadsheet_id === e.target.value
          );
          setProjetoSelecionado(projeto || null);
          setRubricaSelecionada(null);
        }}
      >
        <option value="">Selecione um projeto</option>
        {
          projetos
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((projeto, index) => (
              <option key={index} value={projeto.spreadsheet_id}>
                {projeto.name}
              </option>
            ))
        }
      </select>
    </div>
  );
};

export default ProjectSelect;
