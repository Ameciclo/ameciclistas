import { json } from "@remix-run/node";

/**
 * Faz o parse de uma string JSON e retorna o objeto correspondente.
 * @param rawValue - O valor bruto a ser parseado.
 * @param fieldName - O nome do campo (para mensagens de erro).
 * @returns O objeto parseado ou null se o valor for vazio.
 * @throws Retorna um erro JSON com status 400 em caso de erro no parse.
 */
export function parseJSONField<T>(rawValue: FormDataEntryValue | null, fieldName: string): T | null {
  try {
    if (!rawValue) return null;
    return JSON.parse(rawValue as string) as T;
  } catch (error) {
    console.error(`Erro ao fazer parse do campo '${fieldName}':`, error);
    throw json(
      { error: `Erro ao processar os dados do campo '${fieldName}'.` },
      { status: 400 }
    );
  }
}
