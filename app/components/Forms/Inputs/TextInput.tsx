import React from "react";

interface TextInputProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        type="text"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default TextInput;
