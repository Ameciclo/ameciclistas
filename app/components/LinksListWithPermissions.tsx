import React from "react";
import { Link } from "@remix-run/react";
import { UserCategory } from "~/utils/types";
import { isAuth } from "~/hooks/isAuthorized";

// Interface para cada link
interface LinkItem {
  to: string;
  label: string;
  icon: string;
  requiredPermission: UserCategory;
}

// Interface para os props
interface LinkListProps {
  links: LinkItem[];
  userPermissions: UserCategory[];
}

const LinkListWithPermissions: React.FC<LinkListProps> = ({ links, userPermissions }) => {
  return (
    <div className="mt-6">
      {links.map(({ to, label, icon, requiredPermission }, index) => (
        <Link key={index} to={to}>
          <button
            className={`button-full ${
              !isAuth(userPermissions, requiredPermission) ? "button-disabled" : ""
            }`}
            disabled={!isAuth(userPermissions, requiredPermission)}
          >
            {icon} {label}
          </button>
        </Link>
      ))}
    </div>
  );
};

export default LinkListWithPermissions;
