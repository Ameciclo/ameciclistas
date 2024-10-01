import React, { useState } from "react";
import Autosuggest from "react-autosuggest";
import { Supplier } from "~/api/types";

interface Props {
  fornecedores: Supplier[];
  value: string;
  onChange: (value: string) => void;
}

const FornecedorAutocomplete: React.FC<Props> = ({ fornecedores, value, onChange }) => {
  const [suggestions, setSuggestions] = useState<Supplier[]>([]);

  const getSuggestions = (inputValue: string) => {
    const lowercasedInput = inputValue.toLowerCase();
    return fornecedores.filter(fornecedor =>
      fornecedor.nome.toLowerCase().includes(lowercasedInput)
    );
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: Supplier) => suggestion.nome;

  const renderSuggestion = (suggestion: Supplier) => <div>{suggestion.nome}</div>;

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
