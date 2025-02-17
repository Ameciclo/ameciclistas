// components/SolicitarPagamento/DescricaoInput.tsx
import React from "react";

interface LongTextInputProps {
  title: string;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
}

const LongTextInput: React.FC<LongTextInputProps> = ({
  title,
  text,
  setText,
}) => {
  return (
    <div className="form-group">
      <label className="form-label">{title}</label>
      <textarea
        name="description"
        className="form-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
      ></textarea>
    </div>
  );
};

export default LongTextInput;
