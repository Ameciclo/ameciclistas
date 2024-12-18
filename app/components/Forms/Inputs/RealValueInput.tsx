import React from 'react';
import { formatRealValue } from '~/utils/format';

interface ValorInputProps {
  valor: string;
  setValor: (value: string) => void;
  name: string;
}

const RealValueInput: React.FC<ValorInputProps> = ({ valor, setValor, name }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    const numericValue = inputValue.replace(/\D/g, '');
    setValor(numericValue);
  };

  return (
    <div className="form-group">
      <label className="form-label">Valor: </label>
      <input
        type="text"
        name={name}
        value={formatRealValue(valor)}
        onChange={handleChange}
        placeholder="R$ 0,00"
      />
    </div>
  );
};

export default RealValueInput;
