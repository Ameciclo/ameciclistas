import React from "react";

interface HourInputProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const HourInput: React.FC<HourInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Hora: </label>
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
