import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({
  className,
  error,
  id,
  label,
  ...props
}: TextareaProps) {
  const textareaClasses = [
    "textarea",
    error ? "textarea--error" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="textarea-field">
      {label ? (
        <label className="textarea-field__label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      <textarea
        {...props}
        aria-describedby={errorId}
        aria-invalid={error ? true : undefined}
        className={textareaClasses}
        id={id}
      />

      {error ? (
        <p className="textarea-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
