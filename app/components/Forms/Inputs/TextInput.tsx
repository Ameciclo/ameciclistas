import React from "react";

interface TextInputProps {
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string | number;
  step?: string | number;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  type = "text",
  value,
  onChange,
  min,
  step,
  placeholder,
}) => {
  return (
    <input
      className="form-input"
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      step={step}
      placeholder={placeholder}
    />
  );
};

export default TextInput;
