export function NexusBrand({
  dark = false,
  marketplace = false,
  providerPortal = false,
}: {
  dark?: boolean;
  marketplace?: boolean;
  providerPortal?: boolean;
}) {
  if (marketplace)
    return (
      <span className="inline-flex items-center gap-3">
        <svg
          width="38"
          height="38"
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 32 13 9c.6-2.5 3.3-2.6 4.5-.3L27 31"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m27 31 6-23"
            stroke="#86c79b"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="m21 17 6 14 3-11"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          <strong className="block text-[21px] font-bold leading-tight tracking-[-.04em]">
            Nexus Estate
          </strong>
          <small className="block text-[8px] font-medium uppercase tracking-[.18em]">
            Real Estate Marketplace
          </small>
        </span>
      </span>
    );
  return (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-md)] text-lg font-semibold ${dark ? 'bg-[var(--brand-accent-soft)] text-[var(--brand)]' : 'bg-[var(--brand)] text-white'}`}
      >
        N
      </span>
      <span>
        <strong
          className={`block text-base font-semibold tracking-tight ${dark ? 'text-white' : 'text-[var(--brand)]'}`}
        >
          Nexus Estate
        </strong>
        <small
          className={`block text-[9px] font-semibold uppercase tracking-[.18em] ${dark ? 'text-white/55' : 'text-[var(--text-subtle)]'}`}
        >
          {providerPortal ? 'Provider Portal' : 'Estate Collection'}
        </small>
      </span>
    </span>
  );
}
