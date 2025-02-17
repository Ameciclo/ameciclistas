import React from "react";
import { formatCurrencyToReal } from "~/utils/format";

interface ValorInputProps {
  currencyValue: string;
  setCurrencyValue: (value: string) => void;
  name: string;
}

const CurrenyValueInput: React.FC<ValorInputProps> = ({
  name,
  currencyValue,
  setCurrencyValue,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    const numericValue = inputValue.replace(/\D/g, "");
    setCurrencyValue(numericValue);
  };

  return (
    <div className="form-group">
      <label className="form-label">Valor: </label>
      <input
        type="text"
        name={name}
        value={formatCurrencyToReal(currencyValue)}
        onChange={handleChange}
        placeholder="R$ 0,00"
      />
    </div>
  );
};

export default CurrenyValueInput;
