// app/components/ValorInput.tsx

import React, { useState } from 'react';

interface ValorInputProps {
  valor: string;
  setValor: (value: string) => void;
}

const ValorInput: React.FC<ValorInputProps> = ({ valor, setValor }) => {
  const formatarValor = (value: string) => {
    // Remove tudo que não for número
    const cleanedValue = value.replace(/\D/g, '');
    
    // Formatar para padrão monetário brasileiro (R$ 0.000,00)
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(cleanedValue) / 100);

    return formattedValue;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setValor(formatarValor(inputValue));
  };

  return (
    <input
      type="text"
      value={valor}
      onChange={handleChange}
      placeholder="R$ 0,00"
    />
  );
};

export default ValorInput;