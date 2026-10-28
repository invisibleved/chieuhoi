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
- Cơ sở dữ liệu: chỉ `APP_ENV=development` tự đồng bộ schema (`push`). Đổi schema thì chạy `npm run migrate:create <tên>` và commit `src/migrations`; deploy chạy `npm run migrate`. Người duyệt đầu tiên ở production: `npm run create-reviewer` (đặt `REVIEWER_EMAIL`/`REVIEWER_PASSWORD`); `ALLOW_FIRST_USER` chỉ bật ở dev.
- Test: `npm run test:unit` (vitest, `tests/unit`), `npm run test:int` (vitest, `tests/int`, dùng `DATABASE_URI_TEST`, chạy tuần tự), `npm run test:e2e` (Playwright).
- Staging/production: biến `SITE_URL`, `STAGING_AUTH` (`user:password`), `S3_*` được `src/lib/env.ts` kiểm lúc build (thiếu hoặc sai thì build dừng). Hướng dẫn deploy: `docs/DEPLOY.md`. Lệnh build trên Vercel/VPS là `npm run ci` (kiểm env + migrate + build). `PREVIEW_ALL` chỉ mở bản xem trước ở staging hoặc `next dev`; `next start` với `APP_ENV=development` luôn là public. Đo bản xem trước bằng `next start` cần `APP_ENV=staging` + `STAGING_AUTH` + `--auth`.
- `npm run audit:lighthouse -- --base=<url> [--auth=user:pass] [--public] [--out=<file.json>]` chạy Lighthouse cho mọi route kiểm (ngoài `test:e2e` vì chậm). Chụp so thiết kế: `SCREENS=1 npm run test:e2e -- --project=chromium --no-deps tests/e2e/screens.e2e.spec.ts`, rồi `node tools/screens-sheet.mjs`; ảnh nằm trong thư mục gitignore, không bao giờ commit.
- `--no-deps` cho project `chromium` chạy không cần bản build :3100. Trên DB dev có sẵn, sau khi pull migration mới: chạy `npm run dev` một lần (push schema) rồi mới `npm run build`.
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

## Kiến trúc (clean architecture, bắt buộc)
Phụ thuộc chỉ đi một chiều: `app` → `components` → `lib/content` (view model) → Payload (`collections`, `globals`, `access`). Không có chiều ngược lại.
- `src/collections`, `src/globals`, `src/access`: schema, quyền truy cập và hook của Payload. Không import từ `components` hoặc `app`.
- `src/lib/content`: lớp duy nhất được gọi Payload. Mỗi hàm `get*` nhận `mode` và trả **view model** (`*View`) đã lọc theo quyền đăng, consent và placeholder. Mọi luật nghiệp vụ nằm ở đây, kể cả các vị từ và hàm định dạng dữ liệu như `hasPattern`, `docNumber`, nhãn chuyên mục. Không đặt chúng trong `components`.
- `src/app/**/page.tsx` và `layout.tsx` (server): gọi `getMode()` và `get*()`, rồi truyền view model xuống. Đây là nơi duy nhất lấy dữ liệu.
- `src/components`: chỉ nhận props (kiểu `*View`, chỉ dùng `import type` từ `@/lib/content`). Không gọi `get*`/`getMode`, không import `payload`, `@payload-config` hay `@/collections`, không tự lọc theo consent hoặc rights.
- Nhãn hiển thị của các giá trị option (category, group, era…) có một nguồn duy nhất là option trong collection. Map nhãn ở `lib/content/categories.ts`, không chép lại danh sách nhãn trong component.

## Component dùng chung (bắt buộc)
- `src/components/ui`: khối giao diện chung, không biết gì về nội dung di sản (Button, LinkArrow, SectionHeading, FilterChips, Tabs, Reveal…).
- `src/components/content`: thẻ và khối hiển thị một loại view model, dùng được ở mọi trang (PortraitCard, StoryCard, ProductCard, ExhibitCard, ContentImage, Sources, Tag, PreviewNotes…).
- `src/components/layout`: header, footer, breadcrumb, nav.
- `src/components/<trang>` (ví dụ `home`): chỉ ghép các component chung thành section của trang đó. Không định nghĩa lại kiểu chữ, nút, dải cuộn ngang, nhãn hay thẻ ở đây.
- Trước khi viết markup mới, tìm trong `ui` và `content` trước. Nếu một mẫu giao diện xuất hiện ở trang thứ hai (hoặc lặp hai lần trong một trang), chuyển nó lên `ui`/`content` rồi dùng lại, không copy class Tailwind.
- Giá trị thiết kế lặp lại (eyebrow, line-height, màu rgba) phải thành token trong `@theme` hoặc prop của component chung, không viết cứng `tracking-[.22em]`, `rgba(...)` rải rác.
- Component chung cần có test unit và có mặt trên `/styleguide`.
- Review mỗi task phải kiểm tra hai mục trên. Vi phạm là lỗi cần sửa, không phải lỗi nhỏ để dành.

## Cách làm việc
- Làm theo từng phase trong `docs/KICKOFF_PROMPT.md`. Hết mỗi phase thì dừng lại để người dùng xem.
- Sau mỗi trang: chạy `npm run lint`, `npm run build`, rồi so sánh với ảnh chụp ở 1440 và 390px (dùng Playwright chụp màn hình nếu có).
- Copy tiếng Việt lấy nguyên văn từ artboard, không tự diễn đạt lại.
- Hết mỗi phase: chép mọi mục review còn mở vào `docs/superpowers/backlog.md` và commit, **trước** khi xoá `.superpowers/sdd/<plan>/`.
