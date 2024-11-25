export interface Agenda {
  name: string | number | readonly string[] | undefined;
}

export interface Supplier {
  id: string; // Usando string porque os IDs do Firebase incluem letras e números
  nome: string; // Nome do fornecedor
  cpfCnpj: string; // Pode ser CPF ou CNPJ
  email?: string; // Nem todos os fornecedores têm email
  telefone?: string; // Nem todos têm telefone
  chavePix: string; // PIX
  tipoChavePix: string; // Tipo de chave PIX (cpf/cnpj, email, etc.)
}

export interface Budget {
  nome: string;
}

export interface Project {
    account: string;
    balance: number;
    budget_items: string[],
    name: string,
    responsible: string,
    spreadsheet_id: string
}
