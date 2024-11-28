import React from "react";

interface TextInputProps {
  label: string; // O rótulo do campo
  value: string; // O valor atual do campo
  onChange: (value: string) => void; // Callback para atualizar o estado
  placeholder?: string; // Placeholder opcional
  name: string; // Nome do campo (para o envio no formulário)
  rows?: number; // Número inicial de linhas
  autoResize?: boolean; // Se o campo deve ajustar automaticamente o tamanho
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  name,
  rows = 3,
  autoResize = true,
}) => {
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = "auto"; // Redefine a altura para calcular novamente
      e.target.style.height = `${e.target.scrollHeight}px`; // Define a altura de acordo com o conteúdo
    }
    onChange(e.target.value);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}:</label>
      <textarea
        name={name}
        className="form-input"
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        rows={rows} // Número inicial de linhas
        style={autoResize ? { overflow: "hidden" } : undefined} // Esconde barras de rolagem se autoResize estiver ativado
      />
    </div>
  );
};

export default TextInput;
