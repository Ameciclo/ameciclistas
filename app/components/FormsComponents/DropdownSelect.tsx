import React from "react";

interface DropdownSelectProps<T> {
  label: string;
  options: T[];
  selectedValue: string | null;
  onChange: (value: string | null) => void;
  valueKey: keyof T; // Qual chave do objeto será usada como value
  labelKey: keyof T; // Qual chave do objeto será exibida como rótulo
  placeholder?: string; // Texto do placeholder
  name: string; // Nome do campo (para o envio no formulário)
}

const DropdownSelect = <T,>({
  label,
  options,
  selectedValue,
  onChange,
  valueKey,
  labelKey,
  placeholder = "Selecione uma opção",
  name,
}: DropdownSelectProps<T>) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}:</label>
      <select
        name={name} // Certifique-se de que o atributo `name` esteja presente
        className="form-input"
        value={selectedValue || ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option[valueKey] as string}>
            {option[labelKey] as string}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownSelect;
