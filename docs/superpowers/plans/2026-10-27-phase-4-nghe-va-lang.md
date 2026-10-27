# Chiếu Hới — Phase 4: Nghề dệt chiếu + Làng Hới — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng `/nghe-det-chieu` (CraftJourney 7 công đoạn, xem cận cảnh, tab Thủ công/Bằng máy/So sánh) và `/lang-hoi` (Timeline 3 mức tin cậy, chú thích nguồn), desktop 1440 và mobile 390. Trước đó, sửa các vi phạm kiến trúc và gom component dùng chung đã ghi ở mục B2 của backlog.

**Architecture:**
- Mỗi trang có **một view model** do `lib/content` dựng: `getCraftPage(mode)` và `getVillagePage(mode)`.
  - View model gồm: intro, ảnh theo "slot", dữ liệu CMS, và chữ cố định của artboard.
  - Chữ cố định đã được lọc theo `mode`, nên chuỗi `[cần xác minh]` và ghi chú chỉ dành cho preview sẽ thành `null` ở public.
- `page.tsx` chỉ gọi `getMode()` và hàm `get*Page()`, rồi truyền view model xuống.
- Component trong `components/craft` và `components/village` chỉ ghép các component chung của `ui` và `content`.
- Ba phần tương tác là client component trong `content`: `CraftJourney`, `Timeline` và `ComparisonTabs`. Đặt ở `content` để Trang chủ và các trang sau dùng lại được.

**Tech Stack:** Node 22.23.4, Next 16.4, React 19, Payload 3.92 (Postgres), Tailwind 4.3, Vitest + @testing-library/react, Playwright + @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-10-26-chieu-hoi-web-design.md`. Đọc kèm:
- `CLAUDE.md`, nhất là mục "Kiến trúc" và "Component dùng chung";
- `docs/HANDOFF.md`, mục Đặc tả tương tác 1–2 và 5, cùng checklist khả năng truy cập;
- `docs/superpowers/backlog.md`, mục B2;
- artboard `design/source/CraftPage.dc.html`, `CraftMobile.dc.html`, `VillagePage.dc.html`, `VillageMobile.dc.html`;
- ảnh chụp `design/screens/` tương ứng.

## Global Constraints

- Mọi quy tắc trong `CLAUDE.md` áp dụng.
  - Phụ thuộc chỉ đi một chiều: `app` → `components` → `lib/content` → Payload.
  - Component chỉ `import type` từ `@/lib/content`.
  - Mẫu giao diện lặp lại phải nằm ở `ui` hoặc `content`.
  - Vi phạm là lỗi phải sửa, không được để dành thành lỗi nhỏ.
- **Copy nguyên văn từ artboard.**
  - Desktop lấy từ `*Page.dc.html`, mobile lấy từ `*Mobile.dc.html`.
  - Chuỗi khác nhau giữa hai bản thì lưu thành cặp `{ desktop, mobile }` trong file copy, rồi render cả hai và ẩn/hiện bằng `hidden md:block` / `md:hidden`.
- **Dữ liệu CMS thắng dữ liệu vẽ trên artboard** (giữ ruling Phase 3).
  - Tên, mô tả, dụng cụ, ảnh của công đoạn và nội dung, mức tin cậy, nguồn của mốc thời gian đều lấy từ CMS.
  - Mã TL lấy từ `image.code` của asset, không lấy số vẽ trên artboard.
- **Ở public:**
  - chuỗi chứa dấu chưa xác minh (`UNVERIFIED_MARK` hiện hành) không render;
  - ghi chú quy trình (khung nét đứt "sẽ được xác minh…", "CẦN GHI LẠI", khung bản đồ chờ dữ liệu) chỉ render ở preview;
  - section không còn dữ liệu thì không render, kể cả tiêu đề.
- **Không có JavaScript:** server render sẵn trạng thái đầu.
  - Công đoạn 01 được chọn.
  - Tab "Dệt thủ công" được chọn.
  - Mốc đầu tiên được chọn trên desktop và mở sẵn trên mobile.
- **Tương tác:**
  - Nút Trước/Tiếp và Mốc trước/Mốc sau không vòng lại. Ở đầu và cuối dùng `aria-disabled="true"` và không làm gì khi bấm, **không dùng `disabled`**, để focus không rơi khỏi nút.
  - Phóng ảnh 1.9 lần quanh `focus`, 250ms `cubic-bezier(.2,.7,.2,1)`; đổi công đoạn thì tự thu nhỏ.
  - Khi giảm chuyển động: bỏ transition và dùng `scrollIntoView({ behavior: 'auto' })`.
- **Token và chữ:**
  - Màu chữ chỉ lấy từ token; chữ tối thiểu 12px; `font-display` chỉ dùng từ 20px trở lên.
  - Vùng chạm ≥ 44px; focus 2px (xanh làng trên nền sáng, vàng trên nền tối).
  - Bo góc 0, trừ điểm mốc tròn của timeline.
- **Ảnh:** `next/image` qua `ContentImage`, ảnh đầu trang dùng `priority`, luôn có kích thước. Ảnh nào cũng là ArchiveAsset, gắn vào slot trong global `page-intros`.
- **Schema đổi** thì chạy `npm run migrate:create phase4_pages` và commit `src/migrations`.
- **Mỗi task kết thúc bằng:**
  - `npm run lint` (0 lỗi, gồm cả rule kiến trúc của Task 1);
  - `npm run test:unit`, và `npm run test:int` nếu task có test int;
  - một commit có dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Lệnh chạy qua `fnm exec --using=22.23.4 -- npm run …`. Shell là fish nên lệnh ghép phải bọc trong `bash -c`.
- Làm trên nhánh `phase-4-nghe-va-lang`, tách từ `main`.

## Review Focus

1. **Bấm Tiếp liên tục tới công đoạn 07, hoặc Mốc sau tới mốc cuối.** Focus vẫn ở nút (`aria-disabled`), bấm thêm không đổi gì, không lỗi. → Task 2 (PagerButton), Task 5, Task 7.
2. **Public, khi một nguồn bị ẩn** (tiêu đề nguồn chưa xác minh) hoặc mốc trỏ tới nguồn không còn. Số chú thích vẫn liên tục 1..n theo danh sách nguồn đang hiện; chỗ trích dẫn nguồn bị ẩn biến mất, không để lại `[]`; dòng "NGUỒN ·" của mốc không có nguồn nào thì ẩn. → Task 4 (int), Task 8.
3. **Công đoạn không có ảnh hoặc ảnh chưa được phép.** Hiện khung "ẢNH CẦN CHỤP"; nút "Xem cận cảnh" `aria-disabled`; không có thẻ `img` của asset đó trong HTML public. → Task 4, Task 5.
4. **CMS có số mốc khác 8, hoặc mốc có `confidence` null.** Trục ngang chia đều theo số mốc thật cộng mốc "+"; `confidence` null được hiện như `pending` (không bao giờ hiện như "Có nguồn báo chí"). → Task 4, Task 7.
5. **Mobile 390 và tablet 768.** Dải nút công đoạn và dải dụng cụ vuốt ngang không làm trang cuộn ngang; trục timeline 8 nút ở 768 không tràn (dưới `lg` dùng dạng mở/đóng). → Task 7, Task 9.

## Ruling của Claude trong plan (báo người dùng khi hết phase)

- **R1:** Tiêu đề trang (`page-intros.<route>.title`) chuyển sang `textarea`; mỗi dòng là một dòng của h1, như artboard ("Một tấm chiếu,⏎muôn công đoạn.").
  - Cái giá: thêm một migration.
- **R2:** Ảnh của trang lưu trong mảng `media` của từng nhóm route, mỗi phần tử có `slot` (danh sách slot cố định theo route), `image` và `caption`.
  - Dùng chung cho Phase 5.
  - `home` giữ các trường Phase 3; việc gộp vào `media` ghi vào backlog.
- **R3:** CraftSteps thêm `shortTitle` (nhãn nút mobile: "Xử lý", "Phơi, nhuộm"…) và `toRecord` (mục "CẦN GHI LẠI").
  - `toRecord` chỉ hiện ở preview vì đó là việc biên tập cần làm, không phải nội dung.
  - Cái giá: public không có khối "CẦN GHI LẠI" như artboard.
- **R4:** Các ghi chú quy trình dưới đây chỉ hiện ở preview, giữ đúng ruling Phase 3:
  - Craft: VerifyNote đầu trang; ghi chú phải "Tên gọi địa phương của từng dụng cụ…"; "Chỉ điền ô khi có thông tin…".
  - Village:
    - "Mô tả này theo bài báo năm 2021…";
    - khung "BẢN ĐỒ VỊ TRÍ / Chờ dữ liệu địa lý chính xác";
    - VerifyNote "Số hộ, số khung dệt…";
    - phần "· cần đối chiếu văn bản hành chính" trong dòng "Trước đây".
  - Khi khung bản đồ bị ẩn, ở public chữ của mục "Vị trí" kéo rộng ra.
- **R5:** Hiện ở cả public, vì đó là nội dung thật hoặc hướng dẫn:
  - khung "CÁC NGUỒN CHƯA THỐNG NHẤT";
  - "Không có chân dung lịch sử…";
  - câu hướng dẫn bàn phím dưới hành trình;
  - câu "Hình dạng điểm mốc…".
- **R6:** Mốc "+ Mốc của bạn" là phần tử tĩnh trong file copy, không lấy từ CMS (Phase 1 R18).
  - Mức "pending", hiện ở cả hai chế độ.
  - Dòng nguồn của nó là chữ "Mời đóng góp qua trang Kết nối", link `/ket-noi`. Link này 404 tới Phase 5.
- **R7:** Bảng So sánh: ô nào bị ẩn ở public thì để trống; hàng nào cả hai ô đều trống thì bỏ cả hàng. Không còn hàng nào thì tab "So sánh" không render.
- **R8:** Dòng "NGUỒN ·" của mốc ghép `publisher (dd/mm/yyyy)` của các nguồn, nối bằng "; ", ví dụ "Dân Việt (13/06/2024); Đại Đoàn Kết (07/08/2021)".
  - Nguồn từ CMS, theo artboard.
  - Hai tên "Dân Việt (dẫn Báo Hải Dương)" thì giữ nguyên tên publisher trong CMS.
- **R9:** Đánh số nguồn trên `/lang-hoi`: lấy các nguồn mà trang trích, theo thứ tự `vietnamplus-2026`, `danviet-2024`, `daidoanket-2021` (như artboard [1][2][3]). Thứ tự này khai báo trong file copy của trang, cùng các trích dẫn dạng `cite: ['vietnamplus-2026', …]`.
- **R10:** Không có JS: theo Global Constraints. Timeline mobile mở sẵn mốc đầu, các mốc khác chỉ đọc được khi có JS.
  - Cái giá: chấp nhận một phần HANDOFF như Phase 3.

---

## Cấu trúc file

```
eslint.config.mjs                              rule kiến trúc (Task 1)
src/app/(frontend)/layout.tsx                  lấy settings + mode, truyền xuống header/footer (Task 1)
src/components/layout/SiteHeader.tsx           nhận props, bỏ gọi get* (Task 1)
src/components/layout/SiteFooter.tsx           như trên (Task 1)
src/lib/content/{types,queries,visibility,categories,index}.ts   docNumber/hasPattern/nhãn vào view model; getSources(mode) (Task 1)
src/components/home/{hasPattern,tlCode}.ts     xoá (Task 1)

src/app/(frontend)/globals.css                 token viền/eyebrow (Task 2)
src/components/ui/Eyebrow.tsx                  (Task 2)
src/components/ui/ScrollStrip.tsx              (Task 2)
src/components/ui/StepProgress.tsx             (Task 2)
src/components/ui/PagerButton.tsx              (Task 2)
src/components/ui/ThreadsDivider.tsx           (Task 2)
src/components/ui/PlaceholderFrame.tsx         (Task 2) — ShotNeeded dựng trên nó
src/components/ui/Callout.tsx                  (Task 2)
src/components/ui/FactList.tsx                 (Task 2)

src/globals/PageIntros.ts, src/globals/pageMedia.ts   title textarea + media slots (Task 3)
src/collections/CraftSteps.ts                  shortTitle, toRecord (Task 3)
src/migrations/<ts>_phase4_pages.ts            (Task 3)
src/seed/data/{site,craft}.ts, src/seed/index.ts   seed slot ảnh, tiêu đề nhiều dòng, shortTitle/toRecord (Task 3)

src/lib/content/copy/{applyMode,craft,village}.ts   chữ cố định + lọc theo mode (Task 4)
src/lib/content/pages.ts                       getPageMedia, getCraftPage, getVillagePage (Task 4)

src/components/content/PageHeader.tsx          breadcrumb + eyebrow + h1 nhiều dòng + lead + aside (Task 5)
src/components/content/CraftStage.tsx          ảnh/khung chờ + phóng + nhãn tư liệu (Task 5)
src/components/content/CraftJourney.tsx        client (Task 5)
src/components/content/FigureCard.tsx          (Task 6) dụng cụ
src/components/content/ReadNext.tsx            (Task 6)
src/components/content/ComparisonTabs.tsx      client, dùng ui/Tabs (Task 6)
src/components/craft/CraftView.tsx             ghép section (Task 6)
src/app/(frontend)/nghe-det-chieu/page.tsx     (Task 6)

src/components/content/Confidence.tsx          ConfidenceMark, ConfidenceBadge, ConfidenceLegend (Task 7)
src/components/content/Timeline.tsx            client (Task 7)
src/components/content/Sources.tsx             thêm Cite (Task 8)
src/components/village/VillageView.tsx         (Task 8)
src/app/(frontend)/lang-hoi/page.tsx           thay trang giữ chỗ (Task 8)

tests/unit/**, tests/int/pages.int.spec.ts, tests/e2e/{craft,village}.e2e.spec.ts
```

**Section nào dùng component chung nào** (bắt buộc theo `CLAUDE.md`):

| Section | Component chung |
| --- | --- |
| Đầu trang Craft / Village | `content/PageHeader`, `layout/Breadcrumb`, `ui/Eyebrow`, `content/VerifyNote`, `content/ContentImage`, `content/DocumentLabel`, `ui/FactList`, `content/Cite` |
| Hành trình | `content/CraftJourney` ← `ui/StepProgress`, `ui/ScrollStrip`, `ui/PagerButton`, `content/CraftStage` ← `content/ShotNeeded` ← `ui/PlaceholderFrame` |
| Dụng cụ | `ui/SectionHeading`, `content/FigureCard`, `ui/ScrollStrip` |
| Hai cách dệt | `ui/SectionHeading`, `content/ComparisonTabs` ← `ui/Tabs` |
| Đọc tiếp | `content/ReadNext`, `ui/Eyebrow` |
| Tổ nghề | `ui/SectionHeading`, `ui/Callout`, `content/Cite` |
| Dòng thời gian | `content/Timeline` ← `content/Confidence*`, `ui/PagerButton` |
| Vị trí, Đời sống làng, Di sản hôm nay | `ui/SectionHeading`, `ui/PlaceholderFrame`, `content/ContentImage`, `ui/LinkArrow`, `content/VerifyNote`, `ui/ThreadsDivider` |
| Nguồn | `content/SourceList` |

---

### Task 1: Sửa kiến trúc (backlog B2 mục 1–3) và chốt bằng lint

**Files:**
- Modify: `eslint.config.mjs`, `src/app/(frontend)/layout.tsx`, `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `src/lib/content/{types,queries,visibility,categories,index}.ts`, `src/components/home/{CraftTeaser,Hero,VillageIntro,PatternTeaser,ProductsTeaser,ArchiveTeaser,HomeView}.tsx`, `src/app/(frontend)/page.tsx`
- Delete: `src/components/home/hasPattern.ts`, `src/components/home/tlCode.ts`
- Test: `tests/unit/architecture.test.ts`, các test hiện có trong `tests/unit/home/*`, `tests/int/content.int.spec.ts`

**Interfaces:**
- Produces:
  - `ImageView.docNumber: string | null`: phần số của mã `TL-<số>`, ngược lại `null`.
  - `ProductView.hasPattern: boolean`: `primaryImage !== null && annotations.length > 0`.
  - `ProductCardView.groupLabel: string | null`.
  - `ArchiveItemView.categoryLabel: string | null` và `eraLabel: string | null`.
  - `getSources(mode: Mode): Promise<SourceView[]>`.
  - `SiteHeader({ tagline }: { tagline: string | null })`.
  - `SiteFooter({ variant, settings }: { variant: 'full' | 'compact'; settings: SiteSettingsView })`.

- [ ] **Step 1: Test lint kiến trúc (fail)**

  `tests/unit/architecture.test.ts` dùng `ESLint` API (`new ESLint({ cwd })`), chạy `lintText` trên chuỗi mẫu với `filePath` giả:
  - `src/components/x/Bad.tsx` chứa `import { getMode } from '@/lib/content'` → có lỗi rule `@typescript-eslint/no-restricted-imports`.
  - `src/components/x/Ok.tsx` chứa `import type { Mode } from '@/lib/content'` → không lỗi.
  - `src/components/x/Bad2.tsx` chứa `import config from '@payload-config'` → lỗi.
  - `src/lib/content/Bad.ts` chứa `import { Button } from '@/components/ui/Button'` → lỗi.

- [ ] **Step 2: Thêm rule vào `eslint.config.mjs`**
  - `files: ['src/components/**']`: `@typescript-eslint/no-restricted-imports` cấm `payload`, `@payload-config`, `@/collections/*`, `@/globals/*`, `@/access/*`, `@/seed/*`. Với `@/lib/content` và `@/lib/content/*` thì dùng `allowTypeImports: true`.
  - `files: ['src/lib/**', 'src/collections/**', 'src/globals/**', 'src/access/**']`: cấm `@/components/*` và `@/app/*`.
  - Thông báo lỗi bằng tiếng Việt, trỏ tới `CLAUDE.md#Kiến trúc`.
  - Chạy `npm run lint`: phải báo lỗi đúng ở `SiteHeader`, `SiteFooter`, `HomeView`/`home/*`. Đó là danh sách việc của step sau.

- [ ] **Step 3: Đưa luật vào view model**
  - `toImageView` điền `docNumber` (thay `tlCode.docNumber`).
  - `getProduct` điền `hasPattern`; `productCard` điền `groupLabel`; `getArchive` điền `categoryLabel` và `eraLabel`. Các nhãn lấy qua `categories.ts`, từ option của collection (`Products.group`, `ArchiveAssets.category`, `ArchiveAssets.era`), theo mẫu `storyCategoryLabel`; giá trị lạ trả `null`.
  - `getSources(mode)` truyền `mode` vào `allSources`.
  - Cập nhật test int hiện có: `docNumber('TL-002')` → `'002'`, `'XX-1'` → `null`; `groupLabel` của `traditional` là `'Chiếu cói truyền thống'`; `eraLabel('now')` là `'Nay'`.

- [ ] **Step 4: Sửa component theo view model**
  - Các file trong `home/*` dùng `image.docNumber`, `product.hasPattern`, `item.categoryLabel`.
  - Xoá `LABELS` trong `ArchiveTeaser`. Chip lọc vẫn là chữ artboard; khoá chip có kiểu là union `category` lấy bằng `import type`.
  - Xoá `hasPattern.ts` và `tlCode.ts`; chuyển test của chúng sang test `lib/content` (unit cho `visibility`, int cho `getProduct`).

- [ ] **Step 5: Header/footer nhận props**
  - `layout.tsx` gọi `getMode()` và `getSiteSettings(mode)` một lần, rồi truyền `tagline` cho `SiteHeader` và `settings` cho hai bản `SiteFooter`.
  - `SiteHeader` và `SiteFooter` thôi là `async`.

- [ ] **Step 6: Kiểm tra**
  - `npm run lint` 0 lỗi; `test:unit` và `test:int` qua.
  - `npm run test:e2e -- home layout` qua: hành vi trang chủ không đổi.

- [ ] **Step 7: Commit** `refactor: đưa luật nghiệp vụ vào lib/content, header/footer nhận props, lint chặn sai lớp`

---

### Task 2: Component dùng chung (backlog B2 mục 4–7) và token

**Files:**
- Modify: `src/app/(frontend)/globals.css`, `src/components/content/ShotNeeded.tsx`, `src/components/home/*`, `src/components/content/*` (chỗ dùng rgba), `src/components/styleguide/Lab.tsx`
- Create: các file `ui/*` ở Cấu trúc file (Eyebrow, ScrollStrip, StepProgress, PagerButton, ThreadsDivider, PlaceholderFrame, Callout, FactList)
- Test: `tests/unit/ui/common.test.tsx`

**Interfaces:**
- Produces:
  - `Eyebrow({ children, tone?: 'light' | 'dark', rule?: boolean, as?: 'p' | 'span', id?: string, className?: string })`.
    - Class `text-eyebrow font-semibold tracking-eyebrow` (`.22em` mobile, `.24em` từ `md`).
    - `light` → `text-accent`, `dark` → `text-accent-on-dark`.
    - `rule` thêm vạch ngang 48×1px trước chữ, như đầu trang Craft/Village.
  - `ScrollStrip({ children, label?: string, as?: 'div' | 'ol', className?: string })`.
    - Lề âm `-mx-5 px-5`, `overflow-x-auto`, ẩn thanh cuộn, `snap-x`.
    - Có `label` thì thêm `role="group" aria-label`.
    - `md:` trở lên không cuộn: nơi gọi tự đặt bố cục `md:` qua `className`.
  - `StepProgress({ index, total, label, unit, tone?: 'dark' | 'light', className? })`.
    - Hiển thị "`{unit}` **0n** / 0m" và `role="progressbar"` với `aria-label={label}`, `aria-valuemin=1`, `aria-valuemax={total}`, `aria-valuenow={index+1}`.
  - `PagerButton({ direction: 'prev' | 'next', label: string, onClick, atEnd: boolean, variant?: 'outline' | 'solid', iconOnly?: boolean, tone?: 'dark' })`.
    - Cao tối thiểu 48px.
    - `atEnd` → `aria-disabled="true"`, `opacity-40`, `onClick` không chạy.
    - `iconOnly` → chữ đưa vào `aria-label`.
  - `ThreadsDivider({ className? })`: `.threads`, `aria-hidden`.
  - `PlaceholderFrame({ label, title?, description?, tone?: 'light' | 'dark', className?, role? })`: khung nét đứt, các khối chữ căn giữa.
    - Nét đứt: `border-border-dashed` trên nền sáng, `border-on-dark-dashed` trên nền tối.
    - `label`: eyebrow 12px `.2em`.
    - `title`: `font-display`, `text-[28px]` desktop / `text-[21px]` mobile.
    - `description`: 14px.
  - `ShotNeeded`: giữ nguyên props và test cũ, dựng lại trên `PlaceholderFrame` với `label="ẢNH CẦN CHỤP"`.
  - `Callout({ title, children, className? })`: nền `bg-bg-secondary`, viền trái 3px `border-accent`, tiêu đề eyebrow `text-text-muted-alt`.
  - `FactList({ items: { term: string; detail: ReactNode }[], className? })`.
    - Render `<dl>`; mỗi mục là `div` gồm `dt` (eyebrow 12px `.2em` `text-text-muted`) và `dd`.
    - Viền trên mục đầu `border-border-strong`, các mục sau `border-border-soft`; viền dưới mục cuối.
- Token mới trong `@theme`:
  - `--color-border-soft: rgba(40,39,36,.2)`;
  - `--color-border-on-dark: rgba(243,235,221,.22)`;
  - `--color-border-on-dark-strong: rgba(243,235,221,.4)`;
  - `--color-border-on-dark-dashed: rgba(243,235,221,.45)`;
  - `--color-track-on-dark: rgba(243,235,221,.2)`;
  - `--tracking-eyebrow: .24em`.

- [ ] **Step 1: Test (fail)** cho từng component, mỗi component một `describe`:
  - `PagerButton` với `atEnd`: `aria-disabled="true"`, bấm không gọi `onClick`, `document.activeElement` vẫn là nút sau khi bấm.
  - `StepProgress index=4 total=7`: có `aria-valuenow="5"` và chữ "05" / "07".
  - `ScrollStrip label="Chọn công đoạn"`: có `role="group"`.
  - `FactList`: có `dl > div > dt + dd`.
  - `Eyebrow rule`: có phần tử vạch `aria-hidden`.
  - `PlaceholderFrame`: hiện `label` và `title`.

- [ ] **Step 2: Cài đặt component và token.** Không viết cứng `rgba(...)` mới trong `src/components`. Thay các chỗ có sẵn:
  - `rgba(40,39,36,.2)` → `border-border-soft`;
  - `rgba(243,235,221,.22|.4|.45|.2)` → các token on-dark.

- [ ] **Step 3: Thay chỗ dùng cũ**
  - Thay eyebrow viết tay ở 6 file `home/*` bằng `Eyebrow`.
  - `SectionHeading` dùng `Eyebrow`.
  - `CraftTeaser` dùng `StepProgress`, `ScrollStrip`, `PagerButton iconOnly`; xoá hàm `Progress` cục bộ và biến `arrow`.
  - `PeopleTeaser` dùng `ScrollStrip`.
  - Các chỗ dùng `.threads` dùng `ThreadsDivider`.

- [ ] **Step 4: Đưa vào `/styleguide`.** Mục "Thành phần chung" hiện mỗi component mới ở cả nền sáng và tối nếu có `tone`.

- [ ] **Step 5: Kiểm tra**
  - `rg "tracking-\[\.2[24]em\] text-accent" src/components/home` → rỗng.
  - `rg "rgba\(" src/components` chỉ còn các giá trị chưa có token. Liệt kê chúng trong report.
  - `lint`, `test:unit` qua; `test:e2e -- home styleguide` qua.

- [ ] **Step 6: Commit** `refactor(ui): gom eyebrow, dải cuộn, tiến trình, nút trước/sau, khung giữ chỗ thành component chung`

---

### Task 3: Schema và seed cho hai trang

**Files:**
- Modify: `src/globals/PageIntros.ts`, `src/collections/CraftSteps.ts`, `src/seed/data/site.ts`, `src/seed/index.ts`
- Create: `src/globals/pageMedia.ts`, `src/seed/data/craft.ts`, `src/migrations/<ts>_phase4_pages.ts`
- Test: `tests/int/seed.int.spec.ts`, `tests/int/page-intros.int.spec.ts`

**Interfaces:**
- Produces:
  - `PAGE_MEDIA_SLOTS` trong `src/globals/pageMedia.ts`:
    ```ts
    export const PAGE_MEDIA_SLOTS = {
      'nghe-det-chieu': ['hero', 'tool-1', 'tool-2', 'tool-3', 'hand', 'machine', 'next-people', 'next-stories', 'next-products'],
      'lang-hoi': ['hero', 'life-1', 'life-2', 'life-3'],
    } as const
    export type PageMediaRoute = keyof typeof PAGE_MEDIA_SLOTS
    export type PageMediaSlot<R extends PageMediaRoute> = (typeof PAGE_MEDIA_SLOTS)[R][number]
    ```
  - Nhóm `nghe-det-chieu` và `lang-hoi` của `page-intros` có thêm `media: { slot, image (upload archive-assets, không bắt buộc), caption (text, localized) }[]`.
    - `slot` là select theo danh sách trên, validate không trùng trong mảng.
  - `title` của mọi nhóm đổi sang `textarea` (R1).
  - CraftSteps thêm `shortTitle` (text, localized) và `toRecord` (text, localized).

- [ ] **Step 1: Test int (fail)**
  - Lưu `media` có hai phần tử cùng `slot: 'hero'` → lỗi validate.
  - Xoá asset đang gắn vào slot → lưu lại global vẫn được (ảnh không bắt buộc, như Task 2 của Phase 3).
  - Sau seed:
    - `nghe-det-chieu.media` có đủ 9 slot;
    - `lang-hoi.media` có 4 slot;
    - `nghe-det-chieu.title === 'Một tấm chiếu,\nmuôn công đoạn.'`;
    - craft step 2 có `shortTitle === 'Xử lý'`.

- [ ] **Step 2: Cài schema** và chạy `npm run migrate:create phase4_pages`.

- [ ] **Step 3: Seed.** File ảnh, chú thích và nhãn đều lấy nguyên văn từ artboard.

  | route.slot | file | caption |
  | --- | --- | --- |
  | nghe-det-chieu.hero | nkc14.webp | `Đôi tay trên khung dệt. Ảnh: [tác giả — cần xác minh]` |
  | nghe-det-chieu.tool-1/2/3 | nkc13 / kn1 / kn4 | (không) |
  | nghe-det-chieu.hand / machine | nkc5 / nkc2 | (không) |
  | nghe-det-chieu.next-people/stories/products | nkc10 / nkc2 / kn8 | (không) |
  | lang-hoi.hero | hc9.webp | `Chiếu phơi bên ao làng · Địa điểm, tác giả: [cần xác minh]` |
  | lang-hoi.life-1/2/3 | hc8 / hc2 / kn2 | `Chiếu phơi trên bãi đất trống. [Địa điểm, thời gian — cần xác minh]` / `Bày chiếu. [cần xác minh]` / `Xem chiếu. [cần xác minh]` |

  - Tiêu đề nhiều dòng:
    - `lang-hoi.title = 'Có một làng Hới...'`;
    - `nghe-det-chieu.title = 'Một tấm chiếu,\nmuôn công đoạn.'`;
    - các route khác giữ nguyên.
  - `src/seed/data/craft.ts`:
    - `shortTitle` theo `CraftMobile.dc.html:153-159` (`short`);
    - `toRecord` theo `CraftPage.dc.html:237-243` (`more`).
    - Ghép theo `n`.

- [ ] **Step 4: Kiểm tra.** `test:int` qua; `npm run seed` (với `SEED_FORCE_GLOBALS=true`) chạy được 2 lần liên tiếp.

- [ ] **Step 5: Commit** `feat(cms): slot ảnh theo trang, tiêu đề nhiều dòng, shortTitle/toRecord cho công đoạn`

---

### Task 4: View model của hai trang trong `lib/content`

**Files:**
- Create: `src/lib/content/copy/applyMode.ts`, `copy/craft.ts`, `copy/village.ts`, `src/lib/content/pages.ts`
- Modify: `src/lib/content/{types,queries,index}.ts`
- Test: `tests/unit/copy.test.ts`, `tests/int/pages.int.spec.ts`

**Interfaces:**
- Consumes: Task 1 (`ImageView.docNumber`, `getSources(mode)`), Task 3 (`PAGE_MEDIA_SLOTS`).
- Produces (types trong `types.ts`):
  ```ts
  export type MediaView = { image: ImageView; caption: string | null }
  export type Variant = { desktop: string | null; mobile: string | null }
  export type Confidence = 'press' | 'oral' | 'pending'
  // CraftStepView thêm: shortTitle: string | null; toRecord: string | null (luôn null ở public)
  // TimelineEventView: confidence đổi thành Confidence (null → 'pending'); thêm sourceLine: string | null (R8)
  export interface CraftPageView {
    intro: PageIntroView                       // title giữ '\n'
    hero: MediaView | null
    steps: CraftStepView[]
    tools: { n: number; name: string; note: Variant; image: ImageView | null }[]
    compare: {
      hand: { title: string; image: ImageView | null; text: Variant; note: Variant }
      machine: { title: string; image: ImageView | null; text: Variant; note: Variant }
      rows: { aspect: string; hand: string | null; machine: string | null }[]   // R7 đã lọc
    }
    readNext: { href: string; eyebrow: string; title: string; cta: string; image: ImageView | null }[]
    copy: CraftCopyView                         // mọi chữ cố định khác, đã applyMode
  }
  export interface VillagePageView {
    intro: PageIntroView
    hero: MediaView | null
    facts: { term: string; detail: string; note: string | null; cite: string[] }[]
    timeline: TimelineEventView[]               // CMS + mốc '+' (R6) ở cuối
    life: MediaView[]
    sources: SourceView[]                       // R9: thứ tự trang, đã lọc public
    copy: VillageCopyView
  }
  export function getPageMedia<R extends PageMediaRoute>(route: R, mode: Mode): Promise<Partial<Record<PageMediaSlot<R>, MediaView>>>
  export function getCraftPage(mode: Mode): Promise<CraftPageView>
  export function getVillagePage(mode: Mode): Promise<VillagePageView>
  ```
  - `CraftCopyView` và `VillageCopyView` là kiểu của object copy sau khi `applyMode`: mỗi chuỗi thành `string | null`, mỗi cặp thành `Variant`.
  - Trường trích dẫn có dạng `{ text: string | null; cite: string[] }`.
- Quy tắc của `applyMode<T>(copy: T, mode: Mode)`:
  - Duyệt sâu object/mảng và áp `showText` cho mọi chuỗi.
  - Nhánh nằm dưới khoá `preview` → `null` ở public.
  - Khoá `cite` (mảng `sourceId`) giữ nguyên.

- [ ] **Step 1: Viết `copy/craft.ts`, `copy/village.ts`.** Chép nguyên văn mọi chữ cố định của bốn artboard, không bỏ sót chuỗi nào ngoài phần header/footer.
  - Ghi chú quy trình đặt dưới khoá `preview` (R4).
  - Chuỗi desktop/mobile khác nhau thì để dạng `{ desktop, mobile }`.
  - Trích dẫn `.src` của Village viết thành `cite: ['vietnamplus-2026', 'daidoanket-2021']` theo số [n] của artboard (R9: [1]=vietnamplus-2026, [2]=danviet-2024, [3]=daidoanket-2021).
  - Tham chiếu dòng:
    - Craft: `CraftPage.dc.html:52-55, 66-67, 117, 123-145, 154-192, 198-215`; `CraftMobile.dc.html:37-40, 44, 80-85, 92-119, 125-128`.
    - Village: `VillagePage.dc.html:50-58, 62, 67-77, 84-91, 118, 123-131, 140-148, 154-161, 166`; `VillageMobile.dc.html:32-34, 38, 41-43, 47-51, 55-60, 79-88`.
    - Mốc "+": `VillagePage.dc.html:199`.
    - Nhãn mức tin cậy: `VillagePage.dc.html:201`.

- [ ] **Step 2: Test unit `copy.test.ts` (fail)**
  - `applyMode(craftCopy, 'public')`: serialize JSON, không chứa `cần xác minh`, `chờ xác minh`, `CẦN GHI LẠI`, `sẽ được xác minh`, `Chờ dữ liệu địa lý`.
  - `applyMode(craftCopy, 'preview')`: giữ nguyên văn (so sánh sâu với `craftCopy`).
  - `applyMode({ preview: { a: 'x' }, b: 'y' }, 'public')` → `{ preview: null, b: 'y' }`.

- [ ] **Step 3: Test int `pages.int.spec.ts` (fail).** Seed chuẩn của `chieuhoi_test`; ảnh `rights` mặc định là `unknown`.
  - `getCraftPage('public')`:
    - `hero === null`;
    - mọi `tools[].image === null`;
    - `steps.length === 0` (seed để craft step ở dạng chờ duyệt);
    - `compare.rows` chỉ còn `['Việc của đôi tay']`.
  - `getCraftPage('preview')`:
    - `steps.length === 7`;
    - `steps[2].image === null` và `steps[2].shotNeeded` có chữ;
    - `steps[0].toRecord === 'Giống cói, nơi trồng, mùa thu hoạch.'`;
    - `compare.rows.length === 4`.
  - Cho một asset `rights: 'permitted'` và gắn vào `nghe-det-chieu.hero`: public có `hero.image.url`, và `hero.caption === null` vì chú thích chứa `[cần xác minh]`.
  - `getVillagePage('preview')`:
    - `timeline.length === 8`; mốc cuối `title === 'Mốc của bạn'`, `confidence === 'pending'`;
    - `timeline[0].sourceLine === 'Dân Việt (dẫn Báo Hải Dương) (13/06/2024); Đại Đoàn Kết (07/08/2021)'`;
    - `sources.map(s => s.id)` là `['vietnamplus-2026','danviet-2024','daidoanket-2021']`.
  - Đổi tiêu đề nguồn `danviet-2024` thành `'[cần xác minh]'` rồi gọi `getVillagePage('public')`:
    - `sources` không còn nguồn đó;
    - không `facts[].cite` hay `copy` cite nào còn `'danviet-2024'`;
    - `sourceLine` của mốc chỉ có nguồn đó thì là `null`.
  - Một mốc có `confidence: null` (sửa trực tiếp trong test) → view model trả `'pending'`.

- [ ] **Step 4: Cài đặt `pages.ts`.**
  - Dùng `findGlobal` qua `readGlobal` hiện có, `depth: 1`.
  - Cite bị lọc ở lớp này (bỏ id không có trong `sources`), component chỉ việc đánh số.
  - Ngày `YYYY-MM-DD` → `dd/mm/yyyy`; chuỗi không đúng dạng thì giữ nguyên.

- [ ] **Step 5: Kiểm tra** `test:unit`, `test:int`, `lint` qua.

- [ ] **Step 6: Commit** `feat(content): view model trang Nghề dệt chiếu và Làng Hới`

---

### Task 5: `PageHeader`, `CraftStage`, `CraftJourney`

**Files:**
- Create: `src/components/content/{PageHeader,CraftStage,CraftJourney}.tsx`
- Test: `tests/unit/content/craft-journey.test.tsx`, `tests/unit/content/page-header.test.tsx`

**Interfaces:**
- Consumes: Task 2 (`StepProgress`, `ScrollStrip`, `PagerButton`, `Eyebrow`, `PlaceholderFrame`/`ShotNeeded`), Task 4 (`CraftStepView`).
- Produces:
  - `PageHeader({ crumb: string, intro: PageIntroView, note?: ReactNode, aside?: ReactNode, leadMobile?: string | null })`.
    - Breadcrumb "Trang chủ / {crumb}".
    - `Eyebrow rule` (vạch chỉ có từ `md`).
    - h1 `font-display` (70px desktop / 38px mobile; riêng Village là 76/40, truyền qua `titleClassName?`). Mỗi dòng của `intro.title` cách nhau bằng `<br/>`.
    - Lead dùng font serif. Có `leadMobile` thì render bản desktop/mobile riêng.
    - `note` nằm dưới lead.
    - Lưới 12 cột: nội dung `col-span-7`, `aside` `col-start-8|9 span-5|4`.
  - `CraftStage({ step, zoomed, className })`.
    - Có ảnh: `ContentImage` `object-cover` phủ khung, `transform-origin: {fx}% {fy}%`, `scale(1.9)` khi `zoomed`, `transition-transform duration-[250ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none`.
    - Không ảnh: `ShotNeeded tone="dark"`.
    - Nhãn: desktop là khối nền sáng góc dưới trái ("TƯ LIỆU · {docNumber}" + `[title, Ảnh: photographer]`); mobile là dòng `TL · {docNumber} · …` dưới khung.
  - `CraftJourney({ steps, toolsLabel = 'DỤNG CỤ', recordLabel = 'CẦN GHI LẠI', hint })` (client), bố cục theo `CraftPage.dc.html:63-118` và `CraftMobile.dc.html:43-77`:
    - Desktop: `ol` 7 nút `aria-current="step"`, số `font-display` 80px, h3, subtitle, mô tả, khối DỤNG CỤ, khối CẦN GHI LẠI (chỉ khi `toRecord`).
    - Mobile: `ScrollStrip` nút `{nn} {shortTitle ?? title}`; nút phóng icon-only 48px góc phải trên; Trước/Tiếp chia đôi.
    - Đổi công đoạn → `zoomed=false`, và nút đang chọn được `scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })`, chỉ trong handler.
    - Nút phóng `aria-pressed`, chữ "Xem cận cảnh"/"Thu nhỏ" (mobile `aria-label` "Xem cận cảnh"/"Thu nhỏ ảnh"); `aria-disabled` khi công đoạn không có ảnh.
    - `steps.length === 0` → `null`.

- [ ] **Step 1: Test (fail)**
  - Render 7 bước (bước 3 không ảnh):
    - nút "01" có `aria-current="step"`;
    - `progressbar` có `aria-valuenow="1"`;
    - bấm "Công đoạn tiếp" 10 lần → `aria-valuenow="7"`, nút có `aria-disabled="true"` và vẫn là `document.activeElement`.
  - Chọn bước 3:
    - có `role="img"` tên "Ảnh cần chụp: …";
    - nút "Xem cận cảnh" có `aria-disabled="true"`.
  - Chọn bước 5, bấm "Xem cận cảnh":
    - `aria-pressed="true"`;
    - `style.transform` của ảnh chứa `scale(1.9)` và `transformOrigin` là `35% 60%`.
    - Bấm "Công đoạn tiếp" → `aria-pressed="false"`.
  - `scrollIntoView` được gọi với `{ inline: 'center' }` khi chọn qua dải mobile (mock `Element.prototype.scrollIntoView`).
  - `toRecord: null` → không có chữ "CẦN GHI LẠI".
  - `PageHeader`:
    - `title: 'A,\nB.'` → h1 chứa đúng một `<br>`;
    - breadcrumb có link "Trang chủ" và `aria-current="page"` ở crumb cuối.

- [ ] **Step 2: Cài đặt.** Màu và kích cỡ theo artboard, quy về token:
  - `#E3CD9C` → `accent-on-dark`;
  - `#D3CCBD` → `text-on-dark-muted`;
  - `#C4BFB1` → `text-on-dark-muted`.

- [ ] **Step 3: Kiểm tra** `test:unit`, `lint`.

- [ ] **Step 4: Commit** `feat(content): PageHeader, CraftStage, CraftJourney`

---

### Task 6: Trang `/nghe-det-chieu`

**Files:**
- Create: `src/components/content/{FigureCard,ReadNext,ComparisonTabs}.tsx`, `src/components/craft/CraftView.tsx`, `src/app/(frontend)/nghe-det-chieu/page.tsx`
- Test: `tests/unit/craft/craft-view.test.tsx`

**Interfaces:**
- Consumes: Task 4 (`CraftPageView`), Task 5.
- Produces:
  - `FigureCard({ label, title, caption: Variant, image: ImageView | null, imageClassName })`.
    - Desktop: ảnh 320px, nhãn "DỤNG CỤ · 0n", tiêu đề 28px, caption.
    - Mobile: thẻ 240px trong `ScrollStrip`, ảnh 200px, tiêu đề 21px.
    - Không ảnh → `ShotNeeded`.
  - `ReadNext({ items, eyebrow })`.
    - Desktop: 3 thẻ ảnh 260px, eyebrow `.16em`, tiêu đề 26px, CTA.
    - Mobile: danh sách hàng 56px, viền `border-border-strong`, mũi tên `aria-hidden`.
    - Mỗi mục là một `<a>`.
  - `ComparisonTabs({ hand, machine, rows, rowsNote, labels })` (client).
    - Dùng `ui/Tabs variant="responsive"`. Nhãn desktop "Dệt thủ công / Dệt bằng máy / So sánh", mobile "Thủ công / Bằng máy / So sánh"; truyền `label` dạng ReactNode có hai `span` ẩn/hiện theo breakpoint. Nếu `Tabs` chưa nhận ReactNode thì thêm prop tuỳ chọn, giữ test cũ.
    - Panel ảnh: lưới 7 + 4 cột trên desktop; mobile ảnh 230px.
    - Panel So sánh:
      - Desktop là `<table>` thật (`th scope="col"` KHÍA CẠNH / THỦ CÔNG / BẰNG MÁY, `th scope="row"` khía cạnh).
      - Mobile mỗi hàng là khối gồm tiêu đề, "Thủ công: …", "Bằng máy: …". Dùng cùng `<table>`, đổi `display` bằng class `max-md:block`. Thêm tiền tố bằng `<span className="md:hidden">Thủ công: </span>`.
    - `rows.length === 0` → bỏ tab "So sánh" (R7).
  - `CraftView({ page }: { page: CraftPageView })`.
    - Thứ tự section: PageHeader (aside = hero figure) → hành trình trên nền `bg-bg-inverse` (eyebrow, h2 "Từ sợi cói đến một đời người.", `CraftJourney`, câu hướng dẫn) → Dụng cụ → `ThreadsDivider` → Hai cách dệt → Đọc tiếp.
    - Mobile: hành trình dùng eyebrow làm nhãn section (`aria-labelledby`), không có h2, theo artboard mobile.

- [ ] **Step 1: Test (fail).** Render `CraftView` với view model public tối thiểu (`steps: []`, `hero: null`, ảnh tools null, `rows` 1 hàng):
  - không có section hành trình (không có chữ "HÀNH TRÌNH MỘT TẤM CHIẾU");
  - không có chuỗi `cần xác minh` trong `container.textContent`;
  - h1 có `<br>`.

  Render với view model preview:
  - có `table` với 4 hàng thân sau khi chọn tab "So sánh";
  - "Đọc tiếp" có 3 link `href` `/con-nguoi`, `/cau-chuyen`, `/san-pham`.

- [ ] **Step 2: Cài đặt `page.tsx`.**
  - `generateMetadata` lấy `title` từ `intro.title` (bỏ `\n`) và đặt `description = intro.lead`.
  - `export const dynamic` giữ mặc định; vấn đề trang tĩnh xử lý ở Phase 6 (backlog A).

- [ ] **Step 3: Kiểm tra.** `test:unit`, `lint`, `build` qua; mở `/nghe-det-chieu` ở dev và so mắt với `CraftPage.jpg` / `CraftMobile.jpg`.

- [ ] **Step 4: Commit** `feat(craft): trang Nghề dệt chiếu`

---

### Task 7: `Confidence*` và `Timeline`

**Files:**
- Create: `src/components/content/{Confidence,Timeline}.tsx`
- Test: `tests/unit/content/timeline.test.tsx`

**Interfaces:**
- Consumes: Task 2 (`PagerButton`), Task 4 (`TimelineEventView` với `Confidence`, `sourceLine`).
- Produces:
  - `ConfidenceMark({ level, active?, size?: 'sm' | 'md' })`, tất cả `aria-hidden`:
    - `press`: tròn đặc `bg-accent-on-dark`;
    - `oral`: vuông xoay 45°, viền 2px `accent-on-dark`;
    - `pending`: tròn viền 2px nét đứt `text-on-dark-muted`.
    - Kích thước: thường 14 / oral 12; `active` 22 / oral 18; viền ngoài 6px `track-on-dark`.
  - `ConfidenceBadge({ level })`:
    - `press`: nền `accent-on-dark`, chữ `text-bg-ink`;
    - `oral`: viền liền;
    - `pending`: viền nét đứt.
    - Nhãn "Có nguồn báo chí" / "Truyền khẩu" / "Chờ xác minh".
  - `ConfidenceLegend({ className? })`: `<ul aria-label="Chú giải độ tin cậy">` gồm 3 mục, mark kèm nhãn.
  - `Timeline({ events, sourceLabel = 'NGUỒN · ', note })` (client).
    - **Từ `lg` (1024px):**
      - `ol` dạng lưới `repeat(n, minmax(0,1fr))` trên trục ngang (đường 1px ở `top-[52px]`).
      - Mỗi mốc là `<button aria-current={on ? 'true' : undefined}>` gồm năm (`font-display` 20/24px), mark, tiêu đề.
      - Dưới trục: năm 88px, badge, h3, nội dung, dòng nguồn (ẩn khi `sourceLine` null), `PagerButton` "Mốc trước"/"Mốc sau".
    - **Dưới `lg`:**
      - Mỗi mốc là `li` chứa `<button aria-expanded aria-controls>` với lưới 28px / 86px / 1fr / 20px (mark, năm, tiêu đề, dấu +/−).
      - Panel gồm badge, nội dung, "Nguồn: …".
      - Mở một mốc thì đóng mốc khác; bấm mốc đang mở thì đóng.
    - Hai bố cục dùng chung state `index` (mobile cho phép `-1` = đóng hết). Render một trong hai bằng `hidden lg:block` / `lg:hidden`.
    - Mốc "+" có `sourceLine` là "Mời đóng góp qua trang Kết nối". Nút này không cần đặc biệt; link `/ket-noi` nằm trong dòng nguồn.

- [ ] **Step 1: Test (fail).** Dùng 8 mốc theo seed:
  - Mốc đầu có `aria-current="true"`.
  - Bấm "Mốc sau" 9 lần → mốc 8 `aria-current`; nút `aria-disabled` và vẫn focus.
  - Mốc `oral` có mark với class xoay (`rotate-45`); mốc `pending` có class `border-dashed`.
  - Mobile: mốc đầu `aria-expanded="true"`; bấm mốc 3 → mốc 3 `true`, mốc đầu `false`; bấm lại mốc 3 → mọi mốc `false`.
  - `sourceLine: null` → không có "NGUỒN ·" trong panel đó.
  - Legend có 3 `li` đúng nhãn.

- [ ] **Step 2: Cài đặt; đưa `Confidence*` vào `/styleguide`.**

- [ ] **Step 3: Kiểm tra** `test:unit`, `lint`.

- [ ] **Step 4: Commit** `feat(content): Timeline và ký hiệu mức tin cậy`

---

### Task 8: Trang `/lang-hoi`

**Files:**
- Modify: `src/components/content/Sources.tsx`, `src/app/(frontend)/lang-hoi/page.tsx`
- Create: `src/components/village/VillageView.tsx`
- Test: `tests/unit/village/village-view.test.tsx`, `tests/unit/content/cite.test.tsx`

**Interfaces:**
- Consumes: Task 4 (`VillagePageView`), Task 5 (`PageHeader`), Task 7 (`Timeline`, `ConfidenceLegend`), Task 2 (`FactList`, `Callout`, `PlaceholderFrame`, `ThreadsDivider`).
- Produces:
  - `Cite({ ids, numbers }: { ids: string[]; numbers: Map<string, number> })`: render các `FootnoteRef` theo thứ tự số tăng dần, bỏ id không có số. `ids` rỗng → `null`.
  - `VillageView({ page }: { page: VillagePageView })`, theo `VillagePage.dc.html:47-172` và `VillageMobile.dc.html:30-97`:
    - `PageHeader`; aside desktop là `FactList` (mobile: `FactList` nằm sau ảnh).
    - Ảnh hero tràn viền 640/260px kèm `DocumentLabel` (desktop đặt góc dưới phải; mobile là dòng chữ dưới ảnh).
    - Tổ nghề: `SectionHeading`, đoạn serif có `Cite`, `Callout` "CÁC NGUỒN CHƯA THỐNG NHẤT", câu "Không có chân dung…".
    - Timeline trên nền `bg-bg-inverse`: `SectionHeading tone="dark"` + `ConfidenceLegend` + `Timeline` + câu chú thích.
    - Vị trí: chữ + `PlaceholderFrame` (chỉ preview, R4).
    - `ThreadsDivider`.
    - Đời sống làng: ảnh 7 cột + 2 ảnh xếp dọc 5 cột, chú thích nghiêng, `LinkArrow` "Xem thêm trong Thư viện" → `/thu-vien`. Section này **chỉ có trên desktop**, vì artboard mobile không có.
    - Di sản hôm nay: nền `bg-bg-secondary`, `LinkArrow` "Xem quy trình dệt chiếu" → `/nghe-det-chieu`.
    - `SourceList sources={page.sources}`.
  - `numbers = sourceNumbers(page.sources)` tính một lần ở `VillageView`.

- [ ] **Step 1: Test (fail)**
  - `Cite ids={['c','a']} numbers={a→1, c→3}` render "1" rồi "3"; `ids={['x']}` → không render gì.
  - `VillageView` preview:
    - có `dl` với 3 `dt` "TÊN GỌI", "ĐỊA GIỚI HIỆN NAY", "TỔ NGHỀ";
    - link chú thích "Nguồn 1" trỏ tới `#nguon-1`;
    - `SourceList` có 3 mục.
  - `VillageView` public với `sources` chỉ còn 2 nguồn (danviet bị lọc) và `copy` đã lọc theo Task 4:
    - không có link "Nguồn 3";
    - không có chuỗi `cần đối chiếu`, `Chờ dữ liệu địa lý`, `cần xác minh`;
    - không có `[]` rỗng.

- [ ] **Step 2: Cài đặt; `page.tsx` thay trang giữ chỗ, có `generateMetadata` như Task 6.**

- [ ] **Step 3: Kiểm tra.** `test:unit`, `lint`, `build` qua; so mắt với `VillagePage.jpg` / `VillageMobile.jpg`.

- [ ] **Step 4: Commit** `feat(village): trang Làng Hới`

---

### Task 9: E2E, ảnh chụp, backlog

**Files:**
- Create: `tests/e2e/craft.e2e.spec.ts`, `tests/e2e/village.e2e.spec.ts`
- Modify: `tests/e2e/home-public.e2e.spec.ts`, đổi thành `public-pages` và thêm 2 route; `docs/superpowers/backlog.md`

- [ ] **Step 1: E2E ở 1440 và 390, chế độ preview của dev server**

  **`/nghe-det-chieu`:**
  - một h1;
  - axe không có lỗi serious/critical, với `reducedMotion: 'reduce'`;
  - Tab tới nút công đoạn 03, Enter → stage có "ẢNH CẦN CHỤP";
  - chọn 05, bấm "Xem cận cảnh" → `aria-pressed=true`;
  - bấm "Công đoạn tiếp" tới cuối → `aria-disabled=true`, focus vẫn ở nút;
  - tab "So sánh" bằng ArrowRight → bảng hiện;
  - 390:
    - `scrollWidth <= innerWidth`;
    - mọi `button, a` trong `main` có kích thước ≥ 44×44 (ngoại lệ giống `home.e2e`: chú thích nguồn và link trong đoạn văn);
    - chọn pill 07 → pill 07 nằm trong khung nhìn ngang của dải.

  **`/lang-hoi`:**
  - một h1; axe như trên;
  - 1440: bấm mốc "Thời Lê" → h3 "Khung dệt về làng", badge "Truyền khẩu";
  - 390: mốc đầu `aria-expanded=true`; bấm "1531" → mở mốc đó, mốc đầu đóng;
  - bấm chú thích "Nguồn 1" → URL có `#nguon-1`, mục nguồn 1 trong khung nhìn;
  - 768: không cuộn ngang; timeline ở dạng mở/đóng.

- [ ] **Step 2: Public build** (cùng cơ chế :3100 của Phase 3). Cả hai route trả 200 và:
  - không có `cần xác minh`, `CẦN GHI LẠI`, `Chờ dữ liệu địa lý`;
  - không có `img` nào trỏ tới asset chưa được phép.

- [ ] **Step 3: Ảnh chụp.** Khi đặt `SHOTS_DIR`, chụp toàn trang 1440 và 390 cho hai route. So với `design/screens` và ghi các điểm lệch vào report.

- [ ] **Step 4: Backlog**
  - Đánh dấu xong các mục B2 đã làm, và mục "getSources không nhận mode".
  - Thêm mục: `home` chuyển sang `media` slot (R2).
  - Chép mọi mục review còn mở của Phase 4 vào `backlog.md`.

- [ ] **Step 5: Kiểm tra toàn bộ.** `lint`, `test:unit`, `test:int`, `build`, `test:e2e` đều qua.

- [ ] **Step 6: Commit** `test(e2e): Nghề dệt chiếu và Làng Hới; cập nhật backlog`
