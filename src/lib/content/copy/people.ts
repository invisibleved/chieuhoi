// Chữ cố định của /con-nguoi và /con-nguoi/[slug], chép nguyên văn từ PeopleIndex, PeopleMobile,
// PersonDetail và PersonMobile (.dc.html). Nhánh `preview` là việc biên tập (gợi ý phỏng vấn, ghi chú
// về đồng ý), chỉ hiện ở bản xem trước (R14, R19); ở public applyMode đặt nhánh này thành null.
import type { ApplyMode } from './applyMode'

export const peopleCopy = {
  breadcrumb: { home: 'Trang chủ', current: 'Con người' },
  principles: {
    title: 'NGUYÊN TẮC CHÂN DUNG',
    label: 'Nguyên tắc chân dung',
    items: {
      desktop: [
        'Tên, tuổi, vai trò chỉ đăng khi người được kể đồng ý.',
        'Lời trích chỉ đăng khi có ghi âm hoặc ghi chép gốc.',
        'Người được kể có quyền xem lại và rút bài bất cứ lúc nào.',
      ],
      mobile: ['Tên, lời trích chỉ đăng khi có đồng ý và nguồn gốc. Người được kể có quyền rút bài.'],
    },
    preview: {
      note: {
        desktop: 'Ảnh dưới đây lấy từ bộ ảnh tham khảo, chưa có sự đồng ý của người trong ảnh.',
        mobile: 'Ảnh hiện tại chưa có sự đồng ý.',
      },
    },
  },
  // aria-label của nhóm chip trên artboard.
  filter: { label: { desktop: 'Lọc theo nhóm', mobile: 'Lọc' }, all: 'Tất cả' },
  count: {
    people: '{n} chân dung',
    allPending: { desktop: ' · tất cả đang chờ đồng ý', mobile: ' · đang chờ đồng ý' },
  },
  card: { pending: 'Chờ đồng ý', cta: 'Xem chân dung →' },
  empty: {
    title: 'Chưa có chân dung trong nhóm này',
    body: {
      desktop: 'Nếu bạn là người trẻ đang làm nghề chiếu, hoặc biết một người như vậy, chúng tôi muốn được nghe kể.',
      mobile: null,
    },
    action: { href: '/ket-noi', label: 'Giới thiệu một người →' },
  },
  invite: {
    title: 'Bạn biết một người giữ nghề?',
    body: 'Ông bà, cha mẹ, hàng xóm từng ngồi bên khung dệt. Giới thiệu với chúng tôi, và chúng tôi sẽ hỏi ý họ trước khi ghi lại bất cứ điều gì.',
    action: { href: '/ket-noi', label: 'Giới thiệu một người' },
  },
  detail: {
    back: 'Con người',
    pendingName: 'Chờ đồng ý',
    facts: { role: 'Vai trò', years: 'Năm làm nghề', hamlet: 'Xóm, thôn', recorded: 'Ghi lại bởi' },
    portraitLabel: 'CHÂN DUNG',
    photoPrefix: 'Ảnh: ',
    story: { eyebrow: 'ĐỜI VÀ NGHỀ', title: 'Câu chuyện của {name}', titleNoName: 'Câu chuyện' },
    quoteSource: 'Nguồn: ',
    // Danh sách nguồn mà câu chuyện trích (T2c); artboard chưa có nên dùng nhãn của bài đọc (StoryDetail).
    notesTitle: 'Ghi chú nguồn',
    gallery: { title: 'Phóng sự ảnh' },
    consent: {
      title: 'TRẠNG THÁI ĐỒNG Ý',
      states: { none: 'Chưa có', partial: 'Một phần', full: 'Đã có' },
      need: 'Cần: đồng ý đăng {list}',
      reviewed: {
        title: 'NGƯỜI ĐƯỢC KỂ ĐÃ DUYỆT BÀI',
        yes: 'Đã duyệt',
        no: 'Chưa',
        hint: 'Gửi bản nháp cho người được kể đọc trước khi đăng',
      },
      request: {
        title: 'YÊU CẦU CHỈNH SỬA',
        body: 'Liên hệ để sửa hoặc gỡ bài',
        action: { desktop: 'Gửi yêu cầu →', mobile: 'Yêu cầu sửa hoặc gỡ bài →' },
        href: '/ket-noi',
      },
      mobileSummary: { yes: '{state} · Người được kể đã duyệt bài', no: '{state} · Người được kể chưa duyệt bài' },
    },
    related: { title: 'Liên quan', eyebrow: 'LIÊN QUAN' },
    preview: {
      banner: {
        desktop: {
          strong: 'Mẫu trang chân dung.',
          text: 'Người trong ảnh chưa được hỏi ý. Tên, tiểu sử và lời kể để trống cho đến khi có sự đồng ý bằng văn bản.',
        },
        mobile: { strong: 'Mẫu trang.', text: 'Người trong ảnh chưa được hỏi ý; tên và lời kể để trống.' },
      },
      // Chú thích chân dung: chỉ ở preview, khi chưa có đồng ý ảnh (P3).
      consentLine: 'Đồng ý của người trong ảnh: [chưa có]',
      intro: '[Một câu giới thiệu ngắn, do chính người được kể duyệt.]',
      sections: [
        {
          title: 'Tuổi thơ bên khung dệt',
          body: {
            desktop: '[Đoạn kể dựa trên phỏng vấn. Gợi ý câu hỏi: lần đầu ngồi vào khung dệt là khi nào, ai dạy?]',
            mobile: '[Đoạn kể dựa trên phỏng vấn.]',
          },
        },
        {
          title: 'Một ngày làm chiếu',
          body: {
            desktop: '[Gợi ý: một ngày bắt đầu lúc nào, công đoạn nào mất nhiều thời gian nhất?]',
            mobile: '[Đoạn kể dựa trên phỏng vấn.]',
          },
        },
        {
          title: 'Điều muốn giữ lại',
          body: {
            desktop: '[Gợi ý: điều gì của nghề mà người được kể mong thế hệ sau còn giữ?]',
            mobile: '[Đoạn kể dựa trên phỏng vấn.]',
          },
        },
      ],
      quote: '“[Trích nguyên văn lời kể]”',
      quoteNote: {
        desktop: 'Chỉ hiển thị khi có ghi âm hoặc ghi chép gốc · Nguồn: [mã ghi âm, ngày]',
        mobile: 'Chỉ hiện khi có ghi âm gốc',
      },
      // Ghép với "Nguồn: …" bằng " · " ở lib (R15).
      quoteNotePrefix: 'Chỉ hiển thị khi có ghi âm hoặc ghi chép gốc',
      galleryNote: {
        desktop: 'Ảnh cùng buổi chụp · cần xác minh tác giả và quyền dùng',
        mobile: 'Ảnh cùng buổi chụp · cần xác minh tác giả',
      },
    },
  },
}

export type PeopleCopyView = ApplyMode<typeof peopleCopy>

// Thẻ "Liên quan" của trang chân dung. Thẻ "Con người" cố định, ảnh lấy từ ô `slot` của page-intros.con-nguoi.
export const peopleRelated = {
  step: { eyebrow: 'CÔNG ĐOẠN', cta: 'Xem công đoạn →', href: '/nghe-det-chieu' },
  product: { eyebrow: 'HIỆN VẬT', cta: 'Xem hiện vật →' },
  people: {
    href: '/con-nguoi',
    slot: 'related-people',
    eyebrow: 'CON NGƯỜI',
    title: 'Những chân dung khác',
    cta: 'Xem tất cả →',
  },
} as const
