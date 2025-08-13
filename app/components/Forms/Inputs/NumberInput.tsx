import React from "react";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  name?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  name,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    if (newValue >= min && (!max || newValue <= max)) {
      onChange(newValue);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        className="form-input"
      />
    </div>
  );
};

export default NumberInput;