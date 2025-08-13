import { useParams, useSearchParams } from "@remix-run/react";
import { Link } from "@remix-run/react";

const messages = {
  "criar-evento": {
    title: "✅ Evento criado com sucesso!",
    message: "Verifique o evento nas nossas agendas e convida a galera!",
    actions: [{ label: "📅 Criar Novo Evento", to: "/criar-evento" }],
  },
  "adicionar-fornecedor": {
    title: "✅ Fornecedor adicionado com sucesso!",
    actions: [
      { label: "📦 Gestão de Fornecedores", to: "/gestao-fornecedores" },
      { label: "💰 Solicitar Pagamento", to: "/solicitar-pagamento" },
    ],
  },
  "solicitar-pagamento": {
    title: "✅ Solicitações enviadas com sucesso!",
    actions: [
      { label: "💰 Solicitar Pagamento", to: "/solicitar-pagamento" },
      { label: "📦 Gestão de Fornecedores", to: "/gestao-fornecedores" },
    ],
  },
  usuario: {
    title: "✅ Usuário registrado com sucesso!",
    message: "Agora você tem acesso a outros botões na página principal.",
    actions: [{ label: "⚙️ Ver informações", to: "/user" }],
  },
};

type MessageKey = keyof typeof messages; // Define as chaves válidas de `messages`

interface SuccessPageProps {
  title: string;
  message?: string;
  actions: { label: string; to: string }[];
}

function SuccessPage({ title, message, actions }: SuccessPageProps) {
  return (
    <div className="container">
      <h2 className="text-primary">{title}</h2>
      {message && <p>{message}</p>}

      <div className="button-group">
        <br />
        <br />
        {actions.map((action, index) => (
          <Link key={index} to={action.to}>
            <button className="button-full">{action.label}</button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Sucesso() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const count = searchParams.get("count");

  // Verifique se `slug` é uma chave válida de `messages`
  let page =
    slug && slug in messages
      ? messages[slug as MessageKey]
      : {
          title: "✅ Sucesso!",
          actions: [{ label: "⬅️ Voltar", to: "/" }],
        };

  // Personaliza mensagem para pagamentos múltiplos
  if (slug === "solicitar-pagamento" && count) {
    const numCount = parseInt(count);
    page = {
      ...page,
      title: `✅ ${numCount} solicitação${numCount > 1 ? 'ões' : ''} enviada${numCount > 1 ? 's' : ''} com sucesso!`,
      message: `Todas as ${numCount} solicitações foram processadas e enviadas para aprovação.`
    };
  }

  return <SuccessPage title={page.title} message={page.message} actions={page.actions} />;
}
