// components/FormSelect.tsx
import React from "react";

interface FormSelectProps<T> {
  label: string;
  name: string;
  options: T[];
  value: string | null;
  onChange: (value: string) => void;
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
}

export const FormSelect = <T,>({
  label,
  name,
  options,
  value,
  onChange,
  getOptionValue,
  getOptionLabel,
}: FormSelectProps<T>) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}:</label>
      <select
        name={name}
        className="form-input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Selecione uma opção</option>
        {options.map((option, index) => (
          <option key={index} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
};
