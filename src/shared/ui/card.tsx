import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "muted" | "elevated";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: CardVariant;
};

export function Card({
  children,
  className,
  variant = "default",
  ...props
}: CardProps) {
  const classes = ["card", `card--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
