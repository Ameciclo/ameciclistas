import { Link } from "@remix-run/react";

export const BackButton = () => {
  return (
    <Link to="/" className="button-secondary-full text-center">
      ⬅️ Voltar
    </Link>
  );
};