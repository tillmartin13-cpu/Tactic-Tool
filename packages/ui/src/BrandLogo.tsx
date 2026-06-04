interface BrandLogoProps {
  /** White variant for dark header */
  variant?: 'header' | 'mark';
  className?: string;
}

export function BrandLogo({ variant = 'header', className = '' }: BrandLogoProps) {
  if (variant === 'mark') {
    return (
      <img
        src="/favicon.svg"
        alt="Sportograf"
        className={`h-8 w-8 object-contain ${className}`}
      />
    );
  }

  return (
    <img
      src="/sportograf-logo.svg"
      alt="Sportograf"
      className={`h-8 w-auto max-w-[120px] object-contain object-left ${className}`}
    />
  );
}
