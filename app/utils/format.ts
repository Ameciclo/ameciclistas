export const parseFormattedValue = (formattedValue: string): number => {
  return parseFloat(
    formattedValue.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
  );
};

// Formatação de CPF
export const formatCPF = (cpf: string): string => {
  const onlyDigits = cpf.replace(/\D/g, "");
  return onlyDigits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{2})$/, "$1-$2");
};

// Formatação de CNPJ
export const formatCNPJ = (cnpj: string): string => {
  const onlyDigits = cnpj.replace(/\D/g, "");
  return onlyDigits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

// Formatação de Telefone
export const formatPhone = (phone: string): string => {
  const onlyDigits = phone.replace(/\D/g, "");
  if (onlyDigits.length <= 8) {
    return onlyDigits.replace(/(\d{4})(\d)/, "$1-$2");
  } else if (onlyDigits.length === 9) {
    return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(
      2,
      7
    )}-${onlyDigits.slice(7)}`;
  } else if (onlyDigits.length === 10) {
    return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(
      2,
      6
    )}-${onlyDigits.slice(6)}`;
  } else {
    return `+${onlyDigits.slice(0, -10)} (${onlyDigits.slice(
      -10,
      -8
    )}) ${onlyDigits.slice(-8, -4)}-${onlyDigits.slice(-4)}`;
  }
};
// Formatação de Email (simplificada)
export const formatEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const formatIdNumber = (personType: string, value: string): string => {
  if (personType === "fisica") {
    return formatCPF(value.toString());
  } else if (personType === "juridica") {
    return formatCNPJ(value.toString());
  } else {
    return "";
  }
};