import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const variantClass: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy/90',
  secondary: 'bg-white text-navy border border-navy/20 hover:bg-slate-50',
  danger: 'bg-brand-red text-white hover:bg-brand-red/90',
  ghost: 'bg-transparent text-navy hover:bg-slate-100',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
