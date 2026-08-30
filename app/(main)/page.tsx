import Image from 'next/image';
import Link from 'next/link';

type CuratedProperty = {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  badge: string;
};

const properties: CuratedProperty[] = [
  {
    id: 'penthouse-river-view',
    title: 'The Riverfront Penthouse',
    location: 'Thảo Điền, TP. Hồ Chí Minh',
    price: '48 tỷ',
    image: '/images/properties/penthouse-saigon.webp',
    area: 286,
    bedrooms: 4,
    bathrooms: 4,
    badge: 'Độc quyền',
  },
  {
    id: 'pine-villa-dalat',
    title: 'Pine House Private Estate',
    location: 'Phường 3, Đà Lạt',
    price: '32 tỷ',
    image: '/images/properties/villa-dalat.webp',
    area: 420,
    bedrooms: 5,
    bathrooms: 5,
    badge: 'Mới ra mắt',
  },
  {
    id: 'ocean-residence-danang',
    title: 'The Azure Ocean Residence',
    location: 'Sơn Trà, Đà Nẵng',
    price: 'Từ 39 tỷ',
    image: '/images/properties/residence-danang.webp',
    area: 368,
    bedrooms: 4,
    bathrooms: 5,
    badge: 'Tuyển chọn',
  },
];

const collections = [
  { label: 'Căn hộ hạng sang', count: '128 bất động sản', type: 'apartment' },
  { label: 'Biệt thự nghỉ dưỡng', count: '84 bất động sản', type: 'villa' },
  { label: 'Nhà phố trung tâm', count: '96 bất động sản', type: 'house' },
  { label: 'Bất động sản ven biển', count: '52 bất động sản', type: 'resort' },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PropertyCard({ property }: { property: CuratedProperty }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="property-card group block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#d8d3c8]">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071b1b]/60 via-transparent to-transparent" />
        <span className="absolute left-5 top-5 rounded-full border border-white/40 bg-[#071b1b]/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          {property.badge}
        </span>
        <button
          type="button"
          aria-label={`Lưu ${property.title}`}
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-[#071b1b]/45 text-white backdrop-blur-md transition hover:bg-white hover:text-[#0b2625]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 00-.1-7.8z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
        <div className="absolute bottom-5 left-5 text-white">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/70">
            Giá chào bán
          </p>
          <p className="mt-1 font-display text-2xl">{property.price}</p>
        </div>
      </div>
      <div className="border-x border-b border-[#ddd8cd] bg-white px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a7b4f]">
          {property.location}
        </p>
        <h3 className="mt-2 font-display text-2xl text-[#102f2d] transition-colors group-hover:text-[#9a7b4f]">
          {property.title}
        </h3>
        <div className="mt-5 flex items-center gap-5 border-t border-[#ece8df] pt-4 text-xs text-[#596967]">
          <span>{property.area} m²</span>
          <span>{property.bedrooms} phòng ngủ</span>
          <span>{property.bathrooms} phòng tắm</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-[#f7f5ef] text-[#102f2d]">
      <section className="relative min-h-[760px] bg-[#071b1b] text-white lg:min-h-[820px]">
        <Image
          src="/images/hero-villa.webp"
          alt="Biệt thự hiện đại cao cấp bên hồ bơi"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,22,22,.94)_0%,rgba(4,22,22,.72)_35%,rgba(4,22,22,.15)_72%,rgba(4,22,22,.1)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071b1b]/70 via-transparent to-[#071b1b]/20" />
        <div className="relative mx-auto flex min-h-[760px] max-w-[1440px] items-center px-5 pb-28 pt-28 sm:px-8 lg:min-h-[820px] lg:px-14">
          <div className="max-w-3xl animate-fade-up">
            <div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d6b982]">
              <span className="h-px w-10 bg-[#d6b982]" />
              Tuyển chọn bất động sản tinh hoa
            </div>
            <h1 className="font-display text-[clamp(3.5rem,7vw,7.2rem)] leading-[0.9] tracking-[-0.045em]">
              Nơi không gian
              <span className="block italic text-[#dbc08e]">
                trở thành di sản.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Khám phá bộ sưu tập những không gian sống đặc tuyển, nơi kiến
              trúc, vị trí và giá trị trường tồn gặp nhau.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/properties"
                className="inline-flex items-center gap-4 bg-[#c7a66b] px-7 py-4 text-xs font-bold uppercase tracking-[0.15em] text-[#071b1b] transition hover:bg-[#dfc48f]"
              >
                Khám phá bộ sưu tập <ArrowIcon />
              </Link>
              <Link
                href="#featured"
                className="inline-flex items-center gap-3 px-4 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 transition hover:text-white"
              >
                Xem tuyệt tác nổi bật
              </Link>
            </div>
          </div>
        </div>

        <form
          action="/properties"
          className="absolute bottom-0 left-1/2 z-10 w-[calc(100%-2.5rem)] max-w-[1328px] -translate-x-1/2 translate-y-1/2 bg-white p-3 text-[#102f2d] shadow-[0_24px_70px_rgba(0,0,0,.2)] lg:flex lg:items-stretch lg:p-0"
        >
          <label className="block flex-1 border-b border-[#e4dfd5] px-5 py-4 lg:border-b-0 lg:border-r lg:px-7 lg:py-5">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a7b4f]">
              Khu vực
            </span>
            <select
              name="city"
              defaultValue=""
              className="mt-2 w-full appearance-none bg-transparent text-sm outline-none"
            >
              <option value="">Tất cả vị trí</option>
              <option>TP. Hồ Chí Minh</option>
              <option>Hà Nội</option>
              <option>Đà Nẵng</option>
              <option>Đà Lạt</option>
            </select>
          </label>
          <label className="block flex-1 border-b border-[#e4dfd5] px-5 py-4 lg:border-b-0 lg:border-r lg:px-7 lg:py-5">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a7b4f]">
              Loại hình
            </span>
            <select
              name="type"
              defaultValue=""
              className="mt-2 w-full appearance-none bg-transparent text-sm outline-none"
            >
              <option value="">Mọi loại hình</option>
              <option value="apartment">Căn hộ</option>
              <option value="villa">Biệt thự</option>
              <option value="house">Nhà phố</option>
            </select>
          </label>
          <label className="block flex-1 px-5 py-4 lg:px-7 lg:py-5">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a7b4f]">
              Khoảng giá
            </span>
            <select
              name="price"
              defaultValue=""
              className="mt-2 w-full appearance-none bg-transparent text-sm outline-none"
            >
              <option value="">Không giới hạn</option>
              <option value="10-20">10 – 20 tỷ</option>
              <option value="20-50">20 – 50 tỷ</option>
              <option value="50+">Trên 50 tỷ</option>
            </select>
          </label>
          <button className="flex min-h-16 items-center justify-center gap-3 bg-[#0c302e] px-9 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#17423f] lg:min-w-52">
            Tìm kiếm <ArrowIcon />
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-44 sm:px-8 lg:px-14 lg:pb-28 lg:pt-36">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
          <div>
            <p className="eyebrow">Bộ sưu tập riêng</p>
            <h2 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Sống theo cách
              <br />
              <span className="italic text-[#9a7b4f]">chỉ riêng bạn.</span>
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#66726f] lg:justify-self-end">
            Mỗi ngôi nhà là một câu chuyện. Chúng tôi tuyển chọn những bất động
            sản có ngôn ngữ kiến trúc riêng, pháp lý minh bạch và tiềm năng giá
            trị bền vững.
          </p>
        </div>
        <div className="mt-14 grid gap-px bg-[#d8d2c6] sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((item, index) => (
            <Link
              key={item.type}
              href={`/properties?type=${item.type}`}
              className="group bg-[#f7f5ef] px-7 py-8 transition hover:bg-[#0c302e] hover:text-white"
            >
              <span className="font-display text-3xl text-[#b69760]">
                0{index + 1}
              </span>
              <h3 className="mt-10 font-display text-2xl">{item.label}</h3>
              <div className="mt-4 flex items-center justify-between text-xs text-[#7d8784] group-hover:text-white/60">
                <span>{item.count}</span>
                <ArrowIcon />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="featured" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Đặc tuyển tháng này</p>
              <h2 className="mt-5 font-display text-5xl tracking-tight sm:text-6xl">
                Những tuyệt tác{' '}
                <span className="italic text-[#9a7b4f]">đang chờ.</span>
              </h2>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-[#173b38]"
            >
              Xem tất cả <ArrowIcon />
            </Link>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <p className="mt-8 text-center text-xs leading-5 text-[#8a918f]">
            Danh sách trên là dữ liệu minh họa tuyển chọn. Thông tin API bất
            động sản sẽ được kết nối khi backend cung cấp controller chính thức.
          </p>
        </div>
      </section>

      <section className="bg-[#0a2928] text-white">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="px-5 py-20 sm:px-8 lg:px-14 lg:py-28">
            <p className="eyebrow !text-[#d0b277]">Dịch vụ chuyên biệt</p>
            <h2 className="mt-6 max-w-xl font-display text-5xl leading-[1.02] sm:text-6xl">
              Am hiểu thị trường.
              <br />
              <span className="italic text-[#d0b277]">Tận tâm với bạn.</span>
            </h2>
            <p className="mt-7 max-w-lg text-sm leading-7 text-white/60">
              Từ định giá, pháp lý đến thương lượng và quản lý tài sản, đội ngũ
              chuyên gia đồng hành xuyên suốt để mỗi quyết định của bạn đều vững
              vàng.
            </p>
            <Link
              href="/signup"
              className="mt-10 inline-flex items-center gap-4 border-b border-[#d0b277] pb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#e1c996]"
            >
              Kết nối chuyên gia <ArrowIcon />
            </Link>
          </div>
          <div className="grid grid-cols-2 border-l border-white/10">
            {[
              ['15+', 'Năm kinh nghiệm'],
              ['1.200+', 'Giao dịch thành công'],
              ['98%', 'Khách hàng hài lòng'],
              ['24/7', 'Đồng hành riêng tư'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="flex min-h-48 flex-col justify-end border-b border-r border-white/10 p-7 sm:min-h-60 lg:p-10"
              >
                <strong className="font-display text-4xl font-normal text-[#dec58f] sm:text-5xl">
                  {value}
                </strong>
                <span className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/50">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#c7a66b] px-5 py-16 text-[#092725] sm:px-8 lg:py-20">
        <div className="mx-auto flex max-w-[1328px] flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]">
              Dành cho chủ sở hữu
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">
              Tài sản của bạn xứng đáng được kể đúng cách.
            </h2>
          </div>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex shrink-0 items-center justify-center gap-4 bg-[#092725] px-7 py-4 text-xs font-bold uppercase tracking-[0.15em] text-white"
          >
            Đăng tài sản <ArrowIcon />
          </Link>
        </div>
      </section>
    </div>
  );
}
