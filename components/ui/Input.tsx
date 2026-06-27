import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-black">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
