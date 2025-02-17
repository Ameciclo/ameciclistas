// components/SolicitarPagamento/FornecedorInput.tsx
// components/Forms/SupplierAutocomplete.tsx
import React, { useState } from "react";
import Autosuggest from "react-autosuggest";
import { Supplier } from "~/utils/types";
import SendToAction from "../SendToAction";

interface AutosuggestInputProps {
  suggestionsList: any[];
  suggestion: string;
  setSuggestion: React.Dispatch<React.SetStateAction<string>>;
}

interface Props {
  fornecedores: Supplier[];
  value: string;
  onChange: (value: string) => void;
}
const SupplierAutocomplete: React.FC<Props> = ({
  fornecedores,
  value,
  onChange,
}) => {
  const [suggestions, setSuggestions] = useState<Supplier[]>([]);

  const getSuggestions = (inputValue: string) => {
    const lowercasedInput = inputValue.toLowerCase();
    return fornecedores
      .filter(
        (fornecedor) =>
          fornecedor.name.toLowerCase().includes(lowercasedInput) ||
          (fornecedor.nickname &&
            fornecedor.nickname.toLowerCase().includes(lowercasedInput))
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
      {suggestion.nickname}
      {suggestion.name && ` (${suggestion.name})`}
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
        className: "form-input",
      }}
    />
  );
};

const AutosuggestInput: React.FC<AutosuggestInputProps> = ({
  suggestionsList,
  suggestion,
  setSuggestion,
}) => {
  return (
    <div className="form-group">
      <SupplierAutocomplete
        fornecedores={suggestionsList}
        value={suggestion}
        onChange={setSuggestion}
      />
      <SendToAction fields={[{ name: "fornecedor", value: suggestion }]} />
    </div>
  );
};

export default AutosuggestInput;
