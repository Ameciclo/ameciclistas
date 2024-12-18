import React from "react";

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options }) => {
  return (
    <div className="form-group">
      <label className="font-bold">{label}</label>
      <select className="form-input" value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

  );
};

export default SelectInput;
