// components/Forms/Inputs/SelectInput.tsx
import React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  className = "",
}) => {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`form-input ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
