# Chiếu Hới — Phase 5b: Sản phẩm + Thư viện + Kết nối — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng bốn route `/san-pham`, `/san-pham/[slug]`, `/thu-vien`, `/ket-noi`, desktop 1440 và mobile 390. Gồm:
- danh sách hiện vật lọc theo nhóm, ô "Ảnh cần chụp";
- trang hiện vật có khám phá đường dệt (PatternExplorer), bộ ảnh, bảng thông tin, nguồn;
- thư viện ảnh lọc theo chủ đề và thời kỳ, lightbox có metadata, URL `?anh=`;
- form góp tư liệu minh hoạ: kiểm tra dữ liệu, báo lỗi, màn hình thành công, **không gửi dữ liệu đi đâu**.

Đây là nửa sau của Phase 5 (R1 Phase 5a). Hết 5b thì dừng để người dùng xem.

**Architecture:**
- Mỗi trang có một view model do `lib/content` dựng:
  - `getProductsPage(mode)`, `getProductPage(slug, mode)`, `getProductSlugs()`;
  - `getArchivePage(mode)`;
  - `getConnectPage(mode)`.
- `page.tsx` chỉ gọi `getMode()` và `get*Page()`, rồi truyền view model xuống `components/products/*`, `components/archive/*`, `components/connect/*`.
- Luật nghiệp vụ (nhãn thẻ hiện vật, đánh số nguồn chú thích, chú thích ảnh, nhãn quyền dùng, đếm "đã xác minh nguồn") nằm ở lib.
- Phần tương tác là client component chung:
  - `content/PatternExplorer` (dùng chung khối điểm chọn với `home/PatternTeaser`);
  - `ui/Lightbox` + `content/ArchiveGallery`;
  - `ui/form/*` (ô nhập, nhóm lựa chọn, ô đồng ý, tổng hợp lỗi).

**Tech Stack:** Node 22.23.4, Next 16.4, React 19, Payload 3.92 (Postgres), Tailwind 4.3, Vitest + @testing-library/react, Playwright + @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-10-26-chieu-hoi-web-design.md`. Đọc kèm:
- `CLAUDE.md`, nhất là mục "Kiến trúc" và "Component dùng chung";
- `docs/HANDOFF.md`: "Đặc tả tương tác" 3 và 4, "Form Kết nối", "Mô hình nội dung", checklist khả năng truy cập;
- `docs/superpowers/backlog.md`: mục A (link 404), B (đánh số nguồn trang hiện vật), C Phase 5a (heading 44px lặp lại, chân dung preview), C Phase 4 (`productTag`);
- artboard `design/source/{ProductsIndex,ProductsMobile,ProductDetail,ProductMobile,ArchivePage,ArchiveMobile,ConnectPage,ConnectMobile,Components}.dc.html`;
- ảnh chụp tương ứng trong `design/screens/`.

## Global Constraints

- Mọi quy tắc trong `CLAUDE.md` áp dụng.
  - Phụ thuộc một chiều: `app` → `components` → `lib/content` → Payload.
  - Component chỉ `import type` từ `@/lib/content` (lint chặn).
  - Mẫu giao diện xuất hiện lần thứ hai thì lên `ui`/`content`.
  - Giá trị lặp lại thành token. Không viết cứng `tracking-[…]` hay `rgba(...)` mới; màu mới của lightbox thành token trong `@theme`.
  - Vi phạm là lỗi phải sửa, không phải lỗi nhỏ.
- **Dùng lại component Phase 2–5a trước khi viết mới:**
  - `PageHeader`, `Eyebrow`, `SectionHeading`, `FilterChips` (có `tone="dark"`), `FilterableList`, `EmptyState`, `SuccessState`;
  - `ProductCard`, `ShotNeeded`, `ReadNext`, `Sources` (`FootnoteRef`, `SourceList`), `ArchiveChip`, `ContentImage`, `PreviewNotes`, `Tag`;
  - `FactList`, `VerifyNote`, `Callout`, `Button`, `LinkArrow`, `BackLink`, `PillButton`, `ThreadsDivider`, `VariantText`, `useVariant`.
- **Copy nguyên văn từ artboard.**
  - Chuỗi khác nhau giữa desktop và mobile lưu thành `Variant` trong `src/lib/content/copy/{products,archive,connect}.ts`, lọc bằng `applyMode`.
  - Nhánh `preview` là ghi chú quy trình hoặc chỉ dẫn biên tập, thành `null` ở public.
- **Dữ liệu CMS thắng chữ vẽ trên artboard** (ruling Phase 3): tên, mã, tóm tắt, ảnh, thông số, chú thích điểm hoa văn của hiện vật; tiêu đề, mô tả, metadata của tư liệu; thông tin liên hệ.
- **Ở public:**
  - chuỗi có dấu chưa xác minh (`UNVERIFIED_MARK`) không render;
  - ghi chú quy trình chỉ render ở preview;
  - section không còn dữ liệu thì không render, kể cả tiêu đề;
  - **không có ảnh, `alt`, tiêu đề hay mô tả nào của tư liệu `rights ≠ permitted` trong HTML/RSC**, kể cả khi URL có `?anh=` trỏ tới tư liệu đó;
  - tên và liên hệ cơ sở dệt chỉ hiện khi cơ sở đã đăng và có `publicConsent` (spec mục 7).
- **Form Kết nối:**
  - không có `fetch`, không ghi `localStorage`/cookie, không đưa dữ liệu lên URL, kể cả khi không có JS;
  - giữ dòng "minh hoạ" ở khung ghi chú và màn hình thành công.
- **Không có JavaScript:**
  - danh sách hiện đủ mọi thẻ (chip "Tất cả" được chọn);
  - `/thu-vien?anh=…` render sẵn lightbox mở ở server;
  - chú thích điểm hoa văn đọc được qua danh sách `<noscript>`.
- **Tương tác:**
  - Chip lọc và nút chọn dùng `aria-pressed`. Đếm kết quả nằm trong `role="status"`.
  - Điểm hoa văn là `<button>` 44×44 đặt theo toạ độ %, `aria-pressed`. Chú thích nằm trong `aria-live="polite"`.
  - Lightbox `role="dialog" aria-modal="true"`, giữ focus trong hộp, Esc đóng, ← → chuyển ảnh có vòng lại, trả focus về ô đã mở.
  - Ô form có `<label>` thật, `aria-invalid` và `aria-describedby` khi lỗi. Radio và checkbox là input thật.
  - Khi giảm chuyển động: bỏ transition; phóng to vẫn dùng được (F2 Phase 4).
- **Token và chữ:**
  - Màu chữ chỉ lấy từ token; chữ tối thiểu 12px; `font-display` chỉ dùng từ 20px trở lên.
  - Vùng chạm ≥ 44px. Focus 2px: xanh làng trên nền sáng, vàng trên nền tối (trang Thư viện là nền tối).
  - Bo góc 0, trừ điểm hoa văn và chấm radio.
- **Ảnh:**
  - Mọi ảnh là ArchiveAsset, render qua `ContentImage`.
  - Ảnh đầu trang chi tiết dùng `priority`.
  - Ảnh thẻ cố định lấy từ slot `media` trong `page-intros` (R2 Phase 4).
- **Schema đổi** thì chạy `npm run migrate:create <tên>` và commit `src/migrations`.
- **Mỗi task kết thúc bằng:**
  - `npm run lint` (0 lỗi);
  - `npm run test:unit`, và `npm run test:int` nếu task có test int;
  - commit có dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Lệnh chạy qua `fnm exec --using=22.23.4 -- npm run …`. Shell là fish nên lệnh ghép phải bọc trong `bash -c`.
- **Làm trên nhánh `phase-5b-san-pham-thu-vien-ket-noi`**, tách từ `main` @ `e95a925`.

## Review Focus

1. **Thư viện ở public khi mọi tư liệu chưa được phép** (seed: 14 tư liệu `rights: 'unknown'`).
   - `/thu-vien` trả 200, 0 ô ảnh, khung trống đúng copy, "0 tư liệu" trong `role="status"`.
   - `/thu-vien?anh=TL-004` (ảnh người chưa đồng ý) không render dialog, và HTML không chứa `nkc10`, "Bên khung dệt" hay alt của ảnh đó.
   - → Task 2 (int), Task 9 (e2e).
2. **`?anh=` lạ hoặc lệch bộ lọc.**
   - Mã không tồn tại thì không mở gì, không lỗi.
   - Mã viết thường (`tl-003`) vẫn mở đúng ảnh.
   - Đang lọc "Làng quê" mà mở link tới ảnh "Nghề dệt" thì bộ lọc về "Tất cả".
   - Chỉ còn 1 ảnh: ← → giữ nguyên ảnh đó.
   - Đóng thì URL bỏ `?anh=` và focus về ô đã mở.
   - → Task 5 (unit), Task 9 (e2e).
3. **Form không gửi gì đi.**
   - Bấm "Gửi đóng góp" khi trống: 3 lỗi, khung tổng hợp "Còn 3 mục cần bổ sung."; điền tên thì còn 2.
   - Không có request mạng nào và URL không đổi, kể cả khi tắt JS.
   - Tên chỉ có khoảng trắng bị coi là trống (lỗi tên), như artboard dùng `trim()`.
   - → Task 6 (unit), Task 10 (e2e).
4. **Hiện vật mà chú thích hoặc ảnh đầu bị ẩn ở public.**
   - Ảnh đầu bị ẩn thì không có khối khám phá, không có điểm, không có cột danh sách trống.
   - Số chú thích nguồn trên trang hiện vật khớp số mà `PatternTeaser` ở trang chủ đang link tới, và neo `#nguon-{n}` tồn tại.
   - → Task 1 (int), Task 8 (e2e).
5. **Cơ sở dệt chưa đồng ý công khai.**
   - Ở public không có tên và liên hệ cơ sở trong HTML.
   - Dòng "Chưa có cơ sở được xác minh và đồng ý công khai" vẫn hiện.
   - → Task 1 (int), Task 8 (unit).

## Ruling của Claude trong plan (báo người dùng khi hết phase)

- **R1. Nhãn thẻ hiện vật lên view model** (backlog C Phase 4). `ProductCardView.tag: { text: string; style: 'filled' | 'dashed' } | null` tính ở lib, chữ lấy từ `productsCopy.tag`. Xoá `productTag` khỏi `components/content/labels.ts`.
  - Trang chi tiết dùng câu riêng "Ảnh cần cơ sở dệt xác nhận đúng loại" (`ProductView.typeNote`), chỉ khi có ảnh mà chưa xác nhận loại.
- **R2. Đánh số nguồn của hiện vật ở lib** (backlog B). `ProductView.sources` xếp theo lần xuất hiện đầu trong các chú thích còn hiện. Mỗi chú thích có `sourceN`.
  - `PatternTeaser` bỏ phép tính trong component, dùng `sourceN`.
  - Trang chi tiết thêm khối "Nguồn" (`SourceList`, `idPrefix="nguon-"`) sau bảng thông tin, để link `#nguon-{n}` từ trang chủ có đích.
  - Cái giá: artboard không vẽ khối này.
- **R3. Trường mới của chú thích điểm** (`Products.annotations`):
  - `shortTitle`: nhãn nút chia ô trên mobile ("Viền", "Hoa văn", "Mặt cói"); trống thì dùng `title`.
  - `sourceNote`: dòng nguồn dưới chú thích ("Quan sát từ ảnh · chưa xác minh"). Trống thì lib ghép "{publisher} ({dd/mm/yyyy})" từ nguồn; cả hai trống thì không có dòng.
  - Một toạ độ `x, y` cho cả hai breakpoint. Artboard mobile lệch toạ độ chỉ để bù `object-position`.
- **R4. Trường mới của hiện vật:**
  - `context` (textarea, localized): đoạn "BỐI CẢNH". Desktop và mobile dùng cùng nội dung (tinh thần R7 Phase 5a).
    - Cái giá: mobile dài hơn artboard một câu.
  - `pattern` (text, localized): dòng "HOA VĂN". Hiện ở cả mobile, dù artboard mobile bỏ dòng này, vì dữ liệu không được biến mất theo breakpoint.
  - Chỉ dẫn biên tập "[chỉ ghi khi đã đo]", "[hướng dẫn từ cơ sở dệt]", "[tên cơ sở, nếu được đồng ý]" là placeholder preview trong copy, không seed (R14 Phase 5a).
- **R5. Cơ sở dệt** (spec mục 7):
  - "NƠI LÀM" là tên cơ sở khi được hiện.
  - "LIÊN HỆ NGƯỜI LÀM" là `maker.contact` khi cơ sở đã đăng, `verified` và `publicConsent`.
  - Không có thì hiện câu "Chưa có cơ sở được xác minh và đồng ý công khai" ở cả hai mode, vì câu này đúng sự thật.
  - Mobile không có dòng liên hệ. Thay vào đó là nút viền "Kết nối với người làm chiếu", theo artboard.
- **R6. Chú thích ảnh hiện vật** (`ProductView.imageCaptions`, song song `images`), tính ở lib:
  - "Ảnh {i}/{n}";
  - thêm " · Ảnh: {photographer}" nếu có (preview thì " · Ảnh: [cần xác minh]");
  - ảnh 1 khi chưa xác nhận loại thì thêm " · Chưa xác nhận đây là {tên viết thường}".
  - Cái giá: không có phần "Công đoạn may viền" riêng của ảnh 4 (cần chú thích theo từng ảnh, đổi schema `images`).
  - Chỉ desktop có chú thích và hàng ảnh nhỏ, theo artboard.
- **R7. PatternExplorer** theo HANDOFF mục 3 và artboard:
  - Điểm chỉ hiện trên ảnh 1. Chọn điểm khi đang xem ảnh khác thì quay về ảnh 1.
  - Phóng 2.2 lần quanh toạ độ, ẩn các điểm khác.
  - Bấm lại điểm đang chọn, nút "Đóng chi tiết" hoặc Esc thì thu nhỏ.
  - Không có JS: danh sách mọi chú thích trong `<noscript>`.
- **R8. "Hiện vật khác":**
  - Hai hiện vật kế tiếp theo thứ tự danh sách, vòng lại đầu, bỏ hiện vật đang xem.
  - Thêm thẻ cố định "CÁCH LÀM · Công đoạn tạo hoa văn" tới `/nghe-det-chieu`, ảnh từ slot `san-pham.next-pattern`.
  - Mobile chỉ hiện hai hiện vật dạng hàng chữ, theo artboard.
- **R9. Trang `/san-pham`:**
  - Khung "VỀ DANH MỤC" chỉ có ở desktop. Link "Xem nguồn →" lấy URL của nguồn `vietnamplus-2026` (chỉ nhận `http(s):`). Nguồn bị ẩn thì bỏ link, giữ chữ.
  - Đếm: desktop "{n} hiện vật · danh mục theo Vietnam+", mobile "{n} hiện vật".
  - Lead mobile dùng lead CMS như desktop (R-T4b).
- **R10. Khối kêu gọi dùng chung** (backlog C Phase 5a, heading 44px). `ui/CtaBand` dùng cho:
  - "Muốn tìm đến người làm chiếu?" (`/san-pham`, nền xanh làng);
  - "Nhà bạn còn giữ ảnh cũ của làng?" (`/thu-vien`, nền sáng);
  - "Bạn biết một người giữ nghề?" (`/con-nguoi`, viết lại bằng `CtaBand`).
  - Cả ba chỉ có ở desktop, theo artboard.
- **R11. `/thu-vien` đọc `searchParams`**, nên là route động.
  - Server mở sẵn lightbox khi `?anh=` khớp một tư liệu đang hiện. So mã không phân biệt hoa thường.
  - Ô ảnh, Trước/Tiếp và Đóng là `<a href>` (`/thu-vien?anh=TL-…`, `/thu-vien`). Có JS thì chặn điều hướng, đổi trạng thái và cập nhật URL bằng `history.replaceState`.
  - Cái giá: trang render theo từng request, cùng loại vấn đề backlog A (mode chốt lúc build) nhưng theo hướng ngược lại.
- **R12. "ĐÃ XÁC MINH NGUỒN"** đếm tư liệu đang hiện có đủ `takenAt`, `photographer` và `source` đã xác minh (không trống, không có dấu chưa xác minh). Seed hiện tại ra 0, khớp artboard.
  - Cái giá: chưa có cờ xác minh riêng do người duyệt bật.
- **R13. Bộ lọc thư viện:**
  - Chủ đề: chip "Tất cả" và mọi option của `ARCHIVE_CATEGORY_OPTIONS`, kể cả nhóm chưa có ảnh.
  - Thời kỳ: "Mọi thời kỳ / Xưa / Nay", chỉ có ở desktop.
  - Đếm: "{n} tư liệu", thêm " · chưa có ảnh xưa" khi chọn "Xưa" mà không tư liệu nào có `era: 'old'`.
- **R14. Metadata lightbox:**
  - Desktop có 5 dòng: Thời gian (`takenAt`), Người chụp, Nguồn, Quyền dùng, Liên quan. Mobile có 3 dòng: Thời gian, Người chụp, Quyền dùng.
  - Dòng trống thì ẩn ở public, hiện `[cần xác minh]` ở preview.
  - Nhãn quyền dùng: `permitted` lấy nhãn option "Được phép". `unknown`/`restricted` dùng copy artboard "Chưa xin phép · không đăng công khai" (mobile "Chưa xin phép") và "Hạn chế · không đăng công khai" (mobile "Hạn chế"). Hai nhãn sau chỉ có thể xuất hiện ở preview.
- **R15. Lightbox** phủ toàn màn hình (`fixed inset-0`), không khoá cuộn trang nền (CLAUDE.md).
  - Mobile: vuốt ngang ≥ 40px để chuyển ảnh.
  - Ảnh `object-contain`.
- **R16. Form Kết nối:**
  - `<form method="dialog" noValidate>`. Ngoài `<dialog>`, `method="dialog"` không gửi gì, nên tắt JS cũng không có dữ liệu rời trang.
  - Kiểm tra khi bấm Gửi. Sau lần đầu, lỗi cập nhật theo từng lần gõ, như artboard.
  - Bắt buộc: tên, cách liên lạc (chỉ cần không trống, không kiểm định dạng), ô đồng ý.
  - Gửi lỗi thì focus khung tổng hợp `role="alert"`.
  - Thành công: khung `role="status"`. "Góp thêm một ký ức" xoá form và focus ô tên.
  - Ô "Ảnh hoặc tệp" là khung tĩnh, không có `<input type="file">`, vì chưa có hệ thống tải lên.
- **R17. Tiêu đề `/ket-noi`:**
  - Seed `page-intros.ket-noi.title` = "Làng vẫn còn đó.\nChuyện nghề vẫn được kể tiếp.".
  - `PageHeader` thêm prop `accentLastLine`: dòng cuối render `<em>` nghiêng màu nhấn.
- **R18. Thông tin liên hệ** lấy từ `SiteSettings`:
  - Email (link `mailto:`), điện thoại (link `tel:`), địa chỉ kèm `addressNote`, `visitInfo`.
  - Email/điện thoại trống: ẩn ở public; preview hiện placeholder copy "[Email liên hệ]", "[Số điện thoại]".
  - `visitInfo` trống thì hiện câu thật "Chưa có thông tin tham quan chính thức" (mobile "Thăm làng: chưa có thông tin chính thức") ở cả hai mode.
  - Mobile gộp email và điện thoại thành một dòng "{email} · {phone}".
- **R19. Bốn cách kết nối** (01–04) là copy tĩnh, chỉ có ở desktop, theo artboard.
- **R20. Sửa luôn F3 Phase 5a.** `ContentImage` thêm prop `notesPosition` (`'bottom-left'` mặc định, `'bottom-right'`, `'top-right'`), để nhãn "Ảnh chưa được phép đăng" không bị đè.
  - Dùng ở chân dung (`PersonView`), ô thư viện (chip mã ở góc dưới trái) và sân khấu hiện vật.
  - `ContentImage` thêm `fit: 'cover' | 'contain'` cho lightbox.
- **R21. Trang chi tiết hiện vật là dynamic** như R20 Phase 5a.
  - `generateStaticParams` trả slug đã đăng.
  - `dynamicParams` giữ `true`.
  - Slug lạ hoặc chưa đăng ở public thì 404.

---

## Cấu trúc file

```
src/collections/Products.ts                   context, pattern, annotations.shortTitle/sourceNote (Task 1)
src/globals/pageMedia.ts                      'san-pham': ['next-pattern'] (Task 1)
src/migrations/*_phase5b_products.ts          (Task 1)
src/lib/content/products.ts                   getProductsPage, getProductPage, getProductSlugs (Task 1)
src/lib/content/archive.ts                    getArchivePage (Task 2)
src/lib/content/pages.ts                      getConnectPage (Task 2)
src/lib/content/copy/{products,archive,connect}.ts                      (Task 1, 2)
src/lib/content/{types,queries,categories,index}.ts
src/components/content/labels.ts              bỏ productTag (Task 1)
src/components/home/PatternTeaser.tsx         dùng sourceN (Task 1), dùng PatternMarker/AnnotationNote (Task 4)
src/components/ui/{CtaBand,Segmented}.tsx; EmptyState tone; SuccessState action    (Task 3)
src/components/content/{ContentImage,PageHeader,ProductCard}.tsx; FactList columns  (Task 3)
src/components/ui/PatternMarker.tsx, src/components/content/{AnnotationNote,StageHint,PatternExplorer}.tsx (Task 4)
src/components/ui/Lightbox.tsx, src/components/content/ArchiveGallery.tsx           (Task 5)
src/components/ui/form/{TextField,TextArea,ChoiceGroup,ConsentCheck,ErrorSummary,UploadPlaceholder}.tsx (Task 6)
src/components/products/{ProductsView,ProductView}.tsx                   (Task 7, 8)
src/components/archive/ArchiveView.tsx                                   (Task 9)
src/components/connect/{ConnectView,ConnectForm}.tsx                     (Task 10)
src/app/(frontend)/san-pham/{page.tsx,[slug]/page.tsx}, thu-vien/page.tsx, ket-noi/page.tsx
src/app/(frontend)/globals.css                token lightbox (Task 5)
src/app/(frontend)/styleguide/*               mọi component mới (Task 3–6)
src/seed/{index.ts,data/{extras,site}.ts}, content/seed/products.json   (Task 1, 2)
tests/unit/**, tests/int/{products,archive,connect}.int.spec.ts, tests/e2e/{products,archive,connect}.e2e.spec.ts
```

---

### Task 1: Lib cho Sản phẩm (schema, view model, seed)

**Files:**
- Modify: `src/collections/Products.ts`, `src/globals/pageMedia.ts`, `src/lib/content/{types,queries,index}.ts`, `src/components/content/{labels,ProductCard}.tsx`, `src/components/home/PatternTeaser.tsx`, `src/seed/index.ts`, `src/seed/data/{extras,site}.ts`, `content/seed/products.json`
- Create: `src/lib/content/products.ts`, `src/lib/content/copy/products.ts`, `src/migrations/<ts>_phase5b_products.ts`, `tests/int/products.int.spec.ts`
- Test: `tests/unit/copy.test.ts`, `tests/unit/components/labels.test.tsx`, `tests/unit/home/*` (PatternTeaser), `tests/int/products.int.spec.ts`, `tests/int/seed.int.spec.ts`

**Interfaces:**
- Produces (types.ts):

```ts
export interface ProductCardView { /* như cũ */ tag: { text: string; style: 'filled' | 'dashed' } | null }   // R1
export interface ProductView extends ProductCardView {
  /* như cũ: images, primaryImage, hasPattern, material, technique, size, care */
  context: string | null
  pattern: string | null
  typeNote: string | null                       // R1
  imageCaptions: string[]                       // R6, song song images
  annotations: {
    n: number; title: string | null; shortTitle: string | null; x: number; y: number; body: string
    sourceId: string | null; sourceN: number | null; sourceLine: string | null    // R2, R3
  }[]
  sources: SourceView[]                         // R2, date dd/mm/yyyy
  maker: { name: string | null; verified: boolean; contact: string | null } | null   // R5
}
export interface ProductsPageView {
  intro: PageIntroView
  products: ProductCardView[]
  filters: { key: string; label: string }[]     // "Tất cả" (all) + PRODUCT_GROUP_OPTIONS
  catalogSourceUrl: string | null               // R9
  copy: ProductsCopyView
}
export interface ProductPageView { product: ProductView; others: ReadNextItem[]; copy: ProductsCopyView }  // R8
```

- Produces (`index.ts`): `getProductsPage(mode)`, `getProductPage(slug, mode)` (bọc `cache()`), `getProductSlugs()`.
- Produces (`categories.ts`): `productGroupOptions: { key: string; label: string }[]`, cùng dạng `storyCategoryOptions`.
- Produces (`pageMedia.ts`): `'san-pham': ['next-pattern']`, nhãn admin "Tiếp theo: Công đoạn tạo hoa văn".

- [ ] **Step 1: Test int** (`tests/int/products.int.spec.ts`, seed bằng helper `tests/int/helpers.ts`).
  - `getProductsPage('preview')`:
    - 7 hiện vật đúng thứ tự seed;
    - `filters` = Tất cả, Chiếu cói truyền thống, Chiếu đương đại;
    - "chieu-dot" có `tag` `{ text: 'Chưa có ảnh', style: 'dashed' }`;
    - "chieu-cap-dieu" có `{ text: 'Ảnh cần xác nhận loại', style: 'filled' }`;
    - `catalogSourceUrl` bắt đầu bằng `https://www.vietnamplus.vn/`.
  - `getProductPage('chieu-cap-dieu', 'preview')`:
    - 3 chú thích, `shortTitle` Viền / Hoa văn / Mặt cói;
    - chú thích 2 có `sourceN: 1` và `sourceLine` "Vietnam+ (14/08/2026) · danh sách hoạ tiết chung, không riêng tấm này";
    - `sources` có đúng 1 mục;
    - `imageCaptions[0]` = "Ảnh 1/4 · Ảnh: [cần xác minh] · Chưa xác nhận đây là chiếu cạp điều";
    - `typeNote` = "Ảnh cần cơ sở dệt xác nhận đúng loại";
    - `others` có 3 mục: chieu-hoa-cai, chieu-tron, rồi thẻ `/nghe-det-chieu` với `mobile: false`.
  - `getProductPage('chieu-duong-dai', 'preview')`: `others` vòng lại thành chieu-cap-dieu, chieu-hoa-cai.
  - `getProductPage('chieu-cap-dieu', 'public')`:
    - `images` rỗng, `primaryImage` null, `hasPattern` false;
    - không chú thích nào có body chứa `[cần`;
    - `imageCaptions` rỗng; `typeNote` null.
  - **Cơ sở dệt** (Review Focus 5). Tạo maker đã đăng, `publicConsent: false`, `contact: '0900'`, gắn vào hiện vật đã đăng:
    - public: `maker` là `null`;
    - JSON của view model không chứa '0900'.
    - Bật `publicConsent` + `verified`: public có `maker.contact` = '0900'.
  - Hiện vật có chú thích 2 trỏ nguồn bị ẩn ở public: `sourceN` null, `sources` rỗng.
  - `getProductPage('khong-co', 'public')` trả `null`. Hiện vật nháp ở public cũng trả `null`.
  - `getProductSlugs()` chỉ gồm hiện vật đã đăng.
- [ ] **Step 2: Chạy test, thấy FAIL.**

  ```
  fnm exec --using=22.23.4 -- npx vitest run tests/int/products.int.spec.ts
  ```

- [ ] **Step 3: Schema.**
  - `Products.ts`:
    - thêm `context` (textarea, localized) và `pattern` (text, localized);
    - trong `annotations` thêm `shortTitle` (text, localized) và `sourceNote` (text, localized).
  - `pageMedia.ts`: thêm slot như Interfaces.
  - Chạy `npm run migrate:create phase5b_products` và kiểm SQL chỉ thêm cột.
- [ ] **Step 4: Copy** `src/lib/content/copy/products.ts`, nguyên văn artboard. Khoá bắt buộc:

```ts
export const productsCopy = {
  breadcrumb: { home: 'Trang chủ', current: 'Sản phẩm' },
  filter: { label: { desktop: 'Lọc theo nhóm', mobile: 'Lọc' }, all: 'Tất cả' },
  count: { desktop: '{n} hiện vật · danh mục theo Vietnam+', mobile: '{n} hiện vật' },
  catalog: { title: 'VỀ DANH MỤC', body: 'Các loại chiếu dưới đây theo bài Vietnam+ (14/08/2026). Tên gọi, đặc điểm và ảnh của từng loại cần cơ sở dệt xác nhận.', link: 'Xem nguồn' },
  tag: { noImage: 'Chưa có ảnh', unconfirmed: 'Ảnh cần xác nhận loại' },
  shotNeeded: { desktop: '{name} chụp phẳng, ánh sáng tự nhiên, kèm cận cảnh mặt dệt', mobile: '{name}' },
  empty: { title: 'Chưa có hiện vật trong nhóm này' },
  cta: { title: 'Muốn tìm đến người làm chiếu?', body: 'Trang này không bán hàng. Danh sách cơ sở dệt sẽ chỉ đăng khi đã xác minh và được cơ sở đồng ý công khai.', action: { href: '/ket-noi', label: 'Kết nối với làng' } },
  detail: {
    back: 'Sản phẩm',
    typeNote: 'Ảnh cần cơ sở dệt xác nhận đúng loại',
    imagesLabel: 'Ảnh hiện vật', thumbLabel: 'Xem ảnh {n}',
    caption: { position: 'Ảnh {i}/{n}', photographer: ' · Ảnh: {name}', unconfirmed: ' · Chưa xác nhận đây là {name}' },
    explore: {
      title: 'KHÁM PHÁ ĐƯỜNG DỆT',
      hint: 'Chạm vào các điểm để xem chi tiết đường dệt',
      hintOther: 'Chọn ảnh 1 để khám phá đường dệt',
      idle: { desktop: 'Chọn một điểm trên ảnh hoặc trong danh sách để phóng to và đọc chú thích.', mobile: 'Chạm một điểm trên ảnh hoặc chọn bên trên để phóng to và đọc chú thích.' },
      markerLabel: 'Chi tiết {n}: {title}', pickerLabel: 'Chọn chi tiết', regionLabel: 'Chú thích chi tiết', close: 'Đóng chi tiết',
    },
    context: { eyebrow: 'BỐI CẢNH', title: 'Một tấm chiếu trong đời sống làng' },
    specs: { material: 'Chất liệu', technique: 'Kỹ thuật', pattern: 'Hoa văn', size: 'Kích thước', maker: 'Nơi làm', care: 'Bảo quản', contact: 'Liên hệ người làm' },
    noMaker: 'Chưa có cơ sở được xác minh và đồng ý công khai',
    connect: { desktop: 'Kết nối với làng →', mobile: 'Kết nối với người làm chiếu', href: '/ket-noi' },
    sourcesTitle: 'Nguồn',
    others: { title: 'Hiện vật khác', eyebrow: 'HIỆN VẬT KHÁC', all: 'Toàn bộ sưu tập', cta: 'Xem hiện vật →' },
    preview: { placeholders: { size: '[chỉ ghi khi đã đo]', maker: { desktop: '[tên cơ sở, nếu được đồng ý]', mobile: '[nếu được đồng ý]' }, care: '[hướng dẫn từ cơ sở dệt]' } },
  },
}
export const productsOtherFixed = { href: '/nghe-det-chieu', slot: 'next-pattern', eyebrow: 'CÁCH LÀM', title: 'Công đoạn tạo hoa văn', cta: 'Xem công đoạn →' } as const
```

  Test `copy.test.ts`: `applyMode(productsCopy, 'public').detail.preview` là `null`.
- [ ] **Step 5: Cài đặt.**
  - **`queries.ts`:**
    - `productCard` tính `tag` (R1), dùng copy.
    - `getProduct`:
      - đọc trường mới;
      - `sourceN` và `sources` theo R2, chỉ tính trên chú thích còn hiện và nguồn `viewable`;
      - `sourceLine` theo R3;
      - `imageCaptions` và `typeNote` theo R6 và R1;
      - `maker.contact` theo R5. Điều kiện public: maker đã đăng, `publicConsent` và `verified`.
  - **`products.ts`:**
    - `createProducts(payload, content)` trả `getProductsPage`, `getProductPage`, `getProductSlugs`.
    - `catalogSourceUrl`: nguồn có `sourceId` 'vietnamplus-2026', chỉ nhận URL `^https?://`.
    - `others` theo R8; ảnh thẻ cố định lấy từ `getPageMedia('san-pham')`.
  - **`index.ts`:** export như Interfaces.
  - **Component:**
    - xoá `productTag` khỏi `labels.ts` (và ca test của nó);
    - `ProductCard` dùng `product.tag`;
    - `PatternTeaser` dùng `a.sourceN` và bỏ khối tự đánh số.
- [ ] **Step 6: Seed.**
  - `products.json` (chieu-cap-dieu), nguyên văn artboard:
    - `context`: "Chiếu cạp điều có trong danh sách các loại chiếu làng làm theo Vietnam+. Vai trò của loại chiếu này trong đời sống (cưới hỏi, lễ Tết, dùng hằng ngày) cần được người làng kể lại.";
    - `material`: "Cói, viền vải [cần xác minh]";
    - `technique`: "Dệt tay hoặc dệt máy: [cần xác minh]";
    - `pattern`: "In bằng khuôn [cần xác minh cho tấm này]".
  - Chú thích:
    - `shortTitle` theo R3;
    - `sourceNote` của 1 và 3: "Quan sát từ ảnh · chưa xác minh";
    - `sourceNote` của 2: "Vietnam+ (14/08/2026) · danh sách hoạ tiết chung, không riêng tấm này".
  - Không seed `size`, `care`, `maker` (R4).
  - `site.ts`: `pageMedia['san-pham'] = [{ slot: 'next-pattern', file: 'kn13.webp' }]`. `mediaFor` nhận thêm `'san-pham'`.
  - `seed.int.spec.ts`: slot `san-pham` có 1 ảnh, chieu-cap-dieu có `context`.
- [ ] **Step 7: Chạy test.** Lint, `test:unit` và `test:int` phải PASS.
- [ ] **Step 8: Commit**

  ```
  git commit -m "feat(content): view model Sản phẩm, nhãn thẻ và đánh số nguồn ở lib"
  ```

### Task 2: Lib cho Thư viện và Kết nối

**Files:**
- Modify: `src/lib/content/{types,queries,pages,categories,index}.ts`, `src/seed/data/site.ts`
- Create: `src/lib/content/archive.ts`, `src/lib/content/copy/{archive,connect}.ts`, `tests/int/archive.int.spec.ts`, `tests/int/connect.int.spec.ts`
- Test: `tests/unit/copy.test.ts`, hai file int trên

**Interfaces:**
- Produces:

```ts
export interface ArchiveItemView { /* như cũ */
  code: string                                    // mã gốc 'TL-001' (khoá ?anh=)
  takenAt: string | null; photographer: string | null; source: string | null
  rights: Variant                                 // R14, đã chọn nhãn
  sourceVerified: boolean                         // R12
}
export interface ArchivePageView {
  intro: PageIntroView
  items: ArchiveItemView[]                        // chỉ mục có code
  stats: { total: number; verified: number }
  categories: { key: string; label: string }[]    // "Tất cả" + ARCHIVE_CATEGORY_OPTIONS
  eras: { key: 'all' | 'old' | 'now'; label: string }[]
  hasOld: boolean
  copy: ArchiveCopyView
}
export interface ConnectPageView {
  intro: PageIntroView                            // title giữ '\n'
  contact: {
    email: string | null; phone: string | null    // R18: preview trống → null, component dùng copy.preview
    address: string | null; addressNote: string | null
    visitInfo: string | null
  }
  copy: ConnectCopyView
}
```

- Produces (`index.ts`): `getArchivePage(mode)`, `getConnectPage(mode)`, đều bọc `cache()`.
- `ArchiveTeaser` (trang chủ) không đổi hành vi. Nó vẫn đọc `image.code`/`docNumber` như cũ.

- [ ] **Step 1: Test int.**
  - **`archive.int.spec.ts`:**
    - preview: 14 mục theo thứ tự mã;
    - `stats` = `{ total: 14, verified: 0 }`;
    - 7 chip chủ đề;
    - `hasOld` false;
    - TL-001 có `rights.desktop` "Chưa xin phép · không đăng công khai" và `rights.mobile` "Chưa xin phép";
    - `photographer` = '[cần xác minh]'.
  - **Public** (Review Focus 1): `items` rỗng, `stats.total` 0, và JSON view model không chứa "nkc10" hay "Bên khung dệt".
  - Một asset `rights: 'permitted'`, `subjectConsent: 'not_applicable'`, đủ `takenAt`/`photographer`/`source`:
    - public có 1 mục, `rights.desktop` "Được phép", `sourceVerified` true;
    - `stats.verified` 1.
  - Asset có `photographer` "[cần xác minh]" thì `sourceVerified` false.
  - **`connect.int.spec.ts`:**
    - public: `email`/`phone` null, `address` là chuỗi seed, `visitInfo` null;
    - `intro.title` chứa '\n' (R17).
- [ ] **Step 2: Chạy test, thấy FAIL.**
- [ ] **Step 3: Copy.** `copy/archive.ts` và `copy/connect.ts`, nguyên văn artboard. Khoá bắt buộc:

```ts
export const archiveCopy = {
  breadcrumb: { home: 'Trang chủ', current: 'Thư viện' },
  stats: { total: 'TƯ LIỆU', verified: 'ĐÃ XÁC MINH NGUỒN' },
  filter: { label: 'Lọc theo nhóm', all: 'Tất cả', eraLabel: 'Thời kỳ', eraAll: 'Mọi thời kỳ' },
  count: '{n} tư liệu', noOld: ' · chưa có ảnh xưa',
  docLabel: 'TL', open: 'Mở ảnh: {title}',
  empty: {
    title: 'Chưa có tư liệu trong nhóm này',
    body: { desktop: 'Ảnh xưa, giấy tờ cũ, ký ức của các gia đình làng Hới là phần quý nhất của thư viện, và hiện chưa có. Nếu gia đình bạn còn giữ, hãy góp cùng làng.',
            mobile: 'Nếu gia đình bạn còn giữ ảnh cũ, hãy góp cùng làng.' },
    action: { href: '/ket-noi', label: 'Góp tư liệu' },
  },
  lightbox: {
    label: 'Xem ảnh', close: 'Đóng', prev: 'Ảnh trước', next: 'Ảnh tiếp',
    position: '{i} / {n}', keys: ' · ← → để chuyển ảnh', swipe: 'Vuốt ngang để chuyển ảnh',
    meta: { takenAt: 'Thời gian', photographer: 'Người chụp', source: 'Nguồn', rights: 'Quyền dùng', related: 'Liên quan' },
  },
  rights: {
    unknown: { desktop: 'Chưa xin phép · không đăng công khai', mobile: 'Chưa xin phép' },
    restricted: { desktop: 'Hạn chế · không đăng công khai', mobile: 'Hạn chế' },
  },
  cta: { title: 'Nhà bạn còn giữ ảnh cũ của làng?', body: 'Một tấm ảnh cưới trải chiếu, một buổi phơi cói, một góc nhà có khung dệt. Chúng tôi sẽ ghi công và hỏi ý bạn trước khi đăng.', action: { href: '/ket-noi', label: 'Góp tư liệu' } },
}
export const connectCopy = {
  breadcrumb: { home: 'Trang chủ', current: 'Kết nối' },
  ways: [
    { n: '01', title: 'Góp ảnh và ký ức', body: 'Ảnh cũ, giấy tờ, câu chuyện của gia đình bạn về nghề chiếu.' },
    { n: '02', title: 'Giới thiệu người giữ nghề', body: 'Chúng tôi sẽ hỏi ý họ trước khi ghi lại bất cứ điều gì.' },
    { n: '03', title: 'Kết nối cơ sở dệt', body: 'Danh sách cơ sở chỉ công khai khi đã xác minh và được đồng ý.' },
    { n: '04', title: 'Hợp tác văn hoá', body: 'Nghiên cứu, triển lãm, giáo dục về làng nghề.' },
  ],
  form: {
    title: 'Góp một ký ức',
    lead: 'Chúng tôi đọc từng đóng góp, liên hệ để xác minh, và chỉ đăng khi bạn đồng ý.',
    note: { desktop: 'Bản minh hoạ thiết kế. Chưa có hệ thống nhận đóng góp thật; không có dữ liệu nào được gửi đi.',
            mobile: 'Bản minh hoạ. Chưa có hệ thống nhận thật; không dữ liệu nào được gửi đi.' },
    name: { label: 'Họ và tên', error: 'Vui lòng cho biết tên để chúng tôi xưng hô.' },
    contact: { label: 'Số điện thoại hoặc email', error: 'Cần một cách liên lạc để xác minh đóng góp.' },
    type: { legend: 'Bạn muốn góp gì?', options: [
      { value: 'photo', label: 'Ảnh hoặc giấy tờ cũ' }, { value: 'story', label: 'Một câu chuyện, ký ức' },
      { value: 'person', label: 'Giới thiệu người giữ nghề' }, { value: 'other', label: 'Hợp tác, câu hỏi khác' } ] },
    story: { label: 'Câu chuyện hoặc mô tả', hint: 'Ví dụ: ảnh chụp năm nào, ai trong ảnh, ở đâu trong làng.' },
    upload: { label: 'Ảnh hoặc tệp', title: 'Kéo ảnh vào đây hoặc chọn tệp', hint: 'JPG, PNG · minh hoạ, chưa có hệ thống tải lên' },
    consent: { label: 'Tôi là chủ sở hữu hoặc được phép chia sẻ tư liệu này, và đồng ý để Chiếu Hới liên hệ xác minh, đăng kèm ghi công khi tôi duyệt.', error: 'Cần xác nhận quyền chia sẻ trước khi gửi.' },
    summary: { count: 'Còn {n} mục cần bổ sung.', rest: ' Xem các ô được đánh dấu bên dưới.' },
    submit: 'Gửi đóng góp', withdraw: 'Bạn có thể yêu cầu gỡ đóng góp bất cứ lúc nào.',
    success: { title: 'Cảm ơn {name}.', fallbackName: 'bạn', body: 'Chúng tôi sẽ liên hệ qua {contact} để xác minh trước khi đăng. (Màn hình minh hoạ: chưa có dữ liệu nào thực sự được gửi.)', fallbackContact: 'thông tin bạn để lại', again: 'Góp thêm một ký ức' },
  },
  contact: {
    title: 'Thông tin liên hệ',
    labels: { email: 'EMAIL', phone: 'ĐIỆN THOẠI', address: 'ĐỊA CHỈ', visit: 'THĂM LÀNG' },
    noVisit: { desktop: 'Chưa có thông tin tham quan chính thức', mobile: 'Thăm làng: chưa có thông tin chính thức' },
    visitPrefix: { desktop: null, mobile: 'Thăm làng: ' },
    preview: { email: '[Email liên hệ]', phone: '[Số điện thoại]' },
  },
}
```

  Test `copy.test.ts`: `applyMode(connectCopy, 'public').contact.preview` là `null`.
- [ ] **Step 4: Cài đặt.**
  - `queries.ts` `getArchive`: thêm các trường mới. `rights` theo R14, nhãn "Được phép" lấy qua `archiveRightsLabel` mới ở `categories.ts` (từ option của collection). Bỏ mục không có `code`.
  - `archive.ts`: `createArchive(payload, content)` dựng `ArchivePageView` theo R12 và R13.
  - `pages.ts`: `getConnectPage` dùng `getPageIntro('ket-noi')` và `getSiteSettings`.
  - `site.ts`: `pageIntros['ket-noi'].title` theo R17.
- [ ] **Step 5: Chạy test.** Lint, `test:unit`, `test:int` PASS.
- [ ] **Step 6: Commit**

  ```
  git commit -m "feat(content): view model Thư viện và Kết nối"
  ```

### Task 3: Component chung dạng tĩnh

**Files:**
- Create: `src/components/ui/{CtaBand,Segmented}.tsx`, `tests/unit/ui/{cta-band,segmented}.test.tsx`
- Modify: `src/components/ui/{Feedback,FactList}.tsx`, `src/components/content/{ContentImage,PageHeader,ProductCard}.tsx`, `src/components/people/{PeopleView,PersonView}.tsx`, `src/app/(frontend)/styleguide/page.tsx`, `src/components/styleguide/fixtures.ts`
- Test: `tests/unit/components/{feedback,cards,primitives}.test.tsx`, `tests/unit/people/*`

**Interfaces (Produces):**

```ts
// ui/CtaBand (R10): grid 12 cột, chữ cột 1–7, nút cột 9–12 căn phải; h2 44px; mặc định max-md:hidden
CtaBand(props: { title: string; body: string; action: { href: string; label: string }; tone: 'inverse' | 'secondary' | 'primary'; className?: string })
// ui/Segmented: nhóm nút aria-pressed trong role="group"; stretch = mỗi nút flex-1 cao 48 (mobile hiện vật)
Segmented<K extends string>(props: { label: string; options: { key: K; label: string }[]; value: K; onChange: (k: K) => void; tone?: 'light' | 'dark'; stretch?: boolean })
EmptyState: thêm tone?: 'light' | 'dark'
SuccessState: thêm action?: { label: string; onClick: () => void }; size?: 'md' | 'lg'; headingLevel?: 'h3' | 'span'
FactList: thêm columns?: 1 | 2 (desktop 2 cột, hàng đầu viền đậm theo artboard ProductDetail)
ContentImage: thêm fit?: 'cover' | 'contain'; notesPosition?: 'bottom-left' | 'bottom-right' | 'top-right'   (R20)
PageHeader: thêm accentLastLine?: boolean                                                       (R17)
ProductCard: thêm showSummary?: boolean; shotNeeded: Variant (chữ khung "Ảnh cần chụp")
```

- **`CtaBand`.** Màu theo tone:
  - `inverse`: nền xanh làng, chữ phụ `text-on-dark-muted`, nút viền sáng (`Button variant="outline-dark"` nếu khớp);
  - `secondary`: nền `bg-secondary`, nút primary;
  - `primary`: nền `bg-primary`, nút primary.
  - `PeopleView` thay khối mời bằng `CtaBand tone="secondary"`, giữ nguyên copy và test cũ.
- **`ProductCard`** theo artboard ProductsIndex và ProductsMobile:
  - ảnh 340 / 220;
  - tên 32 / 26px;
  - tóm tắt 15px chỉ ở desktop, khi `showSummary`;
  - khung `ShotNeeded` lấy chữ theo `Variant`.
- **`PersonView`**: chân dung dùng `notesPosition="top-right"` (F3).

- [ ] **Step 1: Test unit.**
  - `CtaBand`: có h2, link đúng href, tone `inverse` có class nền inverse.
  - `Segmented`:
    - bấm nút gọi `onChange`;
    - đúng một nút `aria-pressed="true"`;
    - `stretch` thì mỗi nút có `flex-1`.
  - `EmptyState tone="dark"` dùng viền `border-on-dark`.
  - `SuccessState`:
    - `action` render `<button>`, bấm gọi `onClick`;
    - vẫn có `role="status"`.
  - `ContentImage` có cờ `rights-not-permitted`:
    - `notesPosition="top-right"` đặt nhãn ở `top-3 right-3`;
    - `fit="contain"` cho `object-contain`.
  - `PageHeader accentLastLine` với title "A\nB": "B" nằm trong `<em>`.
  - `ProductCard`:
    - `showSummary` hiện tóm tắt;
    - `tag` dashed render Tag dashed.
  - `PersonView` preview: nhãn "Ảnh chưa được phép đăng" không nằm cùng góc với figcaption.
- [ ] **Step 2: Chạy test, thấy FAIL.** Sau đó cài đặt, thêm mọi biến thể mới lên `/styleguide`.
- [ ] **Step 3: Chạy test.** Lint, unit PASS. Chụp `/con-nguoi` (khối mời) và `/con-nguoi/mau-nghe-nhan` preview ở 1440 và 390, so với trước khi sửa.
- [ ] **Step 4: Commit**

  ```
  git commit -m "feat(ui): CtaBand, Segmented, biến thể ContentImage/EmptyState/SuccessState/PageHeader/ProductCard"
  ```

### Task 4: PatternExplorer

**Files:**
- Create: `src/components/ui/PatternMarker.tsx`, `src/components/content/{AnnotationNote,StageHint,PatternExplorer}.tsx`, `tests/unit/content/pattern-explorer.test.tsx`
- Modify: `src/components/home/PatternTeaser.tsx`, styleguide
- Test: `tests/unit/home/*` (PatternTeaser giữ nguyên hành vi)

**Interfaces:**
- Consumes: `ProductView` (Task 1), `Segmented`, `ContentImage notesPosition` (Task 3), `FootnoteRef`.
- Produces:

```ts
// ui: nút tròn 44px đặt theo %, aria-pressed; on = nền nhấn + vòng; hidden = opacity 0 + pointer-events none + tabIndex -1
PatternMarker(props: { n: number; x: number; y: number; pressed: boolean; hidden?: boolean; label: string; onClick: () => void })
// content: "n · tiêu đề", nội dung (+ FootnoteRef tới #nguon-n), dòng nguồn; variant panel = khung FBF6EE viền nhấn 3px
AnnotationNote(props: { annotation: ProductView['annotations'][number]; productSlug: string; variant: 'panel' | 'teaser'; headingSize?: 'md' | 'lg' })
// content: nhãn tối góc trên trái kèm ô "check"
StageHint(props: { children: ReactNode; className?: string })
PatternExplorer(props: { product: ProductView; copy: ProductsCopyView['detail'] })
```

Hành vi (R7, artboard ProductDetail/ProductMobile):

| Trạng thái | Desktop | Mobile |
| --- | --- | --- |
| Sân khấu | cột 1–8, cao 620, nền tối; `StageHint` theo ảnh đang xem | tràn viền cao 340, `object-position` 30% 50%, không có hint |
| Ảnh nhỏ | lưới 4 cột cao 110, `aria-pressed`, `aria-label` "Xem ảnh {n}"; dưới là `imageCaptions[i]` | không có |
| Danh sách điểm | cột 10–12 dưới tiêu đề "KHÁM PHÁ ĐƯỜNG DỆT": hàng nút `aria-pressed`, mục đang chọn chữ display 24px màu nhấn | `Segmented stretch` dưới ảnh, nhãn "{n} · {shortTitle ?? title}" |
| Đang chọn | phóng 2.2 lần quanh (x, y), ẩn điểm khác, nút "Đóng chi tiết" góc trên phải, `AnnotationNote` panel trong `role="region" aria-live="polite"` | như desktop, panel nằm dưới hàng nút |
| Chưa chọn | câu `idle.desktop` | câu `idle.mobile` |

- Esc khi đang phóng thì thu nhỏ.
- Đổi ảnh nhỏ thì bỏ chọn điểm.
- Khi giảm chuyển động: bỏ `transition` của sân khấu và điểm.
- `<noscript>` chứa danh sách `AnnotationNote` của mọi chú thích.
- `PatternTeaser` viết lại bằng `PatternMarker`, `StageHint` và `AnnotationNote variant="teaser"`. Giữ markup và test hiện có.

- [ ] **Step 1: Test unit `PatternExplorer`** (fixture 3 chú thích, 4 ảnh).
  - Có 3 `PatternMarker` với `aria-label` "Chi tiết 1: Viền chiếu".
  - Bấm điểm 2:
    - `aria-pressed="true"`;
    - ảnh sân khấu có `transform` chứa `scale(2.2)` và `transform-origin` "52% 60%";
    - điểm 1 và 3 có `tabIndex=-1`;
    - region chứa nội dung chú thích 2 và link `#nguon-1`.
  - Bấm lại điểm 2 thì thu nhỏ. Esc cũng thu nhỏ.
  - Bấm ảnh nhỏ 3:
    - điểm biến mất;
    - hint thành "Chọn ảnh 1 để khám phá đường dệt";
    - chọn điểm từ danh sách thì quay về ảnh 1.
  - `product.hasPattern` false thì không render điểm và danh sách; sân khấu vẫn hiện ảnh nếu có.
  - Render server (`renderToString`) có `<noscript>` chứa đủ 3 tiêu đề.
- [ ] **Step 2: Chạy test, thấy FAIL.** Sau đó cài đặt và thêm lên `/styleguide`.
- [ ] **Step 3: Chạy test.** Lint, unit PASS. Test `PatternTeaser` cũ PASS không cần sửa assert.
- [ ] **Step 4: Commit**

  ```
  git commit -m "feat(content): PatternExplorer; PatternTeaser dùng chung điểm và chú thích"
  ```

### Task 5: Lightbox và lưới thư viện

**Files:**
- Create: `src/components/ui/Lightbox.tsx`, `src/components/content/ArchiveGallery.tsx`, `tests/unit/ui/lightbox.test.tsx`, `tests/unit/content/archive-gallery.test.tsx`
- Modify: `src/app/(frontend)/globals.css` (token), styleguide

**Interfaces:**
- Consumes: `ArchivePageView` (Task 2), `FilterChips tone="dark"`, `Segmented tone="dark"`, `EmptyState tone="dark"`, `ContentImage fit/notesPosition`, `ArchiveChip`.
- Produces:

```ts
// ui: khung hộp thoại toàn màn hình; không biết gì về tư liệu
Lightbox(props: {
  label: string                       // aria-label của dialog
  position: ReactNode                 // "{i} / {n} · ← → để chuyển ảnh"
  closeHref: string; prevHref: string; nextHref: string   // R11: <a>, JS chặn
  onClose: () => void; onPrev: () => void; onNext: () => void
  closeLabel: string; prevLabel: string; nextLabel: string
  image: ReactNode                    // vùng ảnh
  children: ReactNode                 // metadata
  returnFocusRef?: RefObject<HTMLElement | null>
})
// content: bộ lọc + lưới + lightbox; giữ state cat/era/open
ArchiveGallery(props: { page: ArchivePageView; initialCode: string | null })
```

- **Token mới** trong `globals.css` và `@theme`:
  - `--overlay-lightbox: rgba(16,20,17,.97)`;
  - `--bg-lightbox-stage: #101411`;
  - `--border-on-dark-soft: rgba(243,235,221,.18)`, nếu chưa có token tương đương.
- **`Lightbox`:**
  - `role="dialog" aria-modal="true"`, `fixed inset-0`, nền token.
  - Desktop: lưới `1fr 360px`, ảnh cao 640.
  - Mobile: cột dọc, ảnh cao 300, hai nút 48 dưới ảnh kèm câu "Vuốt ngang để chuyển ảnh".
  - Khi mở, focus nút Đóng. Tab và Shift+Tab quay vòng trong hộp.
  - ← → gọi `onPrev`/`onNext`. Esc gọi `onClose`.
  - Khi đóng, trả focus về `returnFocusRef`.
  - Vuốt bằng pointer events: ngang ≥ 40px và lớn hơn độ lệch dọc.
  - Không đổi `overflow` của `body` (R15).
- **`ArchiveGallery`:**
  - **Bộ lọc** theo R13, với `FilterChips tone="dark"` (mobile tự thành dải vuốt) và `Segmented tone="dark"` chỉ ở desktop.
  - **Đếm** "{n} tư liệu" trong `role="status"`.
  - **Lưới:**
    - desktop 4 cột, `auto-rows-[220px]`, `grid-flow-dense`, gap 12;
    - mobile 2 cột, `auto-rows-[160px]`, gap 8;
    - span lặp theo mảng `spans` của từng artboard (14 mẫu desktop, 10 mẫu mobile).
  - **Ô ảnh:**
    - là `<a href="/thu-vien?anh={code}" aria-label="Mở ảnh: {title ?? code}">`, ảnh `alt=""`;
    - `ArchiveChip` góc dưới trái: desktop "TL · 001 · LÀNG QUÊ", mobile "TL · 001";
    - nhãn quyền ảnh của `ContentImage` ở `top-right`.
  - **Mở lightbox:**
    - `initialCode` khớp (không phân biệt hoa thường) thì mở sẵn ở lần render đầu, và bộ lọc về "Tất cả";
    - mở/chuyển ảnh/đóng thì `history.replaceState` đặt hoặc bỏ `?anh=`;
    - Trước/Tiếp vòng trong danh sách đang lọc;
    - đổi bộ lọc thì đóng.
  - **Metadata** theo R14:
    - eyebrow "{TL · 001} · {CHỦ ĐỀ}" viết hoa bằng CSS;
    - h2 tiêu đề, mô tả;
    - `dl`: desktop 5 dòng, mobile 3 dòng; dòng `null` thì bỏ;
    - "Liên quan" là link nội bộ.
  - **Trống:** `EmptyState tone="dark" size="lg"` với copy.empty.

- [ ] **Step 1: Test unit `Lightbox`.**
  - Mở thì `document.activeElement` là nút "Đóng".
  - Tab từ phần tử cuối quay về nút Đóng. Shift+Tab từ nút Đóng sang phần tử cuối.
  - ArrowRight gọi `onNext`, ArrowLeft gọi `onPrev`, Escape gọi `onClose`.
  - Vuốt pointer từ x=200 tới x=120 gọi `onNext`. Vuốt 20px không gọi gì.
  - `body.style.overflow` không đổi.
- [ ] **Step 2: Test unit `ArchiveGallery`** (fixture 3 mục: TL-001 village, TL-002 weaving, TL-003 weaving).
  - Lọc "Nghề dệt" thì còn 2 ô, status "2 tư liệu".
  - Chọn "Xưa" thì status "0 tư liệu · chưa có ảnh xưa" và hiện khung trống.
  - `initialCode="tl-002"` thì dialog mở sẵn ở render đầu, với h2 là tiêu đề TL-002.
  - Bấm ô TL-001:
    - mở dialog;
    - `history.replaceState` được gọi với URL chứa `anh=TL-001`;
    - bấm "Ảnh tiếp" sang TL-002;
    - đóng thì URL không còn `anh=`, focus về ô TL-001.
  - Lọc còn 1 ảnh: "Ảnh tiếp" giữ nguyên ảnh đó.
  - `initialCode="TL-999"`: không có dialog.
  - Mục có `photographer: null` không có dòng "Người chụp".
- [ ] **Step 3: Chạy test, thấy FAIL.** Sau đó cài đặt và thêm lên `/styleguide` (Lightbox mở sẵn với fixture).
- [ ] **Step 4: Chạy test.** Lint, unit PASS.
- [ ] **Step 5: Commit**

  ```
  git commit -m "feat(ui): Lightbox giữ focus, lưới thư viện có ?anh="
  ```

### Task 6: Component form

**Files:**
- Create: `src/components/ui/form/{TextField,TextArea,ChoiceGroup,ConsentCheck,ErrorSummary,UploadPlaceholder}.tsx`, `tests/unit/ui/form.test.tsx`
- Modify: styleguide

**Interfaces (Produces):**

```ts
TextField(props: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string | null; autoComplete?: string; type?: 'text' | 'email' })
TextArea(props: { id: string; label: string; value: string; onChange: (v: string) => void; hint?: string; rows?: number })
ChoiceGroup<V extends string>(props: { name: string; legend: string; options: { value: V; label: string }[]; value: V; onChange: (v: V) => void })
ConsentCheck(props: { id: string; label: string; checked: boolean; onChange: (c: boolean) => void; error?: string | null })
ErrorSummary = forwardRef<HTMLDivElement, { count: number; text: { count: string; rest: string } }>   // role="alert", tabIndex -1
UploadPlaceholder(props: { label: string; title: string; hint: string })
```

Theo artboard ConnectPage và Components (mục "Form góp tư liệu"):
- **Ô nhập:**
  - cao 52, nền `bg-raised`, viền 1px `border-dashed`;
  - lỗi: viền 2px nhấn, `aria-invalid="true"`, `aria-describedby` trỏ tới dòng lỗi 13px có biểu tượng tròn;
  - focus: viền 2px xanh làng.
- **`ChoiceGroup`:**
  - `<fieldset><legend>` với `<input type="radio">` thật, ẩn bằng `sr-only` và giữ focus nhìn thấy trên thẻ;
  - thẻ cao 52 có chấm 16px: chọn thì viền chấm 5px nhấn, thẻ nền `bg-raised` viền 2px mực;
  - lưới 2 cột ở desktop, 1 cột ở mobile.
- **`ConsentCheck`:** `<input type="checkbox">` thật trong `<label>`. Ô 22px: chọn thì nền xanh làng với dấu ✓, lỗi thì viền 2px nhấn.
- **`ErrorSummary`:** nền `bg-raised`, viền trên 3px nhấn. Không render khi `count` = 0.
- **`UploadPlaceholder`:** khung nét đứt tĩnh, không có input (R16).

- [ ] **Step 1: Test unit.**
  - `TextField` có lỗi:
    - `getByLabelText('Họ và tên')` có `aria-invalid="true"`;
    - `aria-describedby` trỏ tới phần tử chứa chữ lỗi;
    - không lỗi thì không có `aria-describedby`.
  - `ChoiceGroup`:
    - 4 radio cùng `name`, đúng một radio `checked`;
    - mũi tên xuống chuyển lựa chọn (hành vi native của radio, kiểm qua `userEvent.keyboard`);
    - có `legend`.
  - `ConsentCheck`: bấm vào chữ nhãn thì đổi `checked`.
  - `ErrorSummary`:
    - `count=2` render "Còn 2 mục cần bổ sung." trong `role="alert"`;
    - `count=0` không render.
  - `UploadPlaceholder` không có `input`.
- [ ] **Step 2: Chạy test, thấy FAIL.** Sau đó cài đặt và thêm lên `/styleguide` (đủ trạng thái mặc định, lỗi, đã chọn).
- [ ] **Step 3: Chạy test.** Lint, unit PASS.
- [ ] **Step 4: Commit**

  ```
  git commit -m "feat(ui): component form (ô nhập, lựa chọn, đồng ý, tổng hợp lỗi)"
  ```

### Task 7: Trang `/san-pham`

**Files:**
- Create: `src/app/(frontend)/san-pham/page.tsx`, `src/components/products/ProductsView.tsx`, `tests/unit/products/products-view.test.tsx`, `tests/e2e/products.e2e.spec.ts`
- Modify: `src/seed/data/site.ts` (ngắt dòng tiêu đề `san-pham`, và `thu-vien` cho Task 9)

**Interfaces:** Consumes `ProductsPageView`, `PageHeader`, `FilterableList`, `ProductCard`, `EmptyState`, `CtaBand`, `ThreadsDivider`.

Bố cục theo artboard ProductsIndex và ProductsMobile:
1. **`PageHeader`:**
   - title có ngắt dòng (seed "Nét đẹp từ những đường dệt." thêm `\n` sau "từ" ở `site.ts`);
   - `aside` là khung "VỀ DANH MỤC", desktop, viền `border-subtle`;
   - mobile không có breadcrumb, theo artboard.
2. `ThreadsDivider` (desktop).
3. **`FilterableList`:**
   - lưới 3 cột (mobile 1 cột), khoảng hàng 64 / 28;
   - `ProductCard showSummary`;
   - đếm theo R9;
   - không có tìm kiếm và "Xem thêm".
4. **`CtaBand tone="inverse"`.**

`generateMetadata`: title từ intro.

- [ ] **Step 1: Test unit `ProductsView`.**
  - Có 3 chip.
  - Lọc "Chiếu đương đại" thì còn 1 thẻ, status "1 hiện vật · danh mục theo Vietnam+".
  - Thẻ không ảnh có "ẢNH CẦN CHỤP".
  - `catalogSourceUrl: null` thì không có link "Xem nguồn".
- [ ] **Step 2: Chạy test, thấy FAIL.** Sau đó cài đặt.
- [ ] **Step 3: E2E** (preview: các spec preview; public: `public-pages.e2e.spec.ts`).
  - Lọc theo chip.
  - Link thẻ tới `/san-pham/chieu-cap-dieu`.
  - 390 không cuộn ngang.
  - axe sạch ở 1440 và 390.
- [ ] **Step 4: Kiểm tra.** Lint, unit, e2e và build PASS. Chụp so với `ProductsIndex.jpg` và `ProductsMobile.jpg`.
- [ ] **Step 5: Commit**

  ```
  git commit -m "feat(products): trang danh sách Sản phẩm"
  ```

### Task 8: Trang `/san-pham/[slug]`

**Files:**
- Create: `src/app/(frontend)/san-pham/[slug]/page.tsx`, `src/components/products/ProductView.tsx`, `tests/unit/products/product-view.test.tsx`
- Modify: `tests/e2e/products.e2e.spec.ts`

**Interfaces:** Consumes `ProductPageView`, `Breadcrumb`, `BackLink`, `PatternExplorer`, `DetailTitle`, `Eyebrow`, `Tag`, `FactList columns={2}`, `SourceList`, `ReadNext`, `Button`, `LinkArrow`.

Bố cục theo artboard ProductDetail và ProductMobile:
1. Breadcrumb (desktop, mục cuối là tên) hoặc `BackLink` "Sản phẩm" (mobile).
2. **`PatternExplorer`:**
   - Desktop: cột 1–8.
   - Cột 10–12: eyebrow "{code} · {nhóm}", h1 52px, `typeNote` (Tag filled), rồi danh sách điểm.
   - Mobile: thứ tự là ảnh → nút chia ô → chú thích → eyebrow/h1/typeNote → `context`.
   - Hiện vật không có ảnh nào: sân khấu là `ShotNeeded`.
3. **"BỐI CẢNH":**
   - desktop cột 1–4: eyebrow, h2 40px, `context`;
   - bảng thông tin cột 6–12, 2 cột (`FactList columns={2}`), thứ tự: Chất liệu, Kỹ thuật, Hoa văn, Kích thước, Nơi làm, Bảo quản;
   - dòng liên hệ trải 2 cột kèm `LinkArrow` "Kết nối với làng" (R5).
   - Mobile: `FactList layout="inline"`, bỏ dòng liên hệ, thêm nút viền full width.
   - Dòng trống: ở public thì bỏ; ở preview hiện placeholder copy (R4), nếu không có thì hiện `[cần xác minh]`.
   - Không còn dòng nào và không có `context` thì bỏ cả section.
4. **"Nguồn"** (R2): `SourceList idPrefix="nguon-"`, chỉ khi `sources.length > 0`.
5. **`ReadNext`:** title "Hiện vật khác", eyebrow mobile "HIỆN VẬT KHÁC", action "Toàn bộ sưu tập" → `/san-pham`, ảnh cao 240.

`generateStaticParams` trả `getProductSlugs()` (R21). `generateMetadata`: title là tên. OG là `primaryImage`, chỉ khi có.

- [ ] **Step 1: Test unit `ProductView`.**
  - **Public fixture** (không ảnh, maker null, không chú thích):
    - không có nút "Chi tiết 1";
    - có "Chưa có cơ sở được xác minh và đồng ý công khai";
    - không có chữ `[chỉ ghi khi đã đo]`;
    - không có khối "Nguồn".
  - **Preview fixture:**
    - có 3 điểm;
    - có dòng "Kích thước" với "[chỉ ghi khi đã đo]";
    - có `id="nguon-1"`;
    - "Hiện vật khác" có 3 thẻ, thẻ thứ 3 `max-md:hidden`.
- [ ] **Step 2: Chạy test, thấy FAIL.** Sau đó cài đặt.
- [ ] **Step 3: E2E.**
  - **Preview `/san-pham/chieu-cap-dieu`:**
    - bấm điểm 2 thì region có chú thích, có nút "Đóng chi tiết";
    - Esc thu nhỏ;
    - link `#nguon-1` tồn tại;
    - bấm link nguồn ở `PatternTeaser` trang chủ thì tới đúng neo trên trang này (Review Focus 4).
  - **Public:**
    - `/san-pham/chieu-cap-dieu` trả 200, không có `img` từ `/images/reference`, không có tên/liên hệ cơ sở;
    - `/san-pham/khong-co` trả 404.
  - **Không JS** (preview, `javaScriptEnabled: false`): nội dung `<noscript>` có đủ 3 tiêu đề.
  - axe sạch ở 1440 và 390, cả lúc đang phóng.
- [ ] **Step 4: Kiểm tra.** Lint, unit, e2e và build PASS. Chụp so với `ProductDetail.jpg` và `ProductMobile.jpg`.
- [ ] **Step 5: Commit**

  ```
  git commit -m "feat(products): trang hiện vật có khám phá đường dệt"
  ```

### Task 9: Trang `/thu-vien`

**Files:**
- Create: `src/app/(frontend)/thu-vien/page.tsx`, `src/components/archive/ArchiveView.tsx`, `tests/unit/archive/archive-view.test.tsx`, `tests/e2e/archive.e2e.spec.ts`

**Interfaces:** Consumes `ArchivePageView`, `PageHeader` (nền tối), `ArchiveGallery`, `CtaBand tone="primary"`, `ThreadsDivider`.

- `page.tsx` nhận `searchParams: Promise<{ anh?: string | string[] }>`. Chỉ lấy chuỗi đầu, rồi truyền `initialCode` (R11).
- Toàn trang nền `bg-deep`, chữ `text-on-dark`, tới hết lưới. `CtaBand` nền sáng.
- **`PageHeader`:**
  - eyebrow, h1 (seed thêm `\n` sau "Ký ức qua"), lead;
  - `aside` desktop là `dl` hai số "TƯ LIỆU" và "ĐÃ XÁC MINH NGUỒN", số 36px display;
  - nếu `PageHeader` chưa có tone tối thì thêm prop `tone?: 'light' | 'dark'` (đổi màu breadcrumb, eyebrow vàng `accent-on-dark`), kèm test.
- `generateMetadata`: title từ intro. Khi `?anh=` khớp một mục thì title là "{tiêu đề} · Thư viện" và OG là ảnh đó.

- [ ] **Step 1: Test unit `ArchiveView`.**
  - Có h1, có "TƯ LIỆU", có `CtaBand` "Nhà bạn còn giữ ảnh cũ của làng?".
  - `items` rỗng thì có "Chưa có tư liệu trong nhóm này" và "0 tư liệu".
- [ ] **Step 2: Chạy test, thấy FAIL.** Sau đó cài đặt.
- [ ] **Step 3: E2E.**
  - **Preview:**
    - bấm ô đầu thì dialog mở, URL có `?anh=TL-001`, focus ở "Đóng";
    - ArrowRight sang TL-002;
    - Tab 10 lần vẫn trong dialog;
    - Esc đóng, URL bỏ `?anh=`, focus về ô TL-001;
    - mở trực tiếp `/thu-vien?anh=TL-005` thì dialog mở với "Chiếu phơi trên bãi cỏ";
    - 390: vuốt (`page.mouse` kéo ngang) chuyển ảnh.
  - **Không JS** (preview): `/thu-vien?anh=TL-002` có dialog trong HTML. Link "Ảnh tiếp" có `href` chứa `anh=TL-003`.
  - **Public** (`public-pages.e2e.spec.ts`), Review Focus 1:
    - `/thu-vien` có "0 tư liệu";
    - `/thu-vien?anh=TL-004` không có `role="dialog"`, và `page.content()` không chứa `nkc10`, `TL-004` hay "Bên khung dệt".
  - Link "Mở thư viện ảnh" và ô ảnh của `ArchiveTeaser` trang chủ (preview) mở đúng ảnh.
  - axe sạch ở 1440 và 390, cả lúc dialog mở.
- [ ] **Step 4: Kiểm tra.** Lint, unit, e2e và build PASS. Chụp so với `ArchivePage.jpg` và `ArchiveMobile.jpg`, cả lúc lightbox mở.
- [ ] **Step 5: Commit**

  ```
  git commit -m "feat(archive): trang Thư viện có lightbox và ?anh="
  ```

### Task 10: Trang `/ket-noi`

**Files:**
- Create: `src/app/(frontend)/ket-noi/page.tsx`, `src/components/connect/{ConnectView,ConnectForm}.tsx`, `tests/unit/connect/{connect-view,connect-form}.test.tsx`, `tests/e2e/connect.e2e.spec.ts`

**Interfaces:** Consumes `ConnectPageView`, `PageHeader accentLastLine`, form component (Task 6), `SuccessState action`, `VerifyNote` (khung "minh hoạ", `role="note"`), `FactList columns={2}`.

Bố cục theo artboard ConnectPage và ConnectMobile:
1. **`PageHeader accentLastLine`.**
2. **Bốn cách kết nối** (R19): lưới 4 cột, mỗi mục có viền trên, số 12px, tiêu đề 28px, mô tả 15px. Chỉ desktop.
3. **Section form:**
   - nền `bg-secondary`, `aria-labelledby` tới h2 "Góp một ký ức" (48 / 30px);
   - cột 1–4: h2, lead (desktop), khung minh hoạ;
   - cột 6–12: `ConnectForm`.
4. **"Thông tin liên hệ"** theo R18:
   - desktop: h2 40px cột 1–4, `FactList columns={2}` cột 6–12;
   - mobile: h2 24px, 3 hàng chữ.

**`ConnectForm`** (client), theo R16:
- state `{ name, contact, story, type: 'photo', consent, tried, sent }`;
- `errors` tính từ state khi `tried`;
- bấm Gửi: hợp lệ thì `sent`, không thì `tried` và focus `ErrorSummary`;
- thành công: tiêu đề "Cảm ơn {name.trim()}.", nội dung điền `contact.trim()`. Hai câu thay thế `fallbackName`/`fallbackContact` giữ trong copy theo artboard, dù với luật bắt buộc hiện tại chúng không bao giờ hiện.

- [ ] **Step 1: Test unit `ConnectForm`.**
  - Bấm "Gửi đóng góp" khi trống:
    - "Còn 3 mục cần bổ sung." trong `role="alert"`, và alert được focus;
    - 2 ô nhập có `aria-invalid="true"`;
    - có lỗi "Cần xác nhận quyền chia sẻ trước khi gửi.".
  - Gõ tên thì còn "Còn 2 mục cần bổ sung.".
  - Điền đủ và tick đồng ý:
    - `role="status"` có "Cảm ơn Lan.";
    - `vi.spyOn(globalThis, 'fetch')` không được gọi;
    - `localStorage.setItem` không được gọi.
  - Tên "   " cùng các ô hợp lệ khác vẫn lỗi tên: "Còn 1 mục cần bổ sung.".
  - "Góp thêm một ký ức" xoá form và focus ô "Họ và tên".
  - `form` có `method="dialog"` và `noValidate`.
- [ ] **Step 2: Test unit `ConnectView`.**
  - **Public fixture** (email/phone null):
    - không có "[Email liên hệ]";
    - có địa chỉ;
    - có "Chưa có thông tin tham quan chính thức".
  - **Preview fixture:** có "[Email liên hệ]".
  - h1 có `<em>` "Chuyện nghề vẫn được kể tiếp.".
  - Có câu "Bản minh hoạ thiết kế."
- [ ] **Step 3: Chạy test, thấy FAIL.** Sau đó cài đặt.
- [ ] **Step 4: E2E.**
  - Gửi trống thì thấy 3 lỗi. Điền đủ thì thấy màn hình thành công có "minh hoạ".
  - Không có request nào ngoài tài nguyên trang (`page.on('request')`, lọc `fetch`/`xhr`/`document` sau khi tải xong). URL không đổi.
  - **Không JS:** điền tên rồi bấm Gửi thì URL không đổi và không có query `name=`.
  - Bàn phím: Tab đi hết form theo thứ tự nhìn thấy. Phím Space tick ô đồng ý.
  - axe sạch ở 1440 và 390, cả trạng thái lỗi và thành công.
- [ ] **Step 5: Kiểm tra.** Lint, unit, e2e và build PASS. Chụp so với `ConnectPage.jpg` và `ConnectMobile.jpg` (mặc định, lỗi, thành công).
- [ ] **Step 6: Commit**

  ```
  git commit -m "feat(connect): trang Kết nối với form minh hoạ"
  ```

### Task 11: Rà soát cuối phase

**Files:** `tests/e2e/public-pages.e2e.spec.ts`, `docs/superpowers/backlog.md`, các file cần sửa nhỏ

- [ ] **Step 1: Cập nhật `public-pages.e2e.spec.ts`.**
  - Thêm 4 route mới vào vòng kiểm "public không có ảnh chưa được phép".
  - Regex ảnh nhận cả URL `next/image` đã mã hoá (`%2Fimages%2Freference`) (backlog A Phase 5a).
- [ ] **Step 2: Kiểm link.** Mọi link nội bộ từ header, footer, trang chủ, `/nghe-det-chieu` ("Bộ sưu tập chiếu"), `/lang-hoi`, `/cau-chuyen`, `/con-nguoi` tới `/san-pham`, `/san-pham/*`, `/thu-vien`, `/thu-vien?anh=*`, `/ket-noi` không còn 404 (preview). Viết thành một test e2e duyệt link.
- [ ] **Step 3: Chạy đủ bộ kiểm.**

  ```
  lint, test:unit, test:int, build, test:e2e
  migrate trên DB trống
  ```

  Chụp 1440 và 390 cho 4 route, cả public lẫn preview, cả lightbox mở và form lỗi/thành công. Lưu vào scratchpad `phase5b-shots/`.
- [ ] **Step 4: Cập nhật backlog.**
  - Đánh dấu xong:
    - A "link 404" (cả ba route và chú thích nguồn hoa văn);
    - B "Trang hiện vật đánh số nguồn…";
    - C Phase 4 `productTag`;
    - C Phase 5a "Preview chân dung" (F3) và "Heading viết riêng…" phần lời mời 44px;
    - regex e2e mã hoá URL.
  - Thêm các mục còn mở của 5b. Thêm mục A: `/thu-vien` là route động (R11).
- [ ] **Step 5: Commit**

  ```
  git commit -m "test(e2e): rà soát public cho Sản phẩm/Thư viện/Kết nối; backlog sau Phase 5b"
  ```
