import React, { useState } from "react";
import Autosuggest from "react-autosuggest";
import { Supplier } from "~/utils/types";

interface Props {
  fornecedores: Supplier[];
  value: string;
  onChange: (value: string) => void;
}

const SupplierAutocomplete: React.FC<Props> = ({ fornecedores, value, onChange }) => {
  const [suggestions, setSuggestions] = useState<Supplier[]>([]);

  const getSuggestions = (inputValue: string) => {
    const lowercasedInput = inputValue.toLowerCase();
    // Limitar a 5 sugestões
    return fornecedores
      .filter(fornecedor =>
        fornecedor.name.toLowerCase().includes(lowercasedInput)
      )
      .slice(0, 5);
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: Supplier) => suggestion.name;

  const renderSuggestion = (suggestion: Supplier) => (
    <div style={{ cursor: "pointer" }}>
      <span>➕ </span>
      {suggestion.name}
    </div>
  );

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      inputProps={{
        value: value,
        onChange: (_event, { newValue }) => onChange(newValue),
        placeholder: "Digite o nome do fornecedor",
        className: "form-input", // Aplicando a mesma classe do input de data
      }}
    />
  );
};

export default SupplierAutocomplete;
