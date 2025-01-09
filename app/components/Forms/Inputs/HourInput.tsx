import React from "react";

interface HourInputProps {
  value: string | number;
  label?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const HourInput: React.FC<HourInputProps> = ({
  value,
  label,
  onChange,
}) => {
  const textLabel = label ? label : "Hora:";
  return (
    <div className="form-group">
      <label className="form-label">{textLabel}</label>
      <input
        className="form-input"
        type="time"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default HourInput;
