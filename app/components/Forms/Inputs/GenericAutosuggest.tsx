// components/Forms/Inputs/GenericAutosuggest.tsx
import { useState } from "react";
import Autosuggest from "react-autosuggest";

export interface GenericAutosuggestProps<T> {
  /** Título ou rótulo do campo */
  title?: string;
  /** Lista de itens onde será realizada a busca */
  items: T[];
  /** Valor atual do input */
  value: string;
  /** Callback para atualizar o valor digitado */
  onChange: (value: string) => void;
  /**
   * Função que, dado um item, retorna uma string que representa seu valor.
   * Esse valor será usado internamente (por exemplo, para preencher o input ao selecionar).
   */
  getItemValue: (item: T) => string;
  /**
   * Função que, dado um item, retorna a string que será exibida para o usuário.
   */
  getItemLabel: (item: T) => string;
  /**
   * (Opcional) Função para filtrar os itens com base na query digitada.
   * Se não for fornecida, o filtro padrão verifica se o rótulo contém a query (case insensitive).
   */
  filterFunction?: (item: T, query: string) => boolean;
  /** Placeholder do input */
  placeholder?: string;
  /** Classe CSS para o input */
  inputClassName?: string;
  /** Classe CSS para o container do componente */
  containerClassName?: string;
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
}: GenericAutosuggestProps<T>) => {
  const [suggestions, setSuggestions] = useState<T[]>([]);

  // Função padrão de filtro: usa o rótulo (getItemLabel) e compara de forma case insensitive.
  const defaultFilterFunction = (item: T, query: string) =>
    getItemLabel(item).toLowerCase().includes(query.toLowerCase());

  // Se o usuário passar uma função de filtro customizada, ela será utilizada.
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

  // Quando uma sugestão é selecionada, usamos a função getItemValue para preencher o input.
  const getSuggestionValue = (suggestion: T) => getItemValue(suggestion);

  // Renderiza cada sugestão na lista.
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
