export interface Agenda {
  name: string | number | readonly string[] | undefined;
}

interface TypeValue {
  type: string;
  value: string;
}
export interface Supplier {
  id: string,
  id_number: string,
  name: string,
  nickname: string,
  address: string,
  contacts: TypeValue[],
  payment_methods: TypeValue[],
  type: string,
}

export interface BudgetItems {
  name: string;
}

export interface Project {
  account: string;
  balance: number;
  budget_items: string[],
  name: string,
  responsible: string,
  spreadsheet_id: string
}

export interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export enum UserCategory {
  ANY_USER = "ANY_USER", // Mudar para "ANY_USER" para refletir o nome
  AMECICLISTAS = "AMECICLISTAS",
  PROJECT_COORDINATORS = "PROJECT_COORDINATORS",
  AMECICLO_COORDINATORS = "AMECICLO_COORDINATORS",
  RESOURCES_COORDINATOR = "RESOURCES_COORDINATOR", // Para gerenciar recursos independentes
  DEVELOPMENT = "DEVELOPMENT",
}

export interface TelegramUser {
  id: number; // Telegram user ID
  name: string;
  categories: UserCategory[];
}

export { };

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        platform: string;
        initData: string;
        initDataUnsafe: Record<string, any>;
        themeParams: Record<string, string>;
        close: () => void;
        expand: () => void;
        isExpanded: boolean;
        MainButton: {
          setText: (text: string) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
        };
      };
    };
  }
}

export type Workgroup = {
  id: number;
  name: string;
  telegram_id: string;
  telegram_url: string;
  description: string;
  folder_url: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  directive: string;
  Links: Array<{
    id: number;
    title: string;
    link: string;
  }>;
  icon: {
    id: number;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
      small: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path: string | null;
        size: number;
        width: number;
        height: number;
        provider_metadata: {
          public_id: string;
          resource_type: string;
        };
      };
      thumbnail: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path: string | null;
        size: number;
        width: number;
        height: number;
        provider_metadata: {
          public_id: string;
          resource_type: string;
        };
      };
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: {
      public_id: string;
      resource_type: string;
    };
    created_at: string;
    updated_at: string;
  };
  projects: Array<{
    id: number;
    name: string;
    goal: string;
    endDate: string | null;
    description: string;
    startDate: string;
    status: string;
    bikeCulture: string;
    instArticulation: string;
    politicIncidence: string;
    slug: string;
    isHighlighted: boolean;
    created_at: string;
    updated_at: string;
    workgroup: number;
    coordinator: string | null;
    long_description: string;
    showTitle: boolean;
    Links: Array<{
      id: number;
      title: string;
      link: string;
    }>;
    steps: Array<{
      id: number;
      title: string;
      description: string;
      link: string;
      image: {
        id: number;
        name: string;
        alternativeText: string | null;
        caption: string | null;
        width: number;
        height: number;
        formats: {
          small: {
            ext: string;
            url: string;
            hash: string;
            mime: string;
            name: string;
            path: string | null;
            size: number;
            width: number;
            height: number;
            provider_metadata: {
              public_id: string;
              resource_type: string;
            };
          };
        };
      };
    }>;
  }>;
};

export interface GrupoTrabalho {
  id: number;
  nome: string;
  coordenacao: string | { id: number; name: string }[]; // Permite string ou array
  descricao: string;
  imagem: string;
  link: string;
  categoria: string;
}

// Tipos para Controle de Recursos Independentes
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string; // Ex: "P", "M", "G" para camisas ou "Azul", "Verde" para cores
  stock: number;
  price?: number; // Se diferente do produto principal
}

export enum ProductCategory {
  LIQUIDOS = "LIQUIDOS", // Cervejas
  CAMISAS = "CAMISAS",
  BROCHES = "BROCHES",
  PECAS_BICICLETA = "PECAS_BICICLETA",
  LIVROS = "LIVROS",
  SERVICOS = "SERVICOS"
}

export interface Sale {
  id: string;
  userId: number;
  userName: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  status: SaleStatus;
  createdAt: string;
  paidAt?: string;
  confirmedAt?: string;
  paymentProof?: string;
}

export enum SaleStatus {
  PENDING = "PENDING", // Registrado, aguardando pagamento
  PAID = "PAID", // Pago, aguardando confirmação
  CONFIRMED = "CONFIRMED", // Confirmado pela coordenação
  CANCELLED = "CANCELLED" // Cancelado
}

export interface Donation {
  id: string;
  userId: number;
  userName: string;
  value: number;
  description?: string;
  status: SaleStatus;
  createdAt: string;
  paidAt?: string;
  confirmedAt?: string;
  paymentProof?: string;
}