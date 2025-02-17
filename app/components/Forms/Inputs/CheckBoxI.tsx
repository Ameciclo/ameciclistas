// components/Forms/Inputs/Checkbox.tsx
import React from "react";

interface CheckboxProps {
  /** Rótulo exibido ao lado do checkbox */
  label: string;
  /** Valor booleano que indica se está marcado */
  checked: boolean;
  /** Função chamada quando o checkbox é alterado */
  onChange: (checked: boolean) => void;
  /** Classe CSS opcional para customização */
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  className = "",
}) => {
  return (
    <div className={`form-group ${className}`}>
      <label className="form-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />{" "}
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
