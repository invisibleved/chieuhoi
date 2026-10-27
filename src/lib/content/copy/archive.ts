// Chữ cố định của /thu-vien, chép nguyên văn từ artboard Thư viện (desktop và mobile).
// Chuỗi khác nhau giữa hai bản lưu thành { desktop, mobile }.
import type { ApplyMode } from './applyMode'

export const archiveCopy = {
  breadcrumb: { home: 'Trang chủ', current: 'Thư viện' },
  stats: { total: 'TƯ LIỆU', verified: 'ĐÃ XÁC MINH NGUỒN' },
  filter: { label: 'Lọc theo nhóm', all: 'Tất cả', eraLabel: 'Thời kỳ', eraAll: 'Mọi thời kỳ' },
  count: '{n} tư liệu',
  noOld: ' · chưa có ảnh xưa',
  docLabel: 'TL',
  open: 'Mở ảnh: {title}',
  empty: {
    title: 'Chưa có tư liệu trong nhóm này',
    body: {
      desktop:
        'Ảnh xưa, giấy tờ cũ, ký ức của các gia đình làng Hới là phần quý nhất của thư viện, và hiện chưa có. Nếu gia đình bạn còn giữ, hãy góp cùng làng.',
      mobile: 'Nếu gia đình bạn còn giữ ảnh cũ, hãy góp cùng làng.',
    },
    action: { href: '/ket-noi', label: 'Góp tư liệu' },
  },
  lightbox: {
    label: 'Xem ảnh',
    close: 'Đóng',
    prev: 'Ảnh trước',
    next: 'Ảnh tiếp',
    position: '{i} / {n}',
    keys: ' · ← → để chuyển ảnh',
    swipe: 'Vuốt ngang để chuyển ảnh',
    meta: { takenAt: 'Thời gian', photographer: 'Người chụp', source: 'Nguồn', rights: 'Quyền dùng', related: 'Liên quan' },
  },
  // Nhãn quyền dùng của tư liệu chưa được phép (R14); "Được phép" lấy từ option của collection.
  rights: {
    unknown: { desktop: 'Chưa xin phép · không đăng công khai', mobile: 'Chưa xin phép' },
    restricted: { desktop: 'Hạn chế · không đăng công khai', mobile: 'Hạn chế' },
  },
  cta: {
    title: 'Nhà bạn còn giữ ảnh cũ của làng?',
    body: 'Một tấm ảnh cưới trải chiếu, một buổi phơi cói, một góc nhà có khung dệt. Chúng tôi sẽ ghi công và hỏi ý bạn trước khi đăng.',
    action: { href: '/ket-noi', label: 'Góp tư liệu' },
  },
} as const

export type ArchiveCopyView = ApplyMode<typeof archiveCopy>
