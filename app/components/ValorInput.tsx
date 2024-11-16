import React from 'react';

interface ValorInputProps {
  valor: string;
  setValor: (value: string) => void;
  name: string;  // Adicionando o atributo name para garantir que o valor será enviado corretamente no formData
}

const ValorInput: React.FC<ValorInputProps> = ({ valor, setValor, name }) => {
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

    // Remove formatação antes de armazenar o valor no estado
    const numericValue = inputValue.replace(/\D/g, ''); // Remove tudo o que não for número
    setValor(numericValue);  // Atualiza o estado com o valor numérico
  };

  return (
    <input
      type="text"
      name={name}  // Adicionando o nome para enviar o valor com o formulário
      value={formatarValor(valor)}  // Mostra o valor formatado no input
      onChange={handleChange}
      placeholder="R$ 0,00"
    />
  );
};

export default ValorInput;
