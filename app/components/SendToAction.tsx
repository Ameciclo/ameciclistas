import React from "react";

interface HiddenInputProps {
  fields: { name: string; value: string }[];
}

const SendToAction: React.FC<HiddenInputProps> = ({ fields }) => {
  return (
    <>
      {fields.map((field, index) => (
        <input
          key={index}
          type="hidden"
          name={field.name}
          value={field.value}
        />
      ))}
    </>
  );
};

export default SendToAction;