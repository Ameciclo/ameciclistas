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

  // Sem DDD: Telefone fixo (8 dígitos)
  if (onlyDigits.length === 8) {
    return onlyDigits.replace(/(\d{4})(\d{4})/, "$1-$2");
  }

  // Sem DDD: Telefone móvel (9 dígitos)
  if (onlyDigits.length === 9) {
    return onlyDigits.replace(/(\d{5})(\d{4})/, "$1-$2");
  }

  // Com DDD: Telefone fixo (10 dígitos: 2 do DDD + 8 do número)
  if (onlyDigits.length === 10) {
    return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(
      2,
      6
    )}-${onlyDigits.slice(6)}`;
  }

  // Com DDD: Telefone móvel (11 dígitos: 2 do DDD + 9 do número)
  if (onlyDigits.length === 11) {
    return `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(
      2,
      7
    )}-${onlyDigits.slice(7)}`;
  }

  // Formatação para números internacionais (mais de 11 dígitos)
  if (onlyDigits.length > 11) {
    const countryCode = onlyDigits.slice(0, onlyDigits.length - 10);
    const ddd = onlyDigits.slice(onlyDigits.length - 10, onlyDigits.length - 8);
    const numberPart = onlyDigits.slice(onlyDigits.length - 8);
    return `+${countryCode} (${ddd}) ${numberPart.slice(
      0,
      4
    )}-${numberPart.slice(4)}`;
  }

  return phone;
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

export const formatDate = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
  timeStyle: "medium",
});

export function formatDateToISO(
  dateString: string,
  timeString: string
): string {
  // Criando a data no fuso local (assumindo que o servidor roda em UTC)
  const date = new Date(`${dateString}T${timeString}:00-03:00`); // Define UTC-3 diretamente

  return date.toISOString(); // Retorna no formato ISO
}

export const formatCurrencyToReal = (value: string) => {
  const cleanedValue = value.replace(/\D/g, "");

  const formattedValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(cleanedValue) / 100);

  return formattedValue;
};
