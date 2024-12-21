import React from "react";

interface FormTitleProps {
    children: React.ReactNode;
    className?: string;
}

const FormTitle: React.FC<FormTitleProps> = ({ children, className = "" }) => {
    return (
        <>
            <h2 className={`text-2xl font-bold text-teal-600 ${className}`}>
                {children}
            </h2>
            <br />
        </>

    );
};

export default FormTitle;
