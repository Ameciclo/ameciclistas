import React from "react";

interface TextAreaInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ value, onChange, rows }) => {
  return (
    <textarea
      className="form-input"
      value={value}
      onChange={onChange}
      rows={rows}
    ></textarea>
  );
};

export default TextAreaInput;
