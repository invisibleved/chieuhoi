# Chiếu Hới — hướng dẫn cho Claude Code

Website di sản số cho nghề dệt chiếu làng Hới (Hải Triều). Ngôn ngữ chính: tiếng Việt. Tiếng Anh làm ở phase sau.
Thiết kế đã hoàn tất. Việc của bạn là **triển khai đúng thiết kế**, không thiết kế lại.

## Tài liệu phải đọc trước
1. `docs/HANDOFF.md`: bảng route, token, component, đặc tả tương tác, mô hình CMS, checklist khả năng truy cập.
2. `design/screens/*.jpg`: ảnh chụp toàn trang của từng màn hình (desktop 1440, mobile 390). **Đây là nguồn chuẩn về giao diện.**
3. `design/source/*.dc.html`: mã nguồn artboard. Tra ở đây copy, khoảng cách, cỡ chữ, ARIA và logic trạng thái chính xác. Định dạng file xem `design/source/README.md`.
4. `design/tokens/`: `tokens.css` và `tailwind.preset.ts`.
5. `content/seed/*.json`: dữ liệu mẫu (timeline, công đoạn, sản phẩm, bài viết, nguồn).

## Stack
- Next.js (App Router, 16.4.x) + Payload CMS 3 nhúng cùng app (`/admin`) + Postgres + React + TypeScript (strict) + Tailwind CSS 4. Chạy Node >= 22.23.4 (`.nvmrc`). Dùng phiên bản ổn định hiện hành; kiểm tra lại API trước khi dùng thay vì đoán.
- Tailwind v4 (cấu hình CSS-first): khai báo token trong `@theme` của `app/globals.css`, giá trị lấy từ `tokens.css`; bỏ qua `tailwind.preset.ts`.
- Font: `next/font/google` cho Noto Serif Display, Noto Serif và Be Vietnam Pro, khai báo `subsets: ['vietnamese','latin']`.
- Dữ liệu: component chỉ đọc qua lớp `src/lib/content`, không gọi Payload trực tiếp; nguồn thật là Payload/Postgres, `content/seed` dùng để seed (`npm run seed`).
- Postgres cục bộ: `docker compose up -d` (host port 5433; DB `chieuhoi` và `chieuhoi_test`). Biến môi trường: xem `.env.example`.
- Test: `npm run test:unit` (vitest, `tests/unit`), `npm run test:int` (vitest, `tests/int`, dùng `DATABASE_URI_TEST`, chạy tuần tự), `npm run test:e2e` (Playwright).
- Spec thiết kế kiến trúc: `docs/superpowers/specs/2026-10-26-chieu-hoi-web-design.md`.
- KHÔNG làm: giỏ hàng, thanh toán, đăng nhập người xem, form Kết nối (form chỉ là minh hoạ, phải giữ dòng "minh hoạ"). Đăng nhập chỉ dành cho biên tập viên và người duyệt qua Payload admin.

## Quy tắc nội dung (bắt buộc, không thoả hiệp)
- **Không bịa** sự kiện, ngày tháng, tên người, lời trích, ý nghĩa hoa văn. Thiếu dữ liệu thì hiển thị `[cần xác minh]` (bản preview) hoặc ẩn (bản production), không tự điền.
- Người: chỉ hiện tên, ảnh, lời trích khi `consent` tương ứng là true. Ngược lại hiện nhãn "Chờ đồng ý".
- Ảnh: `design/reference-images` chỉ dùng cho dev/preview (xem `RIGHTS.md`). Seed JSON trỏ tới `/images/reference/*.webp`: khi dev, copy ảnh vào `public/images/reference/` và thêm thư mục này vào `.gitignore`. Không đưa vào bản build production khi `rights !== 'permitted'`.
- Timeline: luôn hiện mức tin cậy (`press` / `oral` / `pending`) bằng hình dạng điểm mốc, không chỉ bằng màu.
- Mọi dữ kiện có nguồn phải có chú thích số dẫn tới `sources.json`.

## Quy tắc giao diện
- Chữ tối thiểu 12px. Noto Serif Display chỉ dùng từ 20px trở lên. Màu chữ chỉ lấy từ token (đều đạt WCAG AA). `--decor-straw` không dùng cho chữ.
- Vùng chạm tối thiểu 44×44px trên mobile. Focus luôn nhìn thấy: viền 2px, xanh làng trên nền sáng, vàng trên nền tối.
- Dùng thẻ thật: `<button>`, `<a>`, `<label>`. Bộ lọc dùng `aria-pressed`, tab dùng `role="tablist"`, lightbox dùng `role="dialog"` và giữ focus trong hộp.
- Bo góc 0 (trừ điểm đánh dấu hoa văn), không dùng bóng đổ, không dùng gradient trang trí.
- Chuyển động bằng CSS và IntersectionObserver; tôn trọng `prefers-reduced-motion`. Không khoá cuộn, không parallax mạnh.
- Mobile có bố cục riêng (xem ảnh chụp *Mobile.jpg), không chỉ thu nhỏ bản desktop.

## Cách làm việc
- Làm theo từng phase trong `docs/KICKOFF_PROMPT.md`. Hết mỗi phase thì dừng lại để người dùng xem.
- Sau mỗi trang: chạy `npm run lint`, `npm run build`, rồi so sánh với ảnh chụp ở 1440 và 390px (dùng Playwright chụp màn hình nếu có).
- Copy tiếng Việt lấy nguyên văn từ artboard, không tự diễn đạt lại.
