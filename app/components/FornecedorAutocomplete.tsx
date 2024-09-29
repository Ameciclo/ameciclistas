// app/components/FornecedorAutocomplete.tsx

import React, { useState } from "react";
import Autosuggest from "react-autosuggest";

interface Fornecedor {
  label: string;
  value: string;
}

interface Props {
  fornecedores: Fornecedor[];
  value: string;
  onChange: (value: string) => void;
}

const FornecedorAutocomplete: React.FC<Props> = ({ fornecedores, value, onChange }) => {
  const [suggestions, setSuggestions] = useState<Fornecedor[]>([]);

  const getSuggestions = (inputValue: string) => {
    const lowercasedInput = inputValue.toLowerCase();
    return fornecedores.filter(fornecedor =>
      fornecedor.label.toLowerCase().includes(lowercasedInput)
    );
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: Fornecedor) => suggestion.label;

  const renderSuggestion = (suggestion: Fornecedor) => <div>{suggestion.label}</div>;

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
        placeholder: "Digite o nome do fornecedor"
      }}
    />
  );
};

export default FornecedorAutocomplete;
