import React, { useState } from "react";
import Autosuggest from "react-autosuggest";

interface AutoCompleteInputProps<T> {
  label: string; // Rótulo do campo
  options: T[]; // Lista de opções para o autocomplete
  value: string; // Valor selecionado
  onChange: (value: string) => void; // Função para atualizar o valor selecionado
  name: string; // Nome do campo (para uso no formulário)
  placeholder?: string; // Placeholder opcional
  getOptionLabel: (option: T) => string; // Como exibir as opções
}

const AutoCompleteInput = <T,>({
  label,
  options,
  value,
  onChange,
  name,
  placeholder = "Digite algo",
  getOptionLabel,
}: AutoCompleteInputProps<T>) => {
  const [suggestions, setSuggestions] = useState<T[]>([]);

  const getSuggestions = (inputValue: string) => {
    const lowercasedInput = inputValue.toLowerCase();
    return options
      .filter((option) =>
        getOptionLabel(option).toLowerCase().includes(lowercasedInput)
      )
      .slice(0, 5); // Limitar a 5 sugestões
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: T) => getOptionLabel(suggestion);

  const renderSuggestion = (suggestion: T) => (
    <div style={{ cursor: "pointer" }}>
      <span>➕ </span>
      {getOptionLabel(suggestion)}
    </div>
  );

  return (
    <div className="form-group">
      <label className="form-label">{label}:</label>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={{
          value,
          onChange: (_event, { newValue }) => onChange(newValue),
          placeholder,
          className: "form-input", // Classe padrão para estilização
        }}
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
};

export default AutoCompleteInput;
