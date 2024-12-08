import { Link } from "@remix-run/react";

export default function LinksUteis() {
  const links = [
    { id: 1, nome: "Site da Ameciclo", url: "https://ameciclo.org" },
    { id: 2, nome: '📚 Biciclopedia', url: `http://biciclopedia.ameciclo.org/`},
    { id: 3, nome: '🗂 Drive da Ameciclo', url: `http://drive.ameciclo.org/`},
    { id: 4, nome: '📄 Ver pautas para R.O', url: `http://pautas.ameciclo.org/`},
    { id: 5, nome: '📈 Acompanhar nossos gastos', url: `http://transparencia.ameciclo.org/`},
    { id: 6, nome: '🏠 Ocupar a sede', url: `http://ocupe.ameciclo.org/`},
    { id: 7, nome: '🎥 Requisitar equipamento', url: `http://equipamento.ameciclo.org/`},
  ];

  return (
    <div className="container mx-auto p-4 flex flex-col">
      <h2 className="text-2xl font-bold text-teal-600 text-center">🔗 Links Úteis</h2>
      <div className="mt-4 flex flex-col">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            className="button-full text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.nome}
          </a>
        ))}
      </div>
      <br />
      <Link to="/" className="button-secondary-full text-center">
        ⬅️ Voltar
      </Link>
    </div>
  );
}
