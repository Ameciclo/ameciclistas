import React from "react";

interface ButtonProps {
  isEnabled: boolean;
  onClick?: () => void;
  label: string;
  className?: string;
}

const SubmitButton: React.FC<ButtonProps> = ({ 
  isEnabled, 
  onClick, 
  label, 
  className = "" 
}) => {
  const buttonClass = isEnabled
    ? `button-full ${className}`
    : `button-full button-disabled ${className}`;

  return (
    <button 
      type="submit" 
      className={buttonClass} 
      onClick={isEnabled ? onClick : undefined} 
      disabled={!isEnabled}
    >
      {label}
    </button>
  );
};

export default SubmitButton;
