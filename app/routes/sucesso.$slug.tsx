import { useParams } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { messaging } from "firebase-admin";
import { BackButton } from "~/components/CommonButtons";

const messages = {
  "criar-evento": {
    title: "✅ Evento criado com sucesso!",
    message: "Verifique o evento nas nossas agendas e convida a galera!",
    actions: [{ label: "📅 Criar Novo Evento", to: "/criar-evento" }],
  },
  "adicionar-fornecedor": {
    title: "✅ Fornecedor adicionado com sucesso!",
    actions: [
      { label: "📦 Adicionar Fornecedor", to: "/adicionar-fornecedor" },
      { label: "💰 Solicitar Pagamento", to: "/solicitar-pagamento" },
    ],
  },
  "solicitar-pagamento": {
    title: "✅ Solicitação enviada com sucesso!",
    actions: [
      { label: "💰 Solicitar Pagamento", to: "/solicitar-pagamento" },
      { label: "📦 Adicionar Fornecedor", to: "/adicionar-fornecedor" },
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
        <BackButton />
      </div>
    </div>
  );
}

export default function Sucesso() {
  const { slug } = useParams();

  // Verifique se `slug` é uma chave válida de `messages`
  const page =
    slug && slug in messages
      ? messages[slug as MessageKey]
      : {
          title: "✅ Sucesso!",
          actions: [{ label: "⬅️ Voltar", to: "/" }],
        };

  return <SuccessPage title={page.title} actions={page.actions} />;
}
