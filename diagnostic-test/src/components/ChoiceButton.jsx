import { Check } from 'lucide-react';

export default function ChoiceButton({ children, selected, multiple, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-lg border bg-white p-3.5 text-left text-[15px] leading-snug transition sm:p-4 sm:text-base ${
        selected
          ? 'border-primary shadow-soft ring-2 ring-primary/15'
          : 'border-line hover:border-primary/70'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border ${
          multiple ? 'rounded-md' : 'rounded-full'
        } ${selected ? 'border-primary bg-primary text-white' : 'border-line bg-white'}`}
      >
        {selected ? <Check size={16} strokeWidth={3} /> : null}
      </span>
      <span>{children}</span>
    </button>
  );
}
