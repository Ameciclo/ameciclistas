// components/Forms/Inputs/GenericAutosuggest.tsx
import React, { useState } from "react";
import Autosuggest from "react-autosuggest";

export interface GenericAutosuggestProps<T> {
  title?: string;
  items: T[];
  value: string;
  onChange: (value: string) => void;
  getItemValue: (item: T) => string;
  getItemLabel: (item: T) => string;
  filterFunction?: (item: T, query: string) => boolean;
  placeholder?: string;
  inputClassName?: string;
  containerClassName?: string;
  onSuggestionSelected?: (
    event: React.FormEvent<any>,
    data: { suggestion: T }
  ) => void;
}

const GenericAutosuggest = <T,>({
  title,
  items,
  value,
  onChange,
  getItemValue,
  getItemLabel,
  filterFunction,
  placeholder = "Digite para pesquisar...",
  inputClassName = "form-input",
  containerClassName = "form-group",
  onSuggestionSelected,
}: GenericAutosuggestProps<T>) => {
  const [suggestions, setSuggestions] = useState<T[]>([]);

  const defaultFilterFunction = (item: T, query: string) =>
    getItemLabel(item).toLowerCase().includes(query.toLowerCase());

  const effectiveFilter = filterFunction || defaultFilterFunction;

  const getFilteredSuggestions = (inputValue: string): T[] => {
    const query = inputValue.trim();
    if (query.length === 0) return [];
    return items.filter((item) => effectiveFilter(item, query)).slice(0, 5);
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getFilteredSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: T) => getItemValue(suggestion);

  const renderSuggestion = (suggestion: T) => (
    <div style={{ cursor: "pointer" }}>➕ {getItemLabel(suggestion)}</div>
  );

  return (
    <div className={containerClassName}>
      {title && <label className="form-label">{title}</label>}
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={{
          value,
          onChange: (_event, { newValue }) => onChange(newValue),
          placeholder,
          className: inputClassName,
        }}
      />
    </div>
  );
};

export default GenericAutosuggest;
