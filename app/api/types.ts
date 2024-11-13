export interface Agenda {
  name: string | number | readonly string[] | undefined;
}

export interface Supplier {
  id: number;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  chavePix: string;
  tipoChavePix: string;
}

export interface Budget {
  nome: string;
}

export interface Project {
  id: number;
  nome: string;
  status: string;
  rubricas: string[];
}
