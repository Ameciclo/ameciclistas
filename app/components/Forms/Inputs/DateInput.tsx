import React from "react";

interface DateInputProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">Hora: </label>
      <input
        className="form-input"
        type="date"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default DateInput;
