import React from "react";
import { Link } from "@remix-run/react";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";

// Interface para cada link
interface ButtonItem {
  to: string;
  label: string;
  icon?: string;
  requiredPermission?: UserCategory; // Torna o campo opcional
}

// Interface para os props
interface ButtonListProps {
  links: ButtonItem[];
  userPermissions: UserCategory[];
}

export const ButtonsListWithPermissions: React.FC<ButtonListProps> = ({
  links,
  userPermissions,
}) => {
  return (
    <div className="mt-6">
      {links.map(({ to, label, icon, requiredPermission }, index) => (
        <Link key={index} to={to}>
          <button
            className={`button-full ${
              !isAuth(
                userPermissions,
                requiredPermission || UserCategory.ANY_USER
              )
                ? "button-disabled"
                : ""
            }`}
            disabled={
              !isAuth(
                userPermissions,
                requiredPermission || UserCategory.ANY_USER
              )
            }
          >
            {icon} {label}
          </button>
        </Link>
      ))}
    </div>
  );
};

export const BackButton = () => {
  return (
    <Link to="/" className="button-secondary-full text-center">
      ⬅️ Voltar
    </Link>
  );
};