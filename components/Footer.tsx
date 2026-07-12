import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-blue-600">
              <svg className="h-6 w-6" viewBox="0 0 28 28" fill="currentColor">
                <path d="M14 2L2 12h3v10h7v-6h4v6h7V12h3L14 2z" />
              </svg>
              Nexus Estate
            </Link>
            <p className="mt-3 text-sm text-gray-600">
              Nền tảng bất động sản thông minh, kết nối người mua, người bán và môi giới.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Khám phá</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/properties" className="text-sm text-gray-600 hover:text-blue-600">Nhà đất bán</Link></li>
              <li><Link href="/properties?purpose=rent" className="text-sm text-gray-600 hover:text-blue-600">Nhà đất cho thuê</Link></li>
              <li><Link href="/properties?type=apartment" className="text-sm text-gray-600 hover:text-blue-600">Căn hộ</Link></li>
              <li><Link href="/properties?type=house" className="text-sm text-gray-600 hover:text-blue-600">Nhà phố</Link></li>
              <li><Link href="/properties?type=land" className="text-sm text-gray-600 hover:text-blue-600">Đất nền</Link></li>
            </ul>
          </div>

          {/* For Broker */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Dành cho môi giới</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/signup" className="text-sm text-gray-600 hover:text-blue-600">Đăng ký tài khoản</Link></li>
              <li><Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Quản lý tin đăng</Link></li>
              <li><Link href="/dashboard/listings/new" className="text-sm text-gray-600 hover:text-blue-600">Đăng tin mới</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Hỗ trợ</h3>
            <ul className="mt-3 space-y-2">
              <li><span className="text-sm text-gray-600">Email: support@nexusestate.dev</span></li>
              <li><span className="text-sm text-gray-600">Hotline: 1900 1234</span></li>
              <li><span className="text-sm text-gray-600">TP. Hồ Chí Minh, Việt Nam</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Nexus Estate. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}