import React, { ReactNode } from "react";

interface FormGroupProps {
  label: string;
  children: ReactNode;
}

const FormGroup: React.FC<FormGroupProps> = ({ label, children }) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
};

export default FormGroup;
