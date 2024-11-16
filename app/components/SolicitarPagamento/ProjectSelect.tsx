// components/SolicitarPagamento/ProjectSelect.tsx
import React from "react";
import { Project } from "~/api/types";

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
        value={projetoSelecionado?.id || ""}
        onChange={(e) => {
          const projeto = projetos.find(
            (p) => p.id === Number(e.target.value)
          );
          setProjetoSelecionado(projeto || null);
          setRubricaSelecionada(null);
        }}
      >
        <option value="">Selecione um projeto</option>
        {projetos.map((projeto) => (
          <option key={projeto.id} value={projeto.id}>
            {projeto.nome}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ProjectSelect;
