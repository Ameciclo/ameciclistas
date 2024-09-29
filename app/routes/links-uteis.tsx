import { Link } from "@remix-run/react";

export default function LinksUteis() {
  const links = [
    { id: 1, nome: "Site da Ameciclo", url: "https://ameciclo.org" },
    { id: 2, nome: "Documentação do Telegram", url: "https://telegram.org" },
    { id: 3, nome: "Guia de Mobilidade Urbana", url: "https://guia-mobilidade.org" },
  ];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-teal-600">🔗 Links Úteis</h2>
      <div className="mt-4">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            className="button-full"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.nome}
          </a>
        ))}
      </div>
      <Link to="/" className="button-secondary-full">
        ⬅️ Voltar
      </Link>
    </div>
  );
}
