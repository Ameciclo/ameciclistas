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
  "emprestimo-solicitado": {
    title: "✅ Solicitação enviada com sucesso!",
    message: "Sua solicitação foi enviada e está aguardando aprovação.",
    actions: [{ label: "📚 Voltar à Biblioteca", to: "/biblioteca" }],
  },
  // Biblioteca
  "biblioteca-aprovada": {
    title: "✅ Solicitação aprovada com sucesso!",
    message: "O empréstimo foi registrado e o usuário foi notificado.",
    actions: [{ label: "📚 Voltar à Biblioteca", to: "/biblioteca?gestao=true" }],
  },
  "biblioteca-rejeitada": {
    title: "✅ Solicitação rejeitada!",
    message: "A solicitação foi rejeitada e o usuário foi notificado.",
    actions: [{ label: "📚 Voltar à Biblioteca", to: "/biblioteca?gestao=true" }],
  },
  "biblioteca-devolucao": {
    title: "✅ Devolução registrada com sucesso!",
    message: "O livro foi marcado como devolvido no sistema.",
    actions: [{ label: "📚 Voltar à Biblioteca", to: "/biblioteca?gestao=true" }],
  },
  "biblioteca-cadastro": {
    title: "✅ Livro cadastrado com sucesso!",
    message: "O novo livro foi adicionado ao acervo da biblioteca.",
    actions: [{ label: "📚 Voltar à Biblioteca", to: "/biblioteca?gestao=true" }],
  },
  "biblioteca-atualizada": {
    title: "✅ Livro atualizado com sucesso!",
    message: "As informações do livro foram atualizadas.",
    actions: [{ label: "📚 Voltar à Biblioteca", to: "/biblioteca?gestao=true" }],
  },
  // Bota pra Rodar
  "bicicleta-aprovada": {
    title: "✅ Empréstimo aprovado com sucesso!",
    message: "A bicicleta foi liberada para o usuário.",
    actions: [{ label: "🚴 Voltar ao Bota pra Rodar", to: "/bota-pra-rodar?gestao=true" }],
  },
  "bicicleta-rejeitada": {
    title: "✅ Solicitação rejeitada!",
    message: "A solicitação foi rejeitada e o usuário foi notificado.",
    actions: [{ label: "🚴 Voltar ao Bota pra Rodar", to: "/bota-pra-rodar?gestao=true" }],
  },
  "bicicleta-devolucao": {
    title: "✅ Devolução registrada com sucesso!",
    message: "A bicicleta foi marcada como devolvida no sistema.",
    actions: [{ label: "🚴 Voltar ao Bota pra Rodar", to: "/bota-pra-rodar?gestao=true" }],
  },
  "bicicleta-cadastro": {
    title: "✅ Bicicleta cadastrada com sucesso!",
    message: "A nova bicicleta foi adicionada ao sistema.",
    actions: [{ label: "🚴 Voltar ao Bota pra Rodar", to: "/bota-pra-rodar?gestao=true" }],
  },
  "bicicleta-atualizada": {
    title: "✅ Bicicleta atualizada com sucesso!",
    message: "As informações da bicicleta foram atualizadas.",
    actions: [{ label: "🚴 Voltar ao Bota pra Rodar", to: "/bota-pra-rodar?gestao=true" }],
  },
  // Registro de Empréstimos
  "inventario-aprovado": {
    title: "✅ Empréstimo aprovado com sucesso!",
    message: "O item foi liberado para o usuário.",
    actions: [{ label: "📦 Voltar ao Registro de Empréstimos", to: "/registro-emprestimos?gestao=true" }],
  },
  "inventario-rejeitado": {
    title: "✅ Solicitação rejeitada!",
    message: "A solicitação foi rejeitada e o usuário foi notificado.",
    actions: [{ label: "📦 Voltar ao Registro de Empréstimos", to: "/registro-emprestimos?gestao=true" }],
  },
  "inventario-devolucao": {
    title: "✅ Devolução registrada com sucesso!",
    message: "O item foi marcado como devolvido no sistema.",
    actions: [{ label: "📦 Voltar ao Registro de Empréstimos", to: "/registro-emprestimos?gestao=true" }],
  },
  "inventario-cadastro": {
    title: "✅ Item cadastrado com sucesso!",
    message: "O novo item foi adicionado ao inventário.",
    actions: [{ label: "📦 Voltar ao Registro de Empréstimos", to: "/registro-emprestimos?gestao=true" }],
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
  
  // Personaliza mensagem para empréstimos aprovados automaticamente
  if (slug === "emprestimo-bicicleta-solicitado" && searchParams.get("approved") === "true") {
    page = {
      ...page,
      title: "✅ Empréstimo aprovado automaticamente!",
      message: "Como coordenador de projeto, sua solicitação foi aprovada automaticamente.",
    };
  }

  return <SuccessPage title={page.title} message={page.message} actions={page.actions} />;
}
