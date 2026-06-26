# Plano de Implementação — Cadastro de Ameciclistas com LGPD

> **Objetivo:** garantir que CPF, e-mail e telefone continuem acessíveis à gestão autorizada, com acesso registrado, criptografia em repouso, separação entre dados de identidade, participação, pesquisa e consentimentos, e controle de exportações. O Google Contacts passa a ser espelho operacional, não base-mãe.

---

## 1. Arquitetura de Dados no Firebase Realtime Database

O Firebase Realtime Database é NoSQL (árvore JSON). A estrutura relacional proposta é adaptada para nós aninhados com chaves push do Firebase, preservando a capacidade de busca por índices derivados (HMACs) e mantendo rastreabilidade com `legacy_imports`.

```
subscribers/{telegramUserId}/
├── pessoa_id: string                # UUID v4 interno, invariável
├── name: string                     # nome social completo
├── nome_normalizado: string         # uppercase sem acentos, para busca
├── status: string                   # ativa | inativa | falecida | duplicada | descadastrada
├── data_primeiro_cadastro: string   # ISO 8601
├── data_ultima_atualizacao: string
│
├── identidade/
│   ├── cpf_hash: string             # HMAC-SHA256 do CPF numérico (para lookup sem descriptografar)
│   ├── cpf_cipher: string           # AES-256-GCM do CPF formatado (iv:authTag:ciphertext em base64)
│   ├── nome_completo: string
│   ├── data_nascimento: string
│   └── confianca: string            # alta | media | baixa
│
├── contatos/
│   ├── email/
│   │   ├── hash: string             # HMAC-SHA256 do email lowercase
│   │   ├── cipher: string           # AES-256-GCM
│   │   ├── principal: boolean
│   │   └── valido: boolean
│   ├── telefone/
│   │   ├── hash: string
│   │   ├── cipher: string
│   │   ├── principal: boolean
│   │   ├── whatsapp: boolean
│   │   └── valido: boolean
│   └── endereco/
│       ├── cipher: string           # AES-256-GCM
│       ├── bairro: string           # em plaintext (não sensível isoladamente)
│       └── cidade: string
│
├── associacao/
│   ├── status: string               # ativa | inativa | pendente
│   ├── data_inicio: string
│   ├── data_fim: string | null
│   ├── origem: string               # formulario_2013 | formulario_google | importacao_manual | formulario_site
│   └── observacoes: string
│
├── consentimentos/
│   ├── informativo/                 # { aceitou, data_hora, versao_texto }
│   ├── whatsapp/
│   ├── pesquisa/
│   ├── lista_eleitoral/
│   └── comunicacao_institucional/
│
├── perfil_pesquisa/                 # separado da ficha administrativa
│   ├── ano_resposta: number
│   ├── escolaridade: string
│   ├── renda_faixa: string
│   ├── estado_civil: string
│   ├── filhos_faixa: string
│   ├── genero: string
│   ├── cor_raca: string
│   ├── tempo_bicicleta: string
│   ├── usos_bicicleta: string[]
│   ├── avaliacao_infraestrutura: string
│   ├── motivacoes: string[]
│   ├── dificuldades: string[]
│   ├── disponibilidade: string
│   ├── frentes_interesse: string[]
│   └── expectativas: string
│
├── legado/
│   ├── registros: { legacy_record_id → { import_id, source, data_original } }
│   └── observacoes_saneamento: string
│
└── role: string                     # UserCategory existente (mantido por compatibilidade)
```

### Nós globais adicionais

```
associacoes/{pushKey}/
├── pessoa_id: string
├── data_inicio: string
├── data_fim: string | null
├── origem: string
├── status: string
└── observacoes: string

participacoes/{pushKey}/
├── pessoa_id: string
├── atividade_id: string
├── papel: string         # participante | organizacao | facilitacao | voluntariado | coordenacao
├── presenca_confirmada: boolean
└── origem_registro: string

atividades/{pushKey}/
├── nome: string
├── tipo: string          # assembleia | eleicao | acao_rua | reuniao | campanha | oficina | gt
├── data: string
├── local: string
├── projeto: string
├── eixo: string
└── fonte: string

eleicoes/{pushKey}/
├── nome: string
├── data: string
├── criterios_aptidao: string
├── criada_por: number
└── listas_eleitorais/{pushKey}/
    ├── gerada_em: string
    ├── gerada_por: number
    ├── criterios: string
    ├── hash_csv: string
    └── quantidade_pessoas: number

exportacoes/{pushKey}/
├── usuario_id: number
├── finalidade: string    # lista_eleitoral | contato_acao | mailing | aniversariantes | etc
├── filtros_usados: string (JSON)
├── campos_exportados: string[]
├── quantidade_registros: number
├── data_hora: string
└── justificativa: string

auditoria/{pushKey}/
├── usuario_id: number
├── acao: string           # revelou_cpf | exportou_csv | alterou_permissao | visualizou_ficha
├── pessoa_id_alvo: string
├── finalidade: string
├── data_hora: string
└── ip: string

legacy_imports/{pushKey}/
├── nome_fonte: string
├── tipo: string           # google_forms | google_contacts | planilha | csv | cadastro_manual
├── data_importacao: string
├── arquivo_original_hash: string
└── responsavel: string

legacy_records/{pushKey}/
├── import_id: string
├── linha_original_json: string
├── data_original: string
├── processado: boolean
└── pessoa_id_vinculada: string | null

possiveis_duplicidades/{pushKey}/
├── pessoa_id_a: string
├── pessoa_id_b: string
├── motivo: string         # mesmo_email | mesmo_telefone | nome_parecido | cpf_conflitante
├── confianca: string      # alta | media | baixa
└── status: string         # pendente | mesclado | ignorado
```

---

## 2. Criptografia em Repouso (AES-256-GCM + HMAC-SHA256)

### 2.1 Variáveis de ambiente (novas)

```env
# .env (adicionar)
ENCRYPTION_KEY=           # 64 chars hex (32 bytes) — gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
HMAC_KEY=                 # 64 chars hex (32 bytes) — gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.2 Módulo de criptografia (`app/api/crypto.server.ts`)

```typescript
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKeys(): { encryptionKey: Buffer; hmacKey: Buffer } {
  const encKey = process.env.ENCRYPTION_KEY;
  const hmacKey = process.env.HMAC_KEY;
  if (!encKey || !hmacKey) throw new Error("ENCRYPTION_KEY e HMAC_KEY são obrigatórias");
  return {
    encryptionKey: Buffer.from(encKey, "hex"),
    hmacKey: Buffer.from(hmacKey, "hex"),
  };
}

export function encrypt(plaintext: string): string {
  const { encryptionKey } = getKeys();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  const { encryptionKey } = getKeys();
  const [ivB64, authTagB64, encrypted] = ciphertext.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function hmac(value: string): string {
  const { hmacKey } = getKeys();
  return crypto.createHmac("sha256", hmacKey).update(value).digest("hex");
}

/** Normaliza CPF (só dígitos) e gera HMAC */
export function cpfHmac(cpf: string): string {
  return hmac(cpf.replace(/\D/g, ""));
}

/** Normaliza email (lowercase+trim) e gera HMAC */
export function emailHmac(email: string): string {
  return hmac(email.trim().toLowerCase());
}

/** Normaliza telefone (só dígitos) e gera HMAC */
export function phoneHmac(phone: string): string {
  return hmac(phone.replace(/\D/g, ""));
}
```

### 2.3 Fluxo de leitura/escrita

```
ESCRITA:
  plaintext → encrypt() → cipher armazenado
  plaintext → hmac()   → hash armazenado (para lookup sem descriptografar)

LEITURA:
  cipher → decrypt() → plaintext exibido na tela (após verificação de permissão)
  hash   → usado em queries: db.ref("subscribers").orderByChild("identidade/cpf_hash").equalTo(cpfHmac(busca))
```

### 2.4 Quando criptografar/descriptografar

| Operação | Onde ocorre |
|---|---|
| Criptografar na gravação | `handlers/actions/` — antes de chamar `update()` no Firebase |
| Descriptografar na leitura | `handlers/loaders/` — após `snapshot.val()`, antes de enviar ao cliente |
| Descriptografar na exportação CSV | `handlers/actions/` — no momento da geração do CSV, após registro de auditoria |
| Nunca descriptografar no cliente | Dados sensíveis nunca trafegam em plaintext para o frontend sem autorização explícita |

---

## 3. Perfis de Acesso (extensão do sistema atual)

O sistema atual tem 4 níveis (`ANY_USER`, `AMECICLISTAS`, `PROJECT_COORDINATORS`, `AMECICLO_COORDINATORS`).  
Propõe-se **manter a hierarquia existente** e adicionar **subperfis** dentro de `AMECICLO_COORDINATORS` para controle fino sobre dados sensíveis.

### 3.1 Novos subperfis (campo `subrole` no nó do usuário)

```typescript
export enum SubRole {
  GESTAO_ASSOCIATIVA = "GESTAO_ASSOCIATIVA",       // vê CPF, exporta lista eleitoral
  COMUNICACAO = "COMUNICACAO",                       // vê nome, email, telefone (se consentido); NÃO vê CPF
  PESQUISA = "PESQUISA",                             // vê dados agregados/pseudonimizados; NÃO vê CPF
  FINANCEIRO = "FINANCEIRO",                         // vê dados para recibos e contribuições
  COORDENACAO_ATIVIDADES = "COORDENACAO_ATIVIDADES", // vê participantes de ações; NÃO vê CPF (salvo justificativa)
  ADMIN_TECNICO = "ADMIN_TECNICO",                   // configura sistema e permissões; acesso total se necessário
}
```

### 3.2 Matriz de permissões sobre dados sensíveis

| Ação | GESTAO | COMUNIC | PESQUISA | FINANC | COORD_ATIV | ADMIN |
|---|---|---|---|---|---|---|
| Ver nome completo | Sim | Sim | Agregado | Sim | Sim | Sim |
| Ver CPF descriptografado | Sim | Não | Não | Parcial¹ | Não² | Sim |
| Ver email descriptografado | Sim | Sim³ | Não | Sim | Não | Sim |
| Ver telefone descriptografado | Sim | Sim³ | Não | Sim | Não | Sim |
| Ver perfil pesquisa individual | Não | Não | Pseudonim. | Não | Não | Sim |
| Ver dados agregados pesquisa | Sim | Sim | Sim | Sim | Sim | Sim |
| Exportar CSV com CPF | Sim | Não | Não | Não | Não | Sim |
| Exportar CSV sem CPF | Sim | Sim | Sim | Sim | Sim | Sim |
| Alterar permissões | Não | Não | Não | Não | Não | Sim |

¹ Financeiro vê CPF apenas dos associados com contribuição ativa.  
² Coordenação de atividades pode revelar CPF com justificativa registrada em auditoria.  
³ Comunicação vê apenas contatos de quem consentiu com `comunicacao_institucional`.

### 3.3 Implementação no middleware existente

Estender `isAuthorized.ts`:

```typescript
// app/utils/isAuthorized.ts — adicionar:
export function canAccessSensitiveData(
  userCategories: UserCategory[],
  userSubRole: SubRole | undefined,
  field: "cpf" | "email" | "telefone" | "pesquisa_individual"
): boolean {
  if (userCategories.includes(UserCategory.AMECICLO_COORDINATORS)) {
    if (userSubRole === SubRole.GESTAO_ASSOCIATIVA || userSubRole === SubRole.ADMIN_TECNICO) {
      return true;
    }
    if (field === "email" || field === "telefone") {
      return userSubRole === SubRole.COMUNICACAO || userSubRole === SubRole.FINANCEIRO;
    }
    if (field === "cpf") {
      return userSubRole === SubRole.FINANCEIRO; // Parcial — só contribuintes
    }
  }
  return false;
}
```

---

## 4. Auditoria

### 4.1 Eventos registrados

| Ação | Quando |
|---|---|
| `revelou_cpf` | Ao clicar em "Revelar CPF" na ficha |
| `exportou_csv` | Ao gerar qualquer CSV com dados pessoais |
| `visualizou_ficha` | Ao abrir ficha completa de pessoa (com dados sensíveis) |
| `alterou_permissao` | Ao mudar role ou subrole de usuário |
| `mesclou_cadastros` | Ao resolver duplicidade |
| `alterou_status` | Ao mudar status associativo |
| `criou_lista_eleitoral` | Ao gerar lista para eleição |

### 4.2 Função de registro

```typescript
// app/api/auditoria.server.ts
export async function registrarAuditoria(params: {
  usuarioId: number;
  acao: string;
  pessoaIdAlvo?: string;
  finalidade?: string;
  request: Request;
}) {
  const ref = db.ref("auditoria");
  const key = ref.push().key;
  await ref.child(key!).update({
    usuario_id: params.usuarioId,
    acao: params.acao,
    pessoa_id_alvo: params.pessoaIdAlvo || null,
    finalidade: params.finalidade || null,
    data_hora: new Date().toISOString(),
    ip: params.request.headers.get("x-forwarded-for") || params.request.headers.get("x-real-ip") || "unknown",
  });
}
```

---

## 5. Mascaramento e Revelação de CPF na Interface

### 5.1 Comportamento padrão

Na tela de ficha da pessoa, CPF aparece mascarado:

```
CPF: ***.***.123-45   [🔒 Revelar]
```

### 5.2 Fluxo de revelação

1. Pessoa da gestão clica em "Revelar"
2. Modal pergunta a finalidade (opções: `lista_eleitoral`, `regularizacao_associativa`, `conferencia_cadastral`, `outra`)
3. Ao confirmar, o servidor:
   - Verifica permissão (`canAccessSensitiveData`)
   - Descriptografa o CPF
   - Registra em `auditoria` com `acao: "revelou_cpf"`
   - Retorna o CPF em plaintext para exibição (não persiste no cliente)
4. O CPF é exibido por 60 segundos e depois volta ao estado mascarado

### 5.3 Componente React

```typescript
// app/components/CpfField.tsx
export function CpfField({ pessoaId, cpfCipher }: { pessoaId: string; cpfCipher: string }) {
  const [revealed, setRevealed] = useState(false);
  const [cpf, setCpf] = useState<string | null>(null);
  
  const masked = cpfCipher ? `***.***.${cpfCipher.slice(-7)}-${cpfCipher.slice(-2)}` : "—";
  // Nota: os últimos dígitos visíveis vêm de um campo separado `cpf_ultimos_digitos` 
  // armazenado em plaintext, NÃO do cipher completo.
  
  const handleReveal = async (finalidade: string) => {
    const res = await fetch("/api/revelar-cpf", {
      method: "POST",
      body: JSON.stringify({ pessoaId, finalidade }),
    });
    const data = await res.json();
    setCpf(data.cpf);
    setRevealed(true);
    setTimeout(() => { setRevealed(false); setCpf(null); }, 60_000);
  };
  
  // render...
}
```

---

## 6. Exportação de CSVs

### 6.1 Tipos de exportação e campos permitidos

| Finalidade | Campos | Requer CPF? |
|---|---|---|
| Lista eleitoral | nome, CPF, status, data_associacao, aptidao | Sim |
| Contatos para ação | nome, telefone, email, bairro, frente_interesse, ultima_participacao | Não |
| Mailing autorizado | nome, email | Não |
| Associados ativos | nome, CPF, email, telefone, status, data_associacao | Sim |
| Voluntários por frente | nome, telefone, email, frente_interesse | Não |
| Participantes de atividade | nome, papel, presenca | Não |
| Aniversariantes | nome, data_nascimento, email, telefone | Não |

### 6.2 Fluxo de exportação

1. Usuário acessa rota `/exportar`
2. Seleciona finalidade e filtros
3. O sistema:
   - Verifica permissão para aquela finalidade
   - Monta query no Firebase
   - Descriptografa apenas campos permitidos
   - Gera CSV com `Content-Disposition: attachment`
   - Registra em `exportacoes` e `auditoria`
4. O CSV é enviado ao cliente como download

### 6.3 Validade e descarte

- CSV com CPF tem aviso de validade operacional (ex: 30 dias)
- O sistema não armazena o CSV gerado — apenas metadados em `exportacoes`
- Cabe à pessoa que exportou apagar o arquivo após o uso, conforme política institucional

---

## 7. Migração de Dados Antigos (Legado)

### 7.1 Estratégia em 4 etapas

**Etapa 1 — Inventário das fontes**
- Levantar todos os Google Forms, planilhas, CSVs e contatos do Google Contacts usados desde 2013
- Para cada fonte, criar um registro em `legacy_imports`

**Etapa 2 — Importação bruta**
- Cada linha de cada fonte vira um `legacy_record` com `linha_original_json`
- Nenhuma transformação ainda — preservação fiel do dado original

**Etapa 3 — Vinculação e deduplicação**
- Para cada `legacy_record`, tentar vincular a um `pessoa_id` canônico
- Ordem de confiança na deduplicação:
  1. CPF válido igual → `confianca: alta`
  2. Email igual → `confianca: alta`
  3. Telefone igual → `confianca: media`
  4. Nome + data de nascimento → `confianca: media`
  5. Nome similar + outro campo → `confianca: baixa` → fila de revisão manual
- Conflitos vão para `possiveis_duplicidades`

**Etapa 4 — Saneamento**
- Registros com `confianca: alta` são promovidos ao cadastro canônico
- Registros `media` e `baixa` aguardam revisão
- Campos antigos (`ameciclo_register`, `library_register`, `personal`) são migrados para a nova estrutura e depois marcados como `legado`

### 7.2 Script de migração (`scripts/migrar-cadastro-amaciclistas.ts`)

O script:
1. Lê todos os `subscribers` existentes
2. Para cada um, extrai CPF, email, telefone dos campos legados
3. Gera `pessoa_id` (UUID v4) se não existir
4. Criptografa e grava na nova estrutura (`identidade/`, `contatos/`)
5. Mantém os campos antigos com prefixo `legado_` por 90 dias
6. Gera relatório de conflitos em `possiveis_duplicidades`

---

## 8. Formulário de Cadastro/Atualização

### 8.1 Campos do formulário

**Seção 1 — Identidade (obrigatório para associadas)**
- Nome social completo
- CPF
- Data de nascimento
- Email principal
- Telefone/WhatsApp

**Seção 2 — Consentimentos (checkboxes independentes)**
- [ ] Aceito receber informativo por email
- [ ] Aceito receber comunicados por WhatsApp
- [ ] Autorizo uso dos dados para pesquisa institucional (pseudonimizado)
- [ ] Autorizo inclusão em listas eleitorais da Ameciclo
- [ ] Autorizo comunicação institucional (convocações, assembleias)

Cada checkbox gera/atualiza um nó em `consentimentos/` com `versao_texto` (hash do texto exibido no momento da coleta, para auditoria de mudanças de termos).

**Seção 3 — Perfil/Pesquisa (facultativo, com aviso LGPD)**
- Escolaridade, renda, gênero, cor/raça, estado civil, filhos
- Tempo de bicicleta, usos, avaliação de infraestrutura
- Motivações, dificuldades
- Disponibilidade, frentes de interesse
- Expectativas em relação à Ameciclo

Aviso no formulário: *"Estes dados serão usados apenas de forma agregada e pseudonimizada para pesquisa e incidência política. Não serão associados à sua ficha administrativa individual."*

### 8.2 Rotas

| Rota | Permissão | Descrição |
|---|---|---|
| `/cadastro` | `ANY_USER` | Formulário público de cadastro |
| `/cadastro/atualizar` | `AMECICLISTAS` | Atualização dos próprios dados |
| `/pessoas` | `AMECICLO_COORDINATORS` | Lista de pessoas cadastradas (com busca, filtros) |
| `/pessoas/:pessoaId` | `AMECICLO_COORDINATORS` | Ficha completa (com máscara de CPF) |
| `/pessoas/:pessoaId/participacao` | `AMECICLO_COORDINATORS` | Histórico de participação |
| `/pessoas/:pessoaId/consentimentos` | `AMECICLO_COORDINATORS` | Histórico de consentimentos |

---

## 9. Participação e Atividades

### 9.1 Registro de atividade

```
atividades/{pushKey}/
├── nome: "Assembleia Geral Ordinária 2025"
├── tipo: "assembleia"
├── data: "2025-03-15"
├── local: "Sede da Ameciclo"
├── projeto: null
├── eixo: "governanca"
└── fonte: "google_calendar"

participacoes/{pushKey}/
├── pessoa_id: "uuid-xxx"
├── atividade_id: "pushKey-yyy"
├── papel: "participante"
├── presenca_confirmada: true
└── origem_registro: "lista_presenca_foto"
```

### 9.2 Geração de listas por participação

Rota `/listas` (acesso: `AMECICLO_COORDINATORS`):

Filtros disponíveis:
- Status associativo (ativas, inativas, todas)
- Participou de atividade do tipo: [assembleia, eleição, ação de rua, GT...]
- No período: [data início] a [data fim]
- Interessadas na frente: [comunicação, administrativo, incidência...]
- Consentiu com: [informativo, WhatsApp...]

Resultado: tabela com nome, status, última participação. Botão "Exportar CSV" com campos baseados na finalidade escolhida.

---

## 10. Listas Eleitorais

### 10.1 Criação de eleição

1. Gestão associativa acessa `/eleicoes/nova`
2. Define: nome, data, critérios de aptidão (ex: "associadas ativas que participaram de ao menos 1 assembleia nos últimos 2 anos")
3. Sistema gera a lista e armazena em `eleicoes/{id}/listas_eleitorais/`
4. CSV fica disponível para download por 48h, depois é removido do servidor

### 10.2 Critérios de aptidão configuráveis

```typescript
interface CriteriosAptidao {
  status_associativo: string[];       // ["ativa"]
  tempo_minimo_associacao_dias: number | null;
  participacao_minima: {
    tipo: string[];                   // ["assembleia", "eleicao"]
    periodo_dias: number;             // 730 (2 anos)
    quantidade_minima: number;        // 1
  } | null;
  idade_minima: number;               // 16
}
```

---

## 11. Google Contacts como Espelho

### 11.1 O que vai para o Google Contacts

Apenas:
- Nome
- Email
- Telefone
- Organização: "Ameciclo"
- Grupos/tags: "Associadas", "GT Comunicação", etc.

### 11.2 O que NÃO vai para o Google Contacts

- CPF
- Data de nascimento
- Dados de pesquisa/perfil
- Histórico de participação
- Status associativo
- Consentimentos
- Endereço completo

### 11.3 Sincronização

- Sentido: **sistema Ameciclo → Google Contacts** (unidirecional)
- Frequência: sob demanda (botão "Sincronizar contatos") ou agendada (semanal)
- Escopo: apenas contatos com `email.principal = true` e email/telefone válidos
- Registro de sincronização em `auditoria`

---

## 12. Cronograma de Implementação

### Fase 1 — Fundação (Semanas 1-4)

| # | Tarefa | Arquivos |
|---|---|---|
| 1.1 | Criar módulo de criptografia | `app/api/crypto.server.ts` |
| 1.2 | Adicionar `ENCRYPTION_KEY` e `HMAC_KEY` ao `.env.example` e deploy | `.env.example`, Vercel env vars |
| 1.3 | Expandir tipos TypeScript | `app/utils/types.ts` |
| 1.4 | Criar função de auditoria | `app/api/auditoria.server.ts` |
| 1.5 | Criar nó `auditoria` no Firebase com regras | Firebase Console |

### Fase 2 — Cadastro e Estrutura de Dados (Semanas 5-8)

| # | Tarefa | Arquivos |
|---|---|---|
| 2.1 | Criar rota `/cadastro` com formulário completo | `app/routes/cadastro.tsx` |
| 2.2 | Criar action handler para cadastro (com criptografia) | `app/handlers/actions/cadastro.ts` |
| 2.3 | Criar rota `/pessoas` (lista com busca/filtros) | `app/routes/pessoas.tsx` |
| 2.4 | Criar loader para pessoas | `app/handlers/loaders/pessoas.ts` |
| 2.5 | Criar rota `/pessoas/:pessoaId` (ficha completa) | `app/routes/pessoas.\$pessoaId.tsx` |
| 2.6 | Implementar `CpfField` com revelação e auditoria | `app/components/CpfField.tsx` |
| 2.7 | Criar endpoint `/api/revelar-cpf` | `app/routes/api.revelar-cpf.ts` |

### Fase 3 — Participação e Atividades (Semanas 9-11)

| # | Tarefa | Arquivos |
|---|---|---|
| 3.1 | Criar CRUD de atividades | `app/routes/atividades.tsx`, actions/loaders |
| 3.2 | Criar registro de participação | handlers |
| 3.3 | Criar rota `/listas` com filtros | `app/routes/listas.tsx` |
| 3.4 | Implementar geração de listas por participação | `app/handlers/loaders/listas.ts` |

### Fase 4 — Exportações e Listas Eleitorais (Semanas 12-14)

| # | Tarefa | Arquivos |
|---|---|---|
| 4.1 | Criar rota `/exportar` | `app/routes/exportar.tsx` |
| 4.2 | Implementar exportação CSV com controle de campos | `app/handlers/actions/exportar.ts` |
| 4.3 | Criar CRUD de eleições | `app/routes/eleicoes.tsx`, handlers |
| 4.4 | Implementar geração de lista eleitoral com critérios | `app/handlers/actions/eleicoes.ts` |

### Fase 5 — Migração e Saneamento (Semanas 15-17)

| # | Tarefa | Arquivos |
|---|---|---|
| 5.1 | Criar script de migração | `scripts/migrar-cadastro-amaciclistas.ts` |
| 5.2 | Executar migração em ambiente de staging | — |
| 5.3 | Validar dados migrados (auditoria de qualidade) | — |
| 5.4 | Criar interface de revisão de duplicidades | `app/routes/saneamento.tsx` |
| 5.5 | Migrar produção | — |

### Fase 6 — Google Contacts e Ajustes Finais (Semanas 18-19)

| # | Tarefa | Arquivos |
|---|---|---|
| 6.1 | Implementar sincronização com Google Contacts | `app/api/googleContacts.server.ts` |
| 6.2 | Criar página de administração (visão agregada) | `app/routes/admin.tsx` |
| 6.3 | Documentação interna para a gestão | `docs/guia-uso-gestao.md` |
| 6.4 | Testes de segurança e revisão de permissões | — |

---

## 13. Regras de Segurança do Firebase

```json
{
  "rules": {
    "subscribers": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        "identidade": {
          "cpf_cipher": { ".read": "auth != null && root.child('subscribers').child(auth.uid).child('subrole').val() === 'GESTAO_ASSOCIATIVA'" },
          "cpf_hash": { ".read": "auth != null" }
        },
        "contatos": {
          "email": {
            "cipher": { ".read": "auth != null" },
            "hash": { ".read": "auth != null" }
          }
        },
        "perfil_pesquisa": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    },
    "auditoria": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "exportacoes": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

**Nota:** A proteção real dos dados sensíveis está na camada de aplicação (criptografia + permissões no handler), não nas regras do Firebase Realtime Database (que têm granularidade limitada). As regras acima são uma camada adicional.

---

## 14. Variáveis de Ambiente Completas

Além das existentes, adicionar ao `.env` e `.env.example`:

```env
# ==================== CRIPTOGRAFIA ====================
ENCRYPTION_KEY=          # 64 chars hex — node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
HMAC_KEY=                # 64 chars hex — node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ==================== GOOGLE CONTACTS (espelho) ====================
# GOOGLE_CONTACTS_ENABLED=true
```

---

## 15. Novos Arquivos a Criar

```
app/
├── api/
│   ├── crypto.server.ts              # Criptografia AES-256-GCM + HMAC
│   ├── auditoria.server.ts           # Registro de auditoria
│   └── googleContacts.server.ts      # Sincronização com Google Contacts
├── routes/
│   ├── cadastro.tsx                  # Formulário público de cadastro
│   ├── cadastro.atualizar.tsx        # Atualização dos próprios dados
│   ├── pessoas.tsx                   # Lista de pessoas (gestão)
│   ├── pessoas.$pessoaId.tsx         # Ficha individual
│   ├── pessoas.$pessoaId.participacao.tsx
│   ├── pessoas.$pessoaId.consentimentos.tsx
│   ├── atividades.tsx                # CRUD de atividades
│   ├── listas.tsx                    # Geração de listas por filtros
│   ├── exportar.tsx                  # Exportação de CSVs controlada
│   ├── exportar.$finalidade.tsx      # Exportação por finalidade específica
│   ├── eleicoes.tsx                  # Gestão de eleições
│   ├── eleicoes.$eleicaoId.tsx       # Detalhe de eleição + lista
│   ├── eleicoes.nova.tsx             # Criar nova eleição
│   ├── saneamento.tsx                # Revisão de duplicidades
│   ├── admin.tsx                     # Painel administrativo
│   └── api.revelar-cpf.ts            # Endpoint de revelação de CPF
├── components/
│   ├── CpfField.tsx                  # Campo de CPF com máscara e revelação
│   ├── ConsentimentoCheckbox.tsx      # Checkbox com versão do texto
│   └── AuditoriaLog.tsx              # Visualização de log de auditoria
├── handlers/
│   ├── actions/
│   │   ├── cadastro.ts
│   │   ├── pessoas.ts
│   │   ├── atividades.ts
│   │   ├── exportar.ts
│   │   └── eleicoes.ts
│   └── loaders/
│       ├── pessoas.ts
│       ├── atividades.ts
│       ├── listas.ts
│       ├── exportar.ts
│       └── eleicoes.ts
└── utils/
    └── permissoesSensiveis.ts        # Funções de verificação de subperfis

scripts/
└── migrar-cadastro-amaciclistas.ts   # Script de migração de dados legados

docs/
├── PLANO_IMPLEMENTACAO_LGPD.md       # Este documento
└── guia-uso-gestao.md                # Guia para a gestão usar o sistema
```

---

## 16. Perguntas para Decisão Institucional

| # | Pergunta | Impacto |
|---|---|---|
| 1 | **Prazo de retenção de CSVs eleitorais:** 30, 60 ou 90 dias? Define o aviso no sistema. | Baixo |
| 2 | **Tempo de revelação do CPF na tela:** 60 segundos é suficiente? | Baixo |
| 3 | **Quem será ADMIN_TECNICO?** Precisa ser definido antes da implementação dos subperfis. | Alto |
| 4 | **Dados de pesquisa:** confirmar que a separação atual (não associar à ficha individual) será mantida. | Alto |
| 5 | **Migração:** priorizar quantidade sobre qualidade (migrar tudo logo, revisar depois) ou qualidade sobre quantidade (migrar só o confirmado)? | Alto |
| 6 | **Google Contacts:** cortar sincronização imediatamente ou manter espelho por tempo indeterminado? | Médio |
