import { useState } from "react";
import { Form, useActionData, Link } from "@remix-run/react";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { criarAmeciclista, criarPesquisa, criarVinculoPesquisa } from "~/api/firebaseConnection.server";
import {
  encrypt,
  cpfHmac,
  emailHmac,
  phoneHmac,
  gerarPessoaId,
  gerarTokenPseudonimo,
  normalizarNome,
  hashTexto,
} from "~/api/crypto.server";
import { formatCPF, formatPhone } from "~/utils/format";
import { validateCPF } from "~/utils/idNumber";

const TEXTOS_CONSENTIMENTO = {
  informativo:
    "Autorizo o recebimento do boletim informativo da Ameciclo por e-mail.",
  comunicacao:
    "Autorizo o uso dos meus dados de contato (e-mail, telefone, WhatsApp, Telegram) para comunicação institucional da Ameciclo, incluindo convocações de assembleias, comunicados oficiais, informações sobre a associação e clube de vantagens.",
  estatuto:
    "Declaro que concordo com o Estatuto da Ameciclo (obrigatório).",
};

const OPCOES_ESCOLARIDADE = [
  { value: "", label: "Selecione..." },
  { value: "fundamental_incompleto", label: "Fundamental incompleto" },
  { value: "fundamental_completo", label: "Fundamental completo" },
  { value: "medio_incompleto", label: "Médio incompleto" },
  { value: "medio_completo", label: "Médio completo" },
  { value: "superior_incompleto", label: "Superior incompleto" },
  { value: "superior_completo", label: "Superior completo" },
  { value: "pos_graduacao", label: "Pós-graduação" },
];

const OPCOES_RENDA = [
  { value: "", label: "Selecione..." },
  { value: "ate_1_salario", label: "Até 1 salário mínimo" },
  { value: "1_a_3_salarios", label: "De 1 a 3 salários mínimos" },
  { value: "3_a_5_salarios", label: "De 3 a 5 salários mínimos" },
  { value: "5_a_10_salarios", label: "De 5 a 10 salários mínimos" },
  { value: "10_a_20_salarios", label: "De 10 a 20 salários mínimos" },
  { value: "mais_de_20_salarios", label: "Mais de 20 salários mínimos" },
  { value: "prefiro_nao_informar", label: "Prefiro não informar" },
];

const OPCOES_GENERO = [
  { value: "", label: "Selecione..." },
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "nao_binario", label: "Não-binário" },
  { value: "outro", label: "Outro" },
  { value: "prefiro_nao_informar", label: "Prefiro não informar" },
];

const OPCOES_COR_RACA = [
  { value: "", label: "Selecione..." },
  { value: "branca", label: "Branca" },
  { value: "preta", label: "Preta" },
  { value: "parda", label: "Parda" },
  { value: "amarela", label: "Amarela" },
  { value: "indigena", label: "Indígena" },
  { value: "outro", label: "Outro" },
  { value: "prefiro_nao_informar", label: "Prefiro não informar" },
];

const OPCOES_ESTADO_CIVIL = [
  { value: "", label: "Selecione..." },
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "uniao_estavel", label: "União estável" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "outro", label: "Outro" },
  { value: "prefiro_nao_informar", label: "Prefiro não informar" },
];

const OPCOES_FILHOS = [
  { value: "", label: "Selecione..." },
  { value: "0", label: "Nenhum" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3_ou_mais", label: "3 ou mais" },
  { value: "prefiro_nao_informar", label: "Prefiro não informar" },
];

const OPCOES_TEMPO_BICICLETA = [
  { value: "", label: "Selecione..." },
  { value: "menos_1_ano", label: "Menos de 1 ano" },
  { value: "1_a_3_anos", label: "1 a 3 anos" },
  { value: "3_a_5_anos", label: "3 a 5 anos" },
  { value: "5_a_10_anos", label: "5 a 10 anos" },
  { value: "mais_10_anos", label: "Mais de 10 anos" },
];

const OPCOES_AVALIACAO = [
  { value: "", label: "Selecione..." },
  { value: "muito_boa", label: "Muito boa" },
  { value: "boa", label: "Boa" },
  { value: "regular", label: "Regular" },
  { value: "ruim", label: "Ruim" },
  { value: "muito_ruim", label: "Muito ruim" },
  { value: "nao_sei_avaliar", label: "Não sei avaliar" },
];

const OPCOES_DISPONIBILIDADE = [
  { value: "", label: "Selecione..." },
  { value: "diaria", label: "Diária" },
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal" },
  { value: "mensal", label: "Mensal" },
  { value: "ocasional", label: "Ocasional" },
  { value: "nenhuma", label: "Nenhuma" },
];

const USOS_BICICLETA = [
  "transporte",
  "lazer",
  "esporte",
  "trabalho",
  "ativismo",
];

const MOTIVACOES = [
  "questoes_ambientais",
  "saude",
  "economia",
  "agilidade",
  "sociabilidade",
];

const DIFICULDADES = [
  "falta_ciclovia",
  "seguranca",
  "roubo",
  "falta_estacionamento",
  "desrespeito_motoristas",
];

const FRENTES_INTERESSE = [
  "comunicacao",
  "administrativo",
  "incidencia_politica",
  "formacao",
  "eventos",
  "infraestrutura",
  "mobilizacao",
];

const LABELS: Record<string, string> = {
  transporte: "Transporte",
  lazer: "Lazer",
  esporte: "Esporte",
  trabalho: "Trabalho",
  ativismo: "Ativismo",
  questoes_ambientais: "Questões ambientais",
  saude: "Saúde",
  economia: "Economia",
  agilidade: "Agilidade",
  sociabilidade: "Sociabilidade",
  falta_ciclovia: "Falta de ciclovia",
  seguranca: "Segurança",
  roubo: "Roubo",
  falta_estacionamento: "Falta de estacionamento",
  desrespeito_motoristas: "Desrespeito dos motoristas",
  comunicacao: "Comunicação",
  administrativo: "Administrativo",
  incidencia_politica: "Incidência política",
  formacao: "Formação",
  eventos: "Eventos",
  infraestrutura: "Infraestrutura",
  mobilizacao: "Mobilização",
};

// ─── Action ───────────────────────────────────────────────────────────
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const nomeSocial = (formData.get("nome_social") as string || "").trim();
  const cpfRaw = (formData.get("cpf") as string || "").trim();
  const dataNascimento = (formData.get("data_nascimento") as string || "").trim();
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const telefone = (formData.get("telefone") as string || "").trim();
  const whatsapp = formData.get("whatsapp") === "on";
  const telegram = formData.get("telegram") === "on";
  const expectativas = (formData.get("expectativas") as string || "").trim();
  const disponibilidade = (formData.get("disponibilidade") as string || "").trim();
  const frentesInteresseRaw = formData.getAll("frentes_interesse") as string[];
  const frentesInteressePessoa = frentesInteresseRaw.filter(Boolean);
  const endLogradouro = (formData.get("end_logradouro") as string || "").trim();
  const endComplemento = (formData.get("end_complemento") as string || "").trim();
  const endBairro = (formData.get("end_bairro") as string || "").trim();
  const endCidade = (formData.get("end_cidade") as string || "").trim();

  if (!nomeSocial) return json({ error: "Nome social é obrigatório." });
  if (nomeSocial.trim().split(/\s+/).length < 2)
    return json({ error: "Informe nome e sobrenome." });
  if (!cpfRaw || !validateCPF(cpfRaw))
    return json({ error: "CPF inválido." });
  if (!dataNascimento)
    return json({ error: "Data de nascimento é obrigatória." });
  if (!email || !email.includes("@"))
    return json({ error: "E-mail inválido." });
  if (!telefone || telefone.replace(/\D/g, "").length < 10)
    return json({ error: "Telefone inválido." });
  if (formData.get("consent_estatuto") !== "on")
    return json({ error: "É necessário concordar com o Estatuto da Ameciclo." });

  const pessoaId = gerarPessoaId();
  const cpfNumerico = cpfRaw.replace(/\D/g, "");
  const telefoneNumerico = telefone.replace(/\D/g, "");
  const agora = new Date().toISOString();

  const consentimentos: Record<string, { aceitou: boolean; data_hora: string; versao_texto: string }> = {};
  for (const chave of Object.keys(TEXTOS_CONSENTIMENTO)) {
    consentimentos[chave] = {
      aceitou: formData.get(`consent_${chave}`) === "on",
      data_hora: agora,
      versao_texto: hashTexto(TEXTOS_CONSENTIMENTO[chave as keyof typeof TEXTOS_CONSENTIMENTO]),
    };
  }

  // Consentimento de pesquisa de perfil (aciona o formulário expandido)
  const aceitouPesquisaPerfil = formData.get("consent_pesquisa_perfil") === "on";

  try {
    const dadosPessoa = {
      pessoa_id: pessoaId,
      nome_social: nomeSocial,
      nome_normalizado: normalizarNome(nomeSocial),
      data_nascimento: dataNascimento,
      status: "ativa",
      expectativas,
      disponibilidade: disponibilidade || undefined,
      frentes_interesse: frentesInteressePessoa.length > 0 ? frentesInteressePessoa : undefined,
      identidade: {
        cpf_hash: cpfHmac(cpfRaw),
        cpf_cipher: encrypt(cpfNumerico),
        cpf_ultimos_digitos: cpfNumerico.slice(-7),
      },
      contatos: {
        email: {
          hash: emailHmac(email),
          cipher: encrypt(email),
          principal: true,
          valido: true,
        },
        telefone: {
          hash: phoneHmac(telefone),
          cipher: encrypt(telefoneNumerico),
          principal: true,
          whatsapp,
          telegram,
          valido: true,
        },
        ...(endLogradouro ? {
          endereco: {
            cipher: encrypt(`${endLogradouro}${endComplemento ? `, ${endComplemento}` : ""}${endBairro ? `, ${endBairro}` : ""}${endCidade ? `, ${endCidade}` : ""}`),
            bairro: endBairro || undefined,
            cidade: endCidade || undefined,
          },
        } : {}),
      },
      consentimentos,
    };

    await criarAmeciclista(pessoaId, dadosPessoa);

    // Pesquisa de perfil (separada) — só se pessoa aceitou responder
    if (aceitouPesquisaPerfil) {
      const escolaridade = (formData.get("escolaridade") as string || "").trim();
      if (escolaridade) {
        const tokenPseudonimo = gerarTokenPseudonimo();
        const frentesRaw = formData.getAll("frentes_interesse") as string[];
        const usosRaw = formData.getAll("usos_bicicleta") as string[];
        const motivacoesRaw = formData.getAll("motivacoes") as string[];
        const dificuldadesRaw = formData.getAll("dificuldades") as string[];

        const dadosPesquisa = {
          ano: new Date().getFullYear(),
          genero: (formData.get("genero") as string || "").trim() || undefined,
          genero_outro: (formData.get("genero_outro") as string || "").trim() || undefined,
          cor_raca: (formData.get("cor_raca") as string || "").trim() || undefined,
          cor_raca_outro: (formData.get("cor_raca_outro") as string || "").trim() || undefined,
          profissao: (formData.get("profissao") as string || "").trim() || undefined,
          escolaridade,
          renda_faixa: (formData.get("renda_faixa") as string || "").trim() || undefined,
          estado_civil: (formData.get("estado_civil") as string || "").trim() || undefined,
          estado_civil_outro: (formData.get("estado_civil_outro") as string || "").trim() || undefined,
          filhos_faixa: (formData.get("filhos_faixa") as string || "").trim() || undefined,
          tempo_bicicleta: (formData.get("tempo_bicicleta") as string || "").trim() || undefined,
          usos_bicicleta: usosRaw.filter(Boolean),
          avaliacao_infraestrutura: (formData.get("avaliacao_infraestrutura") as string || "").trim() || undefined,
          motivacoes: motivacoesRaw.filter(Boolean),
          dificuldades: dificuldadesRaw.filter(Boolean),
          disponibilidade: (formData.get("disponibilidade") as string || "").trim() || undefined,
          frentes_interesse: frentesRaw.filter(Boolean),
        };

        await criarPesquisa(tokenPseudonimo, dadosPesquisa);
        await criarVinculoPesquisa(pessoaId, tokenPseudonimo);
      }
    }

    return json({ success: true, nome: nomeSocial.split(" ")[0] });
  } catch (err) {
    console.error("Erro ao cadastrar ameciclista:", err);
    return json({ error: "Erro ao salvar cadastro. Tente novamente." });
  }
}

// ─── Loader ───────────────────────────────────────────────────────────
export async function loader({ request }: LoaderFunctionArgs) {
  return json({});
}

// ─── Componente ───────────────────────────────────────────────────────
export default function Cadastro() {
  const actionData = useActionData<typeof action>();

  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nomeSocial, setNomeSocial] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [telegram, setTelegram] = useState(false);
  const [expectativas, setExpectativas] = useState("");
  const [endLogradouro, setEndLogradouro] = useState("");
  const [endComplemento, setEndComplemento] = useState("");
  const [endBairro, setEndBairro] = useState("");
  const [endCidade, setEndCidade] = useState("Recife");

  const [consentimentos, setConsentimentos] = useState<Record<string, boolean>>({
    informativo: false,
    comunicacao: false,
    estatuto: true,
    pesquisa_perfil: true,
  });

  const [mostrarPesquisa, setMostrarPesquisa] = useState(false);
  const [mostrarExpectativas, setMostrarExpectativas] = useState(false);
  const [escolaridade, setEscolaridade] = useState("");
  const [rendaFaixa, setRendaFaixa] = useState("");
  const [genero, setGenero] = useState("");
  const [corRaca, setCorRaca] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [filhosFaixa, setFilhosFaixa] = useState("");
  const [tempoBicicleta, setTempoBicicleta] = useState("");
  const [avaliacaoInfra, setAvaliacaoInfra] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [usosBicicleta, setUsosBicicleta] = useState<string[]>([]);
  const [motivacoes, setMotivacoes] = useState<string[]>([]);
  const [dificuldades, setDificuldades] = useState<string[]>([]);
  const [generoOutro, setGeneroOutro] = useState("");
  const [corRacaOutro, setCorRacaOutro] = useState("");
  const [estadoCivilOutro, setEstadoCivilOutro] = useState("");
  const [profissao, setProfissao] = useState("");
  const [frentesInteresse, setFrentesInteresse] = useState<string[]>([]);

  const toggleArray = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    arr: string[],
    value: string
  ) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const cpfValido = validateCPF(cpf);
  const nomeValido = nomeSocial.trim().split(/\s+/).length >= 2;
  const telefoneValido = telefone.replace(/\D/g, "").length >= 10;
  const emailValido = email.includes("@") && email.includes(".");
  const dataValida = !!dataNascimento;
  const estatutoValido = consentimentos.estatuto;
  const formValido = cpfValido && nomeValido && telefoneValido && emailValido && dataValida && estatutoValido;

  if (actionData && "success" in actionData && actionData.success) {
    return (
      <div className="container py-8 px-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-2">Cadastro realizado com sucesso!</h2>
          <p>
            Bem-vinda, <strong>{actionData.nome}</strong>! Seu cadastro na Ameciclo
            foi registrado. Entraremos em contato pelos canais informados.
          </p>
        </div>
        <Link
          to="/"
          className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700"
        >
          Voltar ao Menu Principal
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="mb-4">
        <Link to="/" className="text-teal-600 hover:text-teal-700 text-sm">
          &larr; Voltar ao Menu Principal
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-teal-600 mb-2">
        Cadastro de Ameciclista
      </h1>
      <p className="text-gray-600 mb-4">
        Associe-se à Ameciclo — Associação Metropolitana de Ciclistas do Recife.
      </p>

      {/* ═══════════ CABEÇALHO INSTITUCIONAL ═══════════ */}
      <section className="bg-teal-50 border border-teal-200 p-5 rounded-lg mb-6 text-sm text-teal-900 leading-relaxed">
        <p className="mb-3">
          A Associação Metropolitana de Ciclistas do Recife — Ameciclo — tem
          como missão transformar as cidades, por meio da bicicleta, em
          ambientes mais humanos, democráticos e sustentáveis. Nossa visão é
          organizar a sociedade pela transformação do ambiente urbano, pela
          garantia da segurança no trânsito e pela priorização da mobilidade
          ativa e coletiva, por meio da influência técnica e política em ações
          e planos da Região Metropolitana do Recife, bem como contribuir para
          a resiliência ao colapso climático, desestimulando a motorização
          individual.
        </p>
        <a
          href="https://estatuto.ameciclo.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 font-semibold underline hover:text-teal-900"
        >
          Leia nosso Estatuto &rarr;
        </a>
      </section>

      <Form method="post" className="space-y-8">
        {/* ═══════════ SEÇÃO 1 — IDENTIFICAÇÃO ═══════════ */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-teal-600 border-b pb-2">
            Identificação
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome social completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nome_social"
              value={nomeSocial}
              onChange={(e) => setNomeSocial(e.target.value)}
              placeholder="Como você quer ser chamada"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
            {nomeSocial && !nomeValido && (
              <p className="text-sm text-red-600 mt-1">Informe nome e sobrenome</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="cpf"
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                cpf && !cpfValido ? "border-red-300" : "border-gray-300"
              }`}
              required
            />
            {cpf && !cpfValido && (
              <p className="text-sm text-red-600 mt-1">CPF inválido</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de nascimento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="data_nascimento"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                email && !emailValido ? "border-red-300" : "border-gray-300"
              }`}
              required
            />
            {email && !emailValido && (
              <p className="text-sm text-red-600 mt-1">E-mail inválido</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="telefone"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              placeholder="(81) 99999-9999"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                telefone && !telefoneValido ? "border-red-300" : "border-gray-300"
              }`}
              required
            />
            {telefone && !telefoneValido && (
              <p className="text-sm text-red-600 mt-1">
                Telefone deve ter pelo menos 10 dígitos (DDD + número)
              </p>
            )}
            <div className="flex flex-wrap gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="whatsapp"
                  checked={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.checked)}
                />
                Este número é WhatsApp
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="telegram"
                  checked={telegram}
                  onChange={(e) => setTelegram(e.target.checked)}
                />
                Este número é Telegram
              </label>
            </div>
          </div>

          {/* Endereço (opcional) */}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Endereço <span className="text-gray-400 font-normal">(opcional)</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Logradouro e número
                </label>
                <input
                  type="text"
                  name="end_logradouro"
                  value={endLogradouro}
                  onChange={(e) => setEndLogradouro(e.target.value)}
                  placeholder="Rua da Aurora, 529"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    name="end_complemento"
                    value={endComplemento}
                    onChange={(e) => setEndComplemento(e.target.value)}
                    placeholder="Loja 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    name="end_bairro"
                    value={endBairro}
                    onChange={(e) => setEndBairro(e.target.value)}
                    placeholder="Santo Amaro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  name="end_cidade"
                  value={endCidade}
                  onChange={(e) => setEndCidade(e.target.value)}
                  placeholder="Recife"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ EXPECTATIVAS E PARTICIPAÇÃO (OPCIONAL, DROPDOWN) ═══════════ */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <button
            type="button"
            onClick={() => setMostrarExpectativas(!mostrarExpectativas)}
            className="w-full text-left flex items-center justify-between"
          >
            <h2 className="text-xl font-semibold text-teal-600">
              Sua expectativa e participação{" "}
              <span className="text-sm font-normal text-gray-400">(opcional)</span>
            </h2>
            <span className="text-teal-600 text-lg">
              {mostrarExpectativas ? "\u25B2" : "\u25BC"}
            </span>
          </button>

          {mostrarExpectativas && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diga, em poucas palavras, o que você espera da Ameciclo
                </label>
                <textarea
                  name="expectativas"
                  value={expectativas}
                  onChange={(e) => setExpectativas(e.target.value)}
                  rows={3}
                  placeholder="O que te trouxe até aqui? O que você espera da associação?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilidade para contribuir
                </label>
                <input type="hidden" name="disponibilidade" value={disponibilidade} />
                <div className="flex flex-wrap gap-2">
                  {OPCOES_DISPONIBILIDADE.filter(o => o.value !== "").map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => setDisponibilidade(disponibilidade === o.value ? "" : o.value)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        disponibilidade === o.value
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frentes de interesse
                </label>
                <div className="flex flex-wrap gap-2">
                  {FRENTES_INTERESSE.map((f) => (
                    <label
                      key={f}
                      className={`px-3 py-1 rounded-full text-sm border cursor-pointer transition-colors ${
                        frentesInteresse.includes(f)
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="frentes_interesse"
                        value={f}
                        checked={frentesInteresse.includes(f)}
                        onChange={() => toggleArray(setFrentesInteresse, frentesInteresse, f)}
                        className="sr-only"
                      />
                      {LABELS[f] || f}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ═══════════ SEÇÃO 2 — PESQUISA DE PERFIL ═══════════ */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <button
            type="button"
            onClick={() => setMostrarPesquisa(!mostrarPesquisa)}
            className="w-full text-left flex items-center justify-between"
          >
            <h2 className="text-xl font-semibold text-teal-600">
              Pesquisa de Perfil da Pessoa Associada{" "}
              <span className="text-sm font-normal text-gray-400">(opcional)</span>
            </h2>
            <span className="text-teal-600 text-lg">
              {mostrarPesquisa ? "\u25B2" : "\u25BC"}
            </span>
          </button>

          {mostrarPesquisa && (
            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="consent_pesquisa_perfil"
                  checked={consentimentos.pesquisa_perfil}
                  onChange={(e) =>
                    setConsentimentos((prev) => ({
                      ...prev,
                      pesquisa_perfil: e.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Concordo em fornecer estes dados para fins de pesquisa e
                  incidência política, que serão usados de forma anônima
                </span>
              </label>

              {consentimentos.pesquisa_perfil && (
                <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm p-3 rounded-md">
                  Estas informações são separadas da sua ficha cadastral e
                  utilizadas apenas de forma agrupada para pesquisa e
                  incidência política. Seus dados pessoais não são associados
                  a estas respostas.
                </div>
              )}

              {consentimentos.pesquisa_perfil && (
                <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gênero
                </label>
                <input type="hidden" name="genero" value={genero === "outro" ? `outro:${generoOutro}` : genero} />
                <div className="flex flex-wrap gap-2">
                  {OPCOES_GENERO.filter(o => o.value !== "").map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => { setGenero(genero === o.value ? "" : o.value); if (o.value !== "outro") setGeneroOutro(""); }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        genero === o.value
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {genero === "outro" && (
                  <input
                    type="text"
                    name="genero_outro"
                    value={generoOutro}
                    onChange={(e) => setGeneroOutro(e.target.value)}
                    placeholder="Escreva aqui"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raça/cor
                </label>
                <input type="hidden" name="cor_raca" value={corRaca === "outro" ? `outro:${corRacaOutro}` : corRaca} />
                <div className="flex flex-wrap gap-2">
                  {OPCOES_COR_RACA.filter(o => o.value !== "").map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => { setCorRaca(corRaca === o.value ? "" : o.value); if (o.value !== "outro") setCorRacaOutro(""); }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        corRaca === o.value
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {corRaca === "outro" && (
                  <input
                    type="text"
                    name="cor_raca_outro"
                    value={corRacaOutro}
                    onChange={(e) => setCorRacaOutro(e.target.value)}
                    placeholder="Escreva aqui"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissão
                </label>
                <input
                  type="text"
                  name="profissao"
                  value={profissao}
                  onChange={(e) => setProfissao(e.target.value)}
                  placeholder="Ex: professora, engenheiro, estudante, ciclista entregadora..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolaridade
                </label>
                <input type="hidden" name="escolaridade" value={escolaridade} />
                <div className="flex flex-wrap gap-2">
                  {OPCOES_ESCOLARIDADE.filter(o => o.value !== "").map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => setEscolaridade(escolaridade === o.value ? "" : o.value)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        escolaridade === o.value
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renda pessoal
                </label>
                <input type="hidden" name="renda_faixa" value={rendaFaixa} />
                <div className="flex flex-wrap gap-2">
                  {OPCOES_RENDA.filter(o => o.value !== "").map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => setRendaFaixa(rendaFaixa === o.value ? "" : o.value)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        rendaFaixa === o.value
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado civil
                </label>
                <input type="hidden" name="estado_civil" value={estadoCivil === "outro" ? `outro:${estadoCivilOutro}` : estadoCivil} />
                <div className="flex flex-wrap gap-2">
                  {OPCOES_ESTADO_CIVIL.filter(o => o.value !== "").map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => { setEstadoCivil(estadoCivil === o.value ? "" : o.value); if (o.value !== "outro") setEstadoCivilOutro(""); }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        estadoCivil === o.value
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {estadoCivil === "outro" && (
                  <input
                    type="text"
                    name="estado_civil_outro"
                    value={estadoCivilOutro}
                    onChange={(e) => setEstadoCivilOutro(e.target.value)}
                    placeholder="Escreva aqui"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filhos
                </label>
                <input type="hidden" name="filhos_faixa" value={filhosFaixa} />
                <div className="flex flex-wrap gap-2">
                  {OPCOES_FILHOS.filter(o => o.value !== "").map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => setFilhosFaixa(filhosFaixa === o.value ? "" : o.value)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        filhosFaixa === o.value
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Há quanto tempo pedala como meio de transporte?
                </label>
                <input type="hidden" name="tempo_bicicleta" value={tempoBicicleta} />
                <div className="flex flex-wrap gap-2">
                  {OPCOES_TEMPO_BICICLETA.filter(o => o.value !== "").map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => setTempoBicicleta(tempoBicicleta === o.value ? "" : o.value)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        tempoBicicleta === o.value
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Como avalia a infraestrutura cicloviária da sua região?
                </label>
                <input type="hidden" name="avaliacao_infraestrutura" value={avaliacaoInfra} />
                <div className="flex flex-wrap gap-2">
                  {OPCOES_AVALIACAO.filter(o => o.value !== "").map((o) => (
                    <button
                      type="button"
                      key={o.value}
                      onClick={() => setAvaliacaoInfra(avaliacaoInfra === o.value ? "" : o.value)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        avaliacaoInfra === o.value
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  O que te motiva a pedalar?
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOTIVACOES.map((m) => (
                    <label
                      key={m}
                      className={`px-3 py-1 rounded-full text-sm border cursor-pointer transition-colors ${
                        motivacoes.includes(m)
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="motivacoes"
                        value={m}
                        checked={motivacoes.includes(m)}
                        onChange={() => toggleArray(setMotivacoes, motivacoes, m)}
                        className="sr-only"
                      />
                      {LABELS[m] || m}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principais dificuldades enfrentadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIFICULDADES.map((d) => (
                    <label
                      key={d}
                      className={`px-3 py-1 rounded-full text-sm border cursor-pointer transition-colors ${
                        dificuldades.includes(d)
                          ? "bg-teal-100 border-teal-500 text-teal-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="dificuldades"
                        value={d}
                        checked={dificuldades.includes(d)}
                        onChange={() => toggleArray(setDificuldades, dificuldades, d)}
                        className="sr-only"
                      />
                      {LABELS[d] || d}
                    </label>
                  ))}
                </div>
              </div>
            </div>
              )}
            </div>
          )}
        </section>

        {/* ═══════════ SEÇÃO 3 — AUTORIZAÇÕES ═══════════ */}
        <section className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-teal-600 border-b pb-2">
            Autorizações
          </h2>
          <p className="text-sm text-gray-500">
            A concordância com o Estatuto é obrigatória. As demais
            autorizações podem ser alteradas a qualquer momento.
          </p>

          {Object.entries(TEXTOS_CONSENTIMENTO).map(([chave, texto]) => (
            <label
              key={chave}
              className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                name={`consent_${chave}`}
                checked={consentimentos[chave]}
                onChange={(e) =>
                  setConsentimentos((prev) => ({
                    ...prev,
                    [chave]: e.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{texto}</span>
            </label>
          ))}
        </section>

        {/* ═══════════ ERRO / SUBMIT ═══════════ */}
        {actionData && "error" in actionData && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            {actionData.error}
          </div>
        )}

        <button
          type="submit"
          disabled={!formValido}
          className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
        >
          Enviar cadastro
        </button>

        <p className="text-xs text-gray-400 text-center pb-8">
          Seus dados são armazenados com criptografia e acessados apenas pela
          gestão autorizada da Ameciclo, conforme a LGPD.
        </p>
      </Form>
    </div>
  );
}
