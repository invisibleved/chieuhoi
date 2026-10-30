// Chữ cố định của /lang-hoi, chép nguyên văn từ VillagePage.dc.html và VillageMobile.dc.html.
// `cite` là sourceId; số [n] do component đánh theo thứ tự nguồn của trang (R9).
// Dữ kiện (bảng thông tin, tổ nghề, vị trí, di sản) nằm trong CMS; ở đây chỉ giữ khung rỗng, pages.ts lấp vào.
// Nhánh `preview` là ghi chú quy trình, chỉ hiện ở bản xem trước (R4).
// Nhãn liên kết lưu không kèm "→": LinkArrow tự thêm mũi tên.
import type { CitedText } from '../pageFacts'
import type { ApplyMode } from './applyMode'
import { docLabel } from './docLabel'

export const villageCopy = {
  breadcrumb: { label: 'Đường dẫn', home: 'Trang chủ', current: 'Làng Hới' },
  // Nhãn mã tư liệu dưới ảnh đầu trang: desktop trong khung ảnh, mobile là dòng chữ.
  hero: { docLabel },
  founder: {
    eyebrow: 'TỔ NGHỀ',
    title: 'Phạm Đôn Lễ, ông Trạng Chiếu.',
    // Lấp từ CMS ở pages.ts.
    paragraphs: [] as { parts: CitedText[] }[],
    // Một đoạn gồm các câu, mỗi câu có chú thích riêng.
    conflict: {
      label: 'CÁC NGUỒN CHƯA THỐNG NHẤT',
      parts: [] as CitedText[], // lấp từ CMS ở pages.ts
      preview: { closing: { desktop: null, mobile: null } as { desktop: string | null; mobile: string | null } }, // lấp từ CMS ở pages.ts
    },
    // Chỉ có ở artboard desktop.
    noPortrait: { desktop: null, mobile: null } as { desktop: string | null; mobile: string | null }, // lấp từ CMS ở pages.ts
  },
  timeline: {
    eyebrow: 'DÒNG THỜI GIAN',
    title: 'Năm trăm năm, kể theo từng mốc.',
    legendLabel: { desktop: 'Chú giải độ tin cậy', mobile: 'Chú giải' },
    listLabel: 'Các mốc',
    confidence: { press: 'Có nguồn báo chí', oral: 'Truyền khẩu', pending: 'Chờ xác minh' },
    sourceLabel: { desktop: 'NGUỒN · ', mobile: 'Nguồn: ' },
    prev: 'Mốc trước',
    next: 'Mốc sau',
    // Chỉ có ở artboard desktop.
    hint: {
      desktop: 'Hình dạng điểm mốc cho biết độ tin cậy, không chỉ dựa vào màu. Mọi mốc dùng được bằng bàn phím và chạm.',
      mobile: null,
    },
  },
  location: {
    eyebrow: 'VỊ TRÍ',
    title: 'Làng bên sông Luộc.',
    body: { text: '', cite: [] as string[] }, // lấp từ CMS ở pages.ts
    preview: {
      note: { desktop: null, mobile: null } as { desktop: string | null; mobile: string | null }, // lấp từ CMS ở pages.ts
      map: {
        label: 'BẢN ĐỒ VỊ TRÍ',
        title: 'Chờ dữ liệu địa lý chính xác',
        body: {
          desktop: 'Bản đồ đơn giản hoá: làng, sông Luộc, sông Hồng và đền thờ tổ nghề. Chỉ vẽ khi có toạ độ đã kiểm chứng.',
          mobile: null,
        },
      },
    },
  },
  // Cả mục chỉ có ở artboard desktop: mọi chữ là { desktop, mobile: null }.
  life: {
    eyebrow: { desktop: 'ĐỜI SỐNG LÀNG', mobile: null },
    title: { desktop: 'Nhịp làng, nhịp chiếu.', mobile: null },
    link: { label: { desktop: 'Xem thêm trong Thư viện', mobile: null }, href: '/thu-vien' },
  },
  heritage: {
    eyebrow: 'DI SẢN HÔM NAY',
    title: 'Nghề xưa vẫn sống trong nhịp đời hôm nay.',
    paragraphs: [] as CitedText[], // lấp từ CMS ở pages.ts
    link: { label: 'Xem quy trình dệt chiếu', href: '/nghe-det-chieu' },
    preview: { note: { desktop: null, mobile: null } as { desktop: string | null; mobile: string | null } }, // lấp từ CMS ở pages.ts
  },
  sources: { title: 'Nguồn tham khảo' },
}

export type VillageCopyView = ApplyMode<typeof villageCopy>

// Mốc cuối dòng thời gian: tĩnh, không lấy từ CMS (R6). Mức tin cậy luôn là 'pending'.
export const villageTimelineAdd = {
  label: '+',
  title: 'Mốc của bạn',
  body: 'Ký ức, ảnh cũ, giấy tờ của các gia đình làng Hới có thể bổ sung vào dòng thời gian này sau khi được xác minh.',
  sourceLine: 'Mời đóng góp qua trang Kết nối',
  sourceHref: '/ket-noi',
}
