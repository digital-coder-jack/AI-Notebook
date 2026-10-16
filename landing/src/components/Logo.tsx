interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-9 w-9' }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="AI Notebook"
      className={className}
      width={36}
      height={36}
    />
  );
}

export function LogoMark({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt=""
      aria-hidden="true"
      className={className}
      width={32}
      height={32}
    />
  );
}
