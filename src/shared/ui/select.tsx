import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export function Select({
  children,
  className,
  error,
  id,
  label,
  ...props
}: SelectProps) {
  const selectClasses = ["select", error ? "select--error" : null, className]
    .filter(Boolean)
    .join(" ");

  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="select-field">
      {label ? (
        <label className="select-field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      <div className="select-field__control">
        <select
          {...props}
          aria-describedby={errorId}
          aria-invalid={error ? true : undefined}
          className={selectClasses}
          id={id}
        >
          {children}
        </select>

        <span aria-hidden="true" className="select-field__chevron">
          <svg
            fill="none"
            height="16"
            viewBox="0 0 16 16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </span>
      </div>

      {error ? (
        <p className="select-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
