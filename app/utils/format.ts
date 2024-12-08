export const parseFormattedValue = (formattedValue: string): number => {
  return parseFloat(
    formattedValue.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
  );
};
