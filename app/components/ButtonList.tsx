import React from "react";
import Button from "./Button";
import { ButtonListProps } from "~/utils/types";

const ButtonList: React.FC<ButtonListProps> = ({ buttons }) => {
  return (
    <div className="button-group">
      {buttons.map((button, index) => (
        <Button
          key={index}
          label={button.label}
          onClick={button.onClick}
          type={button.type}
          disabled={button.disabled}
        />
      ))}
    </div>
  );
};

export default ButtonList;
