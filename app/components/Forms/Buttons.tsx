// components/CommonButtons.tsx
import React from "react";
import { Link } from "@remix-run/react";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/utils/isAuthorized";

// Interface para cada botão (item)
export interface ButtonItem {
  /** Se informado, o botão será renderizado como Link */
  to?: string;
  label: string;
  icon?: string;
  requiredPermission?: UserCategory;
  /** Se true e o usuário não tiver permissão, o botão não será renderizado */
  hide?: boolean;
  /** Callback para cliques no botão */
  onClick?: () => void;
  /** Tipo do botão: "button", "submit" ou "reset" */
  type?: "button" | "submit" | "reset";
  /** Classes CSS adicionais */
  className?: string;
}

// Props para o botão único que verifica permissões
export interface GenericButtonProps extends ButtonItem {
  userPermissions: UserCategory[];
}

/**
 * Componente genérico de botão que trata:
 * - Renderização condicional com base em permissões;
 * - Renderização como Link (se a propriedade `to` for informada);
 * - Tipo do botão (útil para submissão);
 * - Classes customizadas.
 */
export const GenericButton: React.FC<GenericButtonProps> = ({
  to,
  label,
  icon,
  requiredPermission,
  hide = false,
  onClick,
  type = "button",
  className = "",
  userPermissions,
}) => {
  const permitted = isAuth(
    userPermissions,
    requiredPermission || UserCategory.ANY_USER
  );

  // Se o botão estiver marcado para "ocultar" quando sem permissão e o usuário não tiver acesso, não renderiza.
  if (hide && !permitted) {
    return null;
  }

  const buttonClass = `button-full ${
    !permitted ? "button-disabled" : ""
  } ${className}`;

  const buttonElement = (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={!permitted}
    >
      {icon && <span>{icon} </span>}
      {label}
    </button>
  );

  return to ? <Link to={to}>{buttonElement}</Link> : buttonElement;
};

// Props específicas para o SubmitButton
export interface SubmitButtonProps extends Omit<GenericButtonProps, "type"> {
  isEnabled: boolean;
}

/**
 * Botão de submissão que utiliza o GenericButton com type="submit".
 * Além disso, permite configurar se o botão está habilitado.
 */
export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isEnabled,
  onClick,
  label,
  className = "",
  userPermissions,
  requiredPermission,
  ...rest
}) => {
  const buttonClass = isEnabled
    ? `button-full ${className}`
    : `button-full button-disabled ${className}`;

  return (
    <GenericButton
      type="submit"
      label={label}
      onClick={onClick}
      className={buttonClass}
      userPermissions={userPermissions}
      requiredPermission={requiredPermission}
      {...rest}
    />
  );
};

// Lista de botões com verificação de permissão para cada item
export interface ButtonListProps {
  links: ButtonItem[];
  userPermissions: UserCategory[];
}

/**
 * Renderiza uma lista de botões usando o GenericButton.
 */
export const ButtonsListWithPermissions: React.FC<ButtonListProps> = ({
  links,
  userPermissions,
}) => {
  return (
    <div className="mt-6">
      {links.map((buttonItem, index) => (
        <GenericButton
          key={index}
          {...buttonItem}
          userPermissions={userPermissions}
        />
      ))}
    </div>
  );
};

// Botão de "Voltar"
export const BackButton = () => {
  return (
    <Link to="/" className="button-secondary-full text-center">
      ⬅️ Voltar
    </Link>
  );
};
