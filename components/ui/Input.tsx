import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3.5 text-gray-500 pointer-events-none">{icon}</span>}
        <input
          id={id}
          ref={ref}
          className={`w-full bg-secondary border border-panel-border rounded-md py-2 text-primary-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition duration-200 ${icon ? 'pl-10 pr-3' : 'px-3'}`}
          {...props}
        />
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
