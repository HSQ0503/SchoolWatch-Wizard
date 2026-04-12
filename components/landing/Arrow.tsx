type ArrowProps = {
  className?: string;
};

export default function Arrow({ className = "" }: ArrowProps) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="14"
      viewBox="0 0 16 14"
      fill="none"
      className={`inline-block translate-y-[1px] transition-transform duration-200 group-hover:translate-x-1 ${className}`}
    >
      <path
        d="M1 7h14m0 0L9 1m6 6l-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
