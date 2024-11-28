import React from "react";
import { ButtonItem } from "~/utils/types";

const Button: React.FC<ButtonItem> = ({ label, onClick, type = "primary", disabled = false }) => {
  const baseClass = "button-full"; // Classe base para todos os botões
  const typeClass = type === "primary" ? "button-primary" : "button-secondary"; // Classe específica do tipo

  return (
    <button
      className={`${baseClass} ${typeClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
