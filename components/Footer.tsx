import Link from 'next/link';

const groups = [
  {
    title: 'Khám phá',
    links: [
      ['Bất động sản bán', '/properties?purpose=buy'],
      ['Bất động sản thuê', '/properties?purpose=rent'],
      ['Dự án tuyển chọn', '/properties'],
      ['Biệt thự', '/properties?type=villa'],
    ],
  },
  {
    title: 'Nexus Estate',
    links: [
      ['Về chúng tôi', '/'],
      ['Trở thành Provider', '/provider/onboarding'],
      ['Đăng ký tư vấn', '/signup'],
      ['Đăng nhập', '/signin'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--brand-strong)] text-[var(--text-on-dark)]">
      <div className="mx-auto max-w-[var(--content-max)] px-5 pb-8 pt-14 sm:px-8 lg:px-10 lg:pt-16">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.35fr_.65fr_.65fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-3">
              <svg
                viewBox="0 0 42 42"
                fill="none"
                className="h-9 w-9 text-[var(--brand-accent)]"
                aria-hidden="true"
              >
                <path
                  d="M7 34V16L21 6l14 10v18M13 34V19.5L21 14l8 5.5V34M3 34h36"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M18 34V23h6v11"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              <span>
                <strong className="block font-display text-xl font-normal tracking-[0.04em]">
                  NEXUS
                </strong>
                <small className="block text-[8px] uppercase tracking-[0.28em] text-white/45">
                  Estate Collection
                </small>
              </span>
            </Link>
            <p className="mt-6 text-sm leading-7 text-white/55">
              Nền tảng bất động sản tuyển chọn dành cho những người tìm kiếm giá
              trị sống khác biệt và tài sản trường tồn.
            </p>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-accent)]">
              Kết nối cùng chúng tôi
            </h2>
            <p className="mt-5 text-sm leading-6 text-white/55">
              Nhận bản tin tuyển chọn và những góc nhìn mới nhất về thị trường.
            </p>
            <form className="mt-5 flex border-b border-white/25 focus-within:border-[var(--brand-accent)]">
              <input
                type="email"
                aria-label="Email nhận bản tin"
                placeholder="Email của bạn"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button
                aria-label="Đăng ký nhận bản tin"
                className="px-3 text-[var(--brand-accent)] transition-colors hover:text-white"
              >
                →
              </button>
            </form>
            <p className="mt-6 text-sm text-white/55">
              support@nexusestate.dev
              <br />
              1900 1234
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-7 text-[10px] uppercase tracking-[0.12em] text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nexus Estate. All rights reserved.</p>
          <div className="flex gap-6">
            <Link className="transition-colors hover:text-white/70" href="/">
              Quyền riêng tư
            </Link>
            <Link className="transition-colors hover:text-white/70" href="/">
              Điều khoản
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
