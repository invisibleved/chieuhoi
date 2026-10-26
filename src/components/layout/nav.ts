export const NAV_ITEMS: { n: string; label: string; href: string }[] = [
  { n: '01', label: 'Làng Hới', href: '/lang-hoi' },
  { n: '02', label: 'Câu chuyện', href: '/cau-chuyen' },
  { n: '03', label: 'Nghề dệt chiếu', href: '/nghe-det-chieu' },
  { n: '04', label: 'Con người', href: '/con-nguoi' },
  { n: '05', label: 'Sản phẩm', href: '/san-pham' },
  { n: '06', label: 'Thư viện', href: '/thu-vien' },
]

export const CONNECT_HREF = '/ket-noi'

/** Trang hiện tại khớp chính nó và mọi trang con. */
export const isCurrent = (pathname: string | null, href: string) =>
  !!pathname && (pathname === href || pathname.startsWith(`${href}/`))
