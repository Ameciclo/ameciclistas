import { Link } from "@remix-run/react";
import { BackButton } from "./CommonButtons";

interface SuccessPageProps {
  title: string; // Título principal
  message?: string; // Mensagem opcional
  actions: {
    label: string; // Texto do botão
    to?: string; // Link de destino (opcional, se for navegação interna)
    onClick?: () => void; // Função opcional para ações personalizadas
  }[];
}

export default function SuccessPage({
  title,
  message,
  actions,
}: SuccessPageProps) {
  return (
    <div className="container">
      <h2 className="text-primary">{title}</h2>
      {message && <p>{message}</p>}

      <div className="button-group">
        <br />
        <br />
        {actions.map((action, index) =>
          action.to ? (
            <Link key={index} to={action.to}>
              <button className="button-full">{action.label}</button>
            </Link>
          ) : (
            <BackButton />
          )
        )}
      </div>
    </div>
  );
}
