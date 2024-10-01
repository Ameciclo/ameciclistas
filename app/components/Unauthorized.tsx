import React from "react";

interface UnauthorizedProps {
  pageName: string;
  requiredPermission: string;
}

const Unauthorized: React.FC<UnauthorizedProps> = ({ pageName, requiredPermission }) => {
  return (
    <div className="container">
      <p>Você não tem permissão para acessar a página {pageName}.</p>
      <p>Tipo de permissão necessária: {requiredPermission}</p>
      <button
        className="button-full"
        onClick={() => (window.location.href = "https://www.ameciclo.org")}
      >
        Visite o Site da Ameciclo
      </button>
    </div>
  );
};

export default Unauthorized;
