# Prompt khởi động (dán vào Claude Code)

Đọc `CLAUDE.md` và `docs/HANDOFF.md`, xem các ảnh trong `design/screens/`. Sau đó lập kế hoạch triển khai website Chiếu Hới theo các phase dưới đây. Đưa kế hoạch cho tôi duyệt trước khi viết code. Hết mỗi phase thì dừng lại, tóm tắt việc đã làm và chụp màn hình so sánh với thiết kế.

**Phase 1 — Nền móng**
- Khởi tạo Next.js + TypeScript + Tailwind; nạp font tiếng Việt; khai báo token.
- Viết `lib/content.ts` đọc `content/seed`, định nghĩa type cho Source, TimelineEvent, CraftStep, Product, Story, Person, ArchiveAsset, trong đó có các trường consent, rights, confidence, status.
- Layout chung: SiteHeader (desktop + mobile), MobileMenu, SiteFooter, Breadcrumb.

**Phase 2 — Component**
- Button, LinkArrow, SectionHeading, DocumentLabel, VerifyNote, SourceNote, các loại thẻ (PortraitCard, StoryCard, ObjectCard), FilterChips, Tabs, các trạng thái phản hồi (skeleton, trống, lỗi, thành công).
- Đối chiếu với `design/screens/Components.jpg` và `design/source/Components.dc.html`.
- Dựng một trang `/styleguide` nội bộ để xem mọi component.

**Phase 3 — Trang chủ** (`/`, desktop + mobile). Hero, các section, footer, theo `Home.jpg` và `HomeMobile.jpg`.

**Phase 4 — Hai trang tương tác chính**
- `/nghe-det-chieu`: CraftJourney (7 công đoạn, xem cận cảnh, Trước/Tiếp), tab Thủ công/Bằng máy/So sánh.
- `/lang-hoi`: Timeline (ngang trên desktop, mở/đóng trên mobile, 3 mức tin cậy), danh sách nguồn.

**Phase 5 — Các trang còn lại**
- `/cau-chuyen` và `[slug]` (bài đọc dài có chú thích nguồn; nội dung bài nháp lấy từ `StoryDetail.dc.html`).
- `/con-nguoi` và `[slug]` (ẩn/hiện theo consent).
- `/san-pham` và `[slug]` (PatternExplorer).
- `/thu-vien` (lightbox có metadata, URL `?anh=`).
- `/ket-noi` (form minh hoạ có kiểm tra dữ liệu).

**Phase 6 — Kiểm tra**
- Chạy axe hoặc Lighthouse cho từng trang (mục tiêu: Accessibility ≥ 95, CLS < 0.1).
- Kiểm tra dùng được hoàn toàn bằng bàn phím và khi bật giảm chuyển động.
- Chụp màn hình 390 và 1440 so với `design/screens`; liệt kê các điểm còn lệch.
