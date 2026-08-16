import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, error, id, label, ...props }: InputProps) {
  const inputClasses = ["input", error ? "input--error" : null, className]
    .filter(Boolean)
    .join(" ");

  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="input-field">
      {label ? (
        <label className="input-field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      <input
        {...props}
        aria-describedby={errorId}
        aria-invalid={error ? true : undefined}
        className={inputClasses}
        id={id}
      />

      {error ? (
        <p className="input-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
