import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[#f7f5ef] lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden bg-[#071b1b] text-white lg:block">
        <Image
          src="/images/hero-villa.webp"
          alt="Biệt thự cao cấp thuộc bộ sưu tập Nexus Estate"
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,24,23,.35),rgba(4,24,23,.25)_45%,rgba(4,24,23,.92))]" />
        <Link
          href="/"
          className="absolute left-12 top-10 flex items-center gap-3"
        >
          <svg
            viewBox="0 0 42 42"
            fill="none"
            className="h-10 w-10 text-[#d2b477]"
            aria-hidden="true"
          >
            <path
              d="M7 34V16L21 6l14 10v18M13 34V19.5L21 14l8 5.5V34M3 34h36"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path d="M18 34V23h6v11" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span>
            <strong className="block font-display text-2xl font-normal leading-none tracking-[.04em]">
              NEXUS
            </strong>
            <small className="mt-1 block text-[8px] font-semibold uppercase tracking-[.36em] text-white/60">
              Estate Collection
            </small>
          </span>
        </Link>
        <div className="absolute bottom-14 left-12 right-12 max-w-2xl">
          <div className="mb-6 h-px w-12 bg-[#d2b477]" />
          <blockquote className="font-display text-4xl leading-tight xl:text-5xl">
            “Một ngôi nhà đẹp không chỉ được nhìn thấy. Nó được{' '}
            <span className="italic text-[#dcc18c]">cảm nhận.</span>”
          </blockquote>
          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[.22em] text-white/55">
            Nexus Private Collection · Việt Nam
          </p>
        </div>
      </section>
      <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <Link
          href="/"
          className="absolute left-5 top-6 flex items-center gap-2 text-[#173b38] lg:hidden"
        >
          <svg
            viewBox="0 0 42 42"
            fill="none"
            className="h-8 w-8 text-[#a4834d]"
            aria-hidden="true"
          >
            <path
              d="M7 34V16L21 6l14 10v18M13 34V19.5L21 14l8 5.5V34M3 34h36"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
          <span className="font-display text-xl tracking-wide">NEXUS</span>
        </Link>
        <Link
          href="/"
          className="absolute right-5 top-7 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#6e7976] transition hover:text-[#9a7b4f] sm:right-10 lg:right-12"
        >
          Về trang chủ <span aria-hidden="true">→</span>
        </Link>
        <div className="w-full max-w-[440px]">{children}</div>
      </section>
    </main>
  );
}
