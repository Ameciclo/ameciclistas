import React from "react";

interface DateInputProps {
  value: string | number;
  label?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateInput: React.FC<DateInputProps> = ({
  value,
  label,
  onChange,
}) => {
  const textLabel = label ? label : "Data:"
  return (
    <div className="form-group">
      <label className="form-label">{textLabel}</label>
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
