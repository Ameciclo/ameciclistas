import { Link } from "@remix-run/react";

type CardProps = {
  title: string; // Nome ou título principal
  description?: string; // Descrição opcional
  imageUrl?: string; // URL da imagem opcional
  linkUrl?: string; // URL do botão de ação
  linkText?: string; // Texto do botão de ação
  className?: string; // Classes CSS adicionais
  badge?: string; // Texto do rótulo (categoria)
  badgeColor?: string; // Cor do rótulo (categoria)
  children?: React.ReactNode; // Para conteúdos adicionais
};

export function Card({
  title,
  description,
  imageUrl,
  linkUrl,
  linkText = "Ver mais",
  className = "",
  badge,
  badgeColor = "gray", // Cor padrão caso não seja passada
  children,
}: CardProps) {
  return (
    <div className={`border p-4 rounded-lg mb-4 ${className}`}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-40 object-cover rounded"
        />
      )}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold">{title}</h4>
        {badge && (
          <span
            className={`text-sm px-2 py-1 rounded-full font-bold`}
            style={{ backgroundColor: badgeColor, color: "white" }}
          >
            {badge}
          </span>
        )}
      </div>
      {description && <p className="mt-2">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
      {linkUrl && (
        <Link to={linkUrl} target="_blank" className="button-full mt-2">
          {linkText}
        </Link>
      )}
    </div>
  );
}

type CardListProps = {
  items: {
    title: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
    linkText?: string;
    badge?: string;
    badgeColor?: string;
  }[]; // Lista de itens para os cartões
  className?: string; // Classes CSS adicionais para o contêiner
};

export function CardList({ items, className = "" }: CardListProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 ${className}`}
    >
      {items.map((item, index) => (
        <Card
          key={index}
          title={item.title}
          description={item.description}
          imageUrl={item.imageUrl}
          linkUrl={item.linkUrl}
          linkText={item.linkText}
          badge={item.badge}
          badgeColor={item.badgeColor}
        />
      ))}
    </div>
  );
}
