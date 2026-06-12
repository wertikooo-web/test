export default function Button({
  as: Component = 'button',
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-[#2948b6]',
    secondary: 'bg-white text-ink border border-line hover:border-primary',
    danger: 'bg-rose text-white hover:bg-[#bd3159]',
  };

  return (
    <Component
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
