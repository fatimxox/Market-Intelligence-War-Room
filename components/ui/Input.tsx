import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-primary-text mb-1">{label}</label>}
      <input
        id={id}
        className="w-full bg-background border border-panel-border rounded-md px-3 py-2 text-primary-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
        {...props}
      />
    </div>
  );
};

export default Input;
