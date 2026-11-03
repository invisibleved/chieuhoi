export const ROUTE_KEYS = [
  'home',
  'lang-hoi',
  'cau-chuyen',
  'nghe-det-chieu',
  'con-nguoi',
  'san-pham',
  'thu-vien',
  'ket-noi',
] as const

export type RouteKey = (typeof ROUTE_KEYS)[number]

export const ROUTE_LABELS: Record<RouteKey, string> = {
  home: 'Trang chủ',
  'lang-hoi': 'Làng Hới',
  'cau-chuyen': 'Câu chuyện',
  'nghe-det-chieu': 'Nghề dệt chiếu',
  'con-nguoi': 'Con người',
  'san-pham': 'Sản phẩm',
  'thu-vien': 'Thư viện',
  'ket-noi': 'Kết nối',
}

export const ROUTE_PATHS: Record<RouteKey, string> = {
  home: '/',
  'lang-hoi': '/lang-hoi',
  'cau-chuyen': '/cau-chuyen',
  'nghe-det-chieu': '/nghe-det-chieu',
  'con-nguoi': '/con-nguoi',
  'san-pham': '/san-pham',
  'thu-vien': '/thu-vien',
  'ket-noi': '/ket-noi',
}
