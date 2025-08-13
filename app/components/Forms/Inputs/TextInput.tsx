import React from "react";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  name,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-input"
      />
    </div>
  );
};

export default TextInput;