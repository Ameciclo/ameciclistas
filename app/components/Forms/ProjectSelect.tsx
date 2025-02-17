// components/SolicitarPagamento/ProjectSelect.tsx
import React from "react";
import { Project } from "~/utils/types";

interface ProjectSelectProps {
  projects: Project[];
  selectedProject: Project | null;
  setProject: React.Dispatch<React.SetStateAction<Project | null>>;
  setBudgetItem: React.Dispatch<React.SetStateAction<string | null>>;
}

const ProjectSelector: React.FC<ProjectSelectProps> = ({
  projects,
  selectedProject,
  setProject,
  setBudgetItem,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Projeto:</label>
      <select
        name="project"
        className="form-input"
        value={selectedProject?.spreadsheet_id || ""}
        onChange={(e) => {
          const project = projects.find(
            (p) => p.spreadsheet_id === e.target.value
          );
          setProject(project || null);
          setBudgetItem(null);
        }}
      >
        <option value="">Selecione um projeto</option>
        {projects
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((project, index) => (
            <option key={index} value={project.spreadsheet_id}>
              {project.name}
            </option>
          ))}
      </select>
    </div>
  );
};

export default ProjectSelector;
