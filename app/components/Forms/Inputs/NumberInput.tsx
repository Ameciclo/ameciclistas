import React from "react";

interface NumberInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string | number;
  step?: string | number;
  placeholder?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  type = "text",
  value,
  onChange,
  min,
  step,
  placeholder,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        placeholder={placeholder}
      />
    </div>
  );
};

export default NumberInput;
