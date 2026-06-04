import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'default' | 'touch';

const variantClass: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy/90',
  secondary: 'bg-white text-navy border border-navy/20 hover:bg-slate-50',
  danger: 'bg-brand-red text-white hover:bg-brand-red/90',
  ghost: 'bg-transparent text-navy hover:bg-slate-100',
};

const sizeClass: Record<Size, string> = {
  default: 'min-h-9 px-4 py-2 text-sm',
  touch: 'min-h-11 px-5 py-3 text-base touch-manipulation',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = 'primary',
  size = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 ${sizeClass[size]} ${variantClass[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
