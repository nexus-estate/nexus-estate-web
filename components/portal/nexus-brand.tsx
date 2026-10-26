export function NexusBrand({ dark = false }: { dark?: boolean }) {
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
          Estate Collection
        </small>
      </span>
    </span>
  );
}
