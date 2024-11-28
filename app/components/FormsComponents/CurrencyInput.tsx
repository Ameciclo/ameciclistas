import React from "react";

interface CurrencyInputProps {
  label?: string; // Rótulo do campo
  valor: string; // Valor armazenado (somente números)
  setValor: (value: string) => void; // Função para atualizar o valor
  name: string; // Nome do campo (para envio no formulário)
  currencySymbol?: string; // Símbolo da moeda, padrão "R$"
  placeholder?: string; // Placeholder opcional
  className?: string; // Classe adicional para estilização
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  valor,
  setValor,
  name,
  currencySymbol = "R$",
  placeholder = "0,00",
  className = "",
}) => {
  const formatarValor = (value: string) => {
    // Remove tudo que não for número
    const cleanedValue = value.replace(/\D/g, "");

    // Formatar para padrão monetário brasileiro (R$ 0.000,00)
    const formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(parseFloat(cleanedValue) / 100);

    // Retorna o valor formatado com o símbolo
    return `${currencySymbol} ${formattedValue.replace(/^R\$/, "").trim()}`;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // Remove formatação antes de armazenar o valor no estado
    const numericValue = inputValue.replace(/\D/g, ""); // Remove tudo o que não for número
    setValor(numericValue); // Atualiza o estado com o valor numérico
  };

  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <input
        type="text"
        name={name}
        value={formatarValor(valor)} // Mostra o valor formatado no input
        onChange={handleChange}
        placeholder={`${currencySymbol} ${placeholder}`} // Placeholder com o símbolo da moeda
        className="form-input"
      />
    </div>
  );
};

export default CurrencyInput;
