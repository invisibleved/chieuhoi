# Chiếu Hới — Phase 1: Nền móng — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng app Next.js + Payload + Postgres gồm đủ collection/global, quyền hai vai trò, lớp `lib/content` áp quy tắc công khai/preview (có test), script seed và khung layout (header, menu mobile, footer, breadcrumb).

**Architecture:** Một app Next.js App Router nhúng Payload 3 (route group `(payload)` cho `/admin`, `(frontend)` cho site). Trang công khai chỉ đọc dữ liệu qua `src/lib/content`, dùng Local API với `overrideAccess: true` và tự áp bộ lọc. Access control của Payload là hàng rào thứ hai: khách chưa đăng nhập không đọc được collection nào qua API, chỉ tải được file ảnh đủ điều kiện công khai.

**Tech Stack:** Node 20.19, Next 16.4, React 19, Payload 3.92 (`@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/translations`), Tailwind CSS 4.3, Postgres 17 (Docker), Vitest, Playwright, @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-10-26-chieu-hoi-web-design.md`. Đọc kèm `CLAUDE.md` và `docs/HANDOFF.md`.

## Global Constraints

- Mọi quy tắc trong `CLAUDE.md` (nội dung, giao diện, a11y) áp dụng cho mọi task. Copy tiếng Việt lấy nguyên văn từ artboard `design/source/*.dc.html`, không tự diễn đạt.
- Không bịa dữ kiện. Thiếu dữ liệu thì để trống hoặc dùng đúng chuỗi `[cần xác minh]`.
- `<html lang="vi">`. Font qua `next/font/google`: Noto Serif Display, Noto Serif (400 + 400 italic) và Be Vietnam Pro (400, 500, 600), `subsets: ['vietnamese','latin']`, `display: 'swap'`.
- Tailwind v4: token khai báo trong `@theme` của `src/app/(frontend)/globals.css`, giá trị từ `design/tokens/tokens.css`. Bỏ qua `tailwind.preset.ts`.
- Bo góc 0, không bóng đổ, không gradient trang trí. Chữ ≥ 12px. `--decor-straw` không dùng cho chữ. Vùng chạm ≥ 44×44px trên mobile. Focus: viền 2px, `--focus-light` trên nền sáng, `--focus-dark` trên nền tối.
- Biến môi trường `APP_ENV`: `development` | `staging` | `production`.
- Slug collection: `users`, `sources`, `timeline-events`, `craft-steps`, `products`, `stories`, `people`, `makers`, `archive-assets`. Slug global: `site-settings`, `page-intros`.
- Vai trò: `editor` | `reviewer`. Mọi kiểm tra quyền chạy trên server.
- Mỗi task kết thúc bằng: `npm run lint`, `npm run test:int` (nếu task có test int) và commit. Commit message kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Người có ảnh đã được phép nhưng chưa đồng ý hiện tên.** Bản công khai vẫn phải ẩn tên. Ảnh chỉ hiện khi `consent.photo` bật *và* bản thân ảnh đủ điều kiện công khai. → Task 8, `toPersonView` tests.
2. **Bài đã đăng có ảnh bìa với `rights = unknown`.** Bản công khai trả `cover: null`, và URL file ảnh đó trả 403 cho khách. → Task 5, Task 9.
3. **Biên tập viên gửi `_status: 'published'` thẳng qua REST hoặc Local API, không qua giao diện.** Server phải từ chối. → Task 4.
4. **Dấu `[cần xác minh]` viết khác hoa/thường hoặc khoảng trắng** (`[Cần xác minh]`, `[ cần xác minh ]`). Vẫn coi là chưa xác minh. → Task 8.
5. **Bản ghi đã đăng đang có bản nháp mới chưa duyệt.** Bản công khai hiện bản đã đăng, không lộ nội dung nháp. Chạy seed hai lần không tạo bản trùng. → Task 9, Task 10.

---

## Cấu trúc file

```
docker-compose.yml                 Postgres 17 cho dev + DB test
.env.example
src/payload.config.ts
src/access/roles.ts                isReviewer, isLoggedIn, reviewerOnlyField
src/access/publishing.ts           guardPublish hook, workflowField, syncWorkflow hook
src/collections/{Users,Sources,TimelineEvents,CraftSteps,Products,Stories,People,Makers,ArchiveAssets}.ts
src/globals/{SiteSettings,PageIntros}.ts
src/lib/content/types.ts           Mode, Flag, view models
src/lib/content/visibility.ts      hàm thuần áp quy tắc (không gọi Payload)
src/lib/content/mode.ts            getMode()
src/lib/content/index.ts           hàm truy vấn cho trang
src/seed/index.ts                  chạy bằng `npm run seed`
src/seed/data/*.ts|*.md            dữ liệu trích nguyên văn từ artboard
src/app/(frontend)/{layout.tsx,globals.css,fonts.ts,page.tsx}
src/components/layout/{SiteHeader,MobileMenu,SiteFooter,Breadcrumb}.tsx
tests/int/helpers.ts               getTestPayload(), resetDb(), makeUser(role)
tests/int/*.int.spec.ts
tests/unit/*.test.ts
tests/e2e/*.e2e.spec.ts
```

---

### Task 1: Khởi tạo app, Postgres, hạ tầng test

**Files:**
- Create: toàn bộ khung từ template `blank` của create-payload-app, `docker-compose.yml`, `.env.example`, `tests/int/helpers.ts`
- Modify: `CLAUDE.md` (mục Stack, mục "KHÔNG làm"), `.gitignore`

**Interfaces:**
- Produces:
  - `getTestPayload(): Promise<Payload>`, dùng `DATABASE_URI_TEST`
  - `resetDb(payload): Promise<void>` xoá mọi document của mọi collection
  - `makeUser(payload, role: 'editor' | 'reviewer'): Promise<User>`, viết ở Task 3, khai báo chỗ trước

- [ ] **Step 1:** Chạy `npx create-payload-app@3.92.0 -n chieu-hoi -t blank --db postgres` trong một thư mục trống *ngoài* repo. Chuyển mọi file sang gốc repo, giữ nguyên `README.md`, `CLAUDE.md`, `docs/`, `design/`, `content/` hiện có. Nếu template tạo `README.md` thì bỏ bản của template.
- [ ] **Step 2:** `docker-compose.yml`: dịch vụ `postgres:17`, cổng 5432, tạo 2 DB `chieuhoi` và `chieuhoi_test` (dùng script init). `.env.example` gồm `DATABASE_URI`, `DATABASE_URI_TEST`, `PAYLOAD_SECRET`, `APP_ENV=development`, `PREVIEW_ALL=true`, `SEED_REVIEWER_EMAIL`, `SEED_REVIEWER_PASSWORD`.
- [ ] **Step 3:** Ghim `next` ở bản 16.4.x (Payload 3.92 yêu cầu `>=16.3.3 <17`), `tailwindcss` 4.3.x. Thêm script `seed: "payload run src/seed/index.ts"`. Kiểm tra template đã có `test:int` (vitest) và `test:e2e` (playwright). Nếu thiếu thì thêm. Viết `tests/int/helpers.ts`.
- [ ] **Step 4:** Cập nhật `CLAUDE.md`:
  - mục Stack: Next + Payload 3 + Postgres, dữ liệu đọc qua `src/lib/content`;
  - mục KHÔNG làm: bỏ "backend nhận form", giữ giỏ hàng, thanh toán, đăng nhập người xem, form Kết nối minh hoạ;
  - thêm dòng trỏ tới spec.
- [ ] **Step 5:** Kiểm tra: `docker compose up -d && npm run dev`. Mở `http://localhost:3000/admin`, phải thấy màn hình tạo user đầu tiên. Chạy `npm run lint && npm run build`, cả hai phải PASS.
- [ ] **Step 6:** Commit `chore: khởi tạo Next + Payload + Postgres`.

---

### Task 2: Token, font, layout gốc frontend

**Files:**
- Create/Modify: `src/app/(frontend)/globals.css`, `src/app/(frontend)/fonts.ts`, `src/app/(frontend)/layout.tsx`, `src/app/(frontend)/page.tsx` (tạm, chỉ một `<h1>`)
- Test: `tests/e2e/foundation.e2e.spec.ts`

- [ ] **Step 1: Viết test e2e.** Test `trang gốc có lang vi, nền Cói, font Việt`:
  - `html[lang="vi"]` tồn tại;
  - `getComputedStyle(body).backgroundColor === 'rgb(243, 235, 221)'`;
  - phần tử `h1` có `font-family` chứa `Noto Serif Display`;
  - khi bật `reducedMotion: 'reduce'`, `getPropertyValue('--dur-ui')` trả `0ms`.
- [ ] **Step 2:** Chạy `npm run test:e2e -- foundation`, kết quả phải FAIL.
- [ ] **Step 3:** `globals.css`:
  - `@import "tailwindcss"`;
  - chép nguyên khối `:root`, khối `@media (prefers-reduced-motion)`, `.threads` và `.check` từ `design/tokens/tokens.css`;
  - `@theme` ánh xạ màu thành `--color-*` (`bg-primary`, `bg-secondary`, `bg-raised`, `bg-inverse`, `bg-deep`, `bg-ink`, `text-*`, `accent*`, `on-accent`, `border-*`), font thành `--font-display`, `--font-serif`, `--font-sans`, thang chữ desktop/mobile theo bảng HANDOFF, và `--radius-*: 0`.
  - `fonts.ts` export 3 font kèm biến CSS. `layout.tsx` gắn class biến font và `lang="vi"`, `body` dùng `bg-bg-primary text-text-primary font-sans`.
- [ ] **Step 4:** Chạy lại test, kết quả phải PASS. `npm run build` phải PASS.
- [ ] **Step 5:** Commit `feat: token thiết kế và font tiếng Việt`.

---

### Task 3: Users, vai trò, helper quyền, admin tiếng Việt

**Files:**
- Create: `src/access/roles.ts`, `src/collections/Users.ts`
- Modify: `src/payload.config.ts`, `tests/int/helpers.ts`
- Test: `tests/int/users.int.spec.ts`

**Interfaces:**
- Produces:
  - `isLoggedIn: Access`, `isReviewer: Access`
  - `isReviewerUser(user): boolean`
  - `reviewerOnlyField: FieldAccess`, dùng cho `access.create` và `access.update` của trường kiểm soát
  - `makeUser(payload, role)`

- [ ] **Step 1: Viết test.**
  - `editor không tạo được user`: `payload.create({collection:'users', user: editor, overrideAccess:false, ...})` rejects.
  - `reviewer tạo được user`: resolves.
  - `editor không tự nâng role`: editor update chính mình `{role:'reviewer'}` thì rejects, hoặc role giữ nguyên `editor`.
  - `khách không đọc được users`: `payload.find({collection:'users', overrideAccess:false})` không có user thì rejects.
- [ ] **Step 2:** Chạy `npm run test:int -- users`, kết quả phải FAIL.
- [ ] **Step 3:** Users: `auth: true`; trường `name` (text), `role` (select `editor` | `reviewer`, required, default `editor`, field access update/create = `reviewerOnlyField`); `access`: create/delete = `isReviewer`, read/update = reviewer hoặc chính mình. Config:
  - `i18n: { supportedLanguages: { vi }, fallbackLanguage: 'vi' }` (từ `@payloadcms/translations/languages/vi`);
  - `localization: { locales: [{ code: 'vi', label: 'Tiếng Việt' }], defaultLocale: 'vi' }`;
  - `graphQL: { disable: true }`.
- [ ] **Step 4:** Chạy test, kết quả phải PASS.
- [ ] **Step 5:** Commit `feat: users hai vai trò và admin tiếng Việt`.

---

### Task 4: Quy trình đăng + Sources + TimelineEvents

**Files:**
- Create: `src/access/publishing.ts`, `src/collections/Sources.ts`, `src/collections/TimelineEvents.ts`
- Test: `tests/int/publishing.int.spec.ts`

**Interfaces:**
- Produces (dùng ở Task 5–7):
  - `workflowField(options?: { allowIdea?: boolean }): SelectField`: tên `workflow`, giá trị `idea`*, `draft`, `in_review`, `published`, default `draft`. Validate: người không phải reviewer không được chọn `published`. (*`idea` chỉ có khi `allowIdea`.)
  - `guardPublish: CollectionBeforeChangeHook & GlobalBeforeChangeHook`: ném `Forbidden` khi `data._status === 'published'` mà user không phải reviewer.
  - `syncWorkflow: CollectionBeforeChangeHook`: khi `_status === 'published'` và workflow là `draft`/`in_review`, đặt `published`. Giữ nguyên nếu là `idea`.
  - `contentCollectionDefaults`: `{ versions: { drafts: true }, access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isReviewer }, hooks: { beforeChange: [guardPublish, syncWorkflow] } }`.
- Sources (không drafts): `sourceId` (text, unique, vd `vietnamplus-2026`), `publisher`, `title`, `url`, `date` (text `YYYY-MM-DD`). Access giống trên, delete = reviewer.
- TimelineEvents: `label` (text, chấp nhận "Thời Lê", "[?]"), `title` (localized), `body` (textarea, localized), `order` (number, required), `confidence` (select `press`/`oral`/`pending`, default `pending`, `reviewerOnlyField`), `sources` (relationship → sources, hasMany), `workflowField()`.

- [ ] **Step 1: Viết test.**
  - `editor lưu nháp được`: create timeline-event `_status:'draft'` resolves.
  - `editor không đăng được`: create hoặc update với `_status:'published'` (overrideAccess:false, user editor) rejects.
  - `editor không đặt workflow published`: rejects.
  - `editor không sửa confidence`: editor update `{confidence:'press'}` thì giá trị đọc lại vẫn `pending`.
  - `reviewer đăng thì workflow thành published`: reviewer update `_status:'published'` trên doc `workflow:'in_review'` thì đọc lại `workflow === 'published'`.
  - `editor không xoá được`: rejects.
  - `khách không đọc được qua API`: find không có user, overrideAccess:false thì rejects.
- [ ] **Step 2:** Chạy `npm run test:int -- publishing`, kết quả phải FAIL.
- [ ] **Step 3:** Cài đặt theo Interfaces, đăng ký vào config.
- [ ] **Step 4:** Chạy test, kết quả phải PASS.
- [ ] **Step 5:** Commit `feat: quy trình nháp/duyệt/đăng, nguồn và dòng thời gian`.

---

### Task 5: ArchiveAssets (ảnh + quyền dùng)

**Files:**
- Create: `src/collections/ArchiveAssets.ts`
- Test: `tests/int/archive-assets.int.spec.ts`, fixture `tests/fixtures/tiny.webp`

**Interfaces:**
- Produces: `isAssetPubliclyAllowed(doc: { rights: string; subjectConsent: string }): boolean`, export từ `src/collections/ArchiveAssets.ts`. Trả `rights === 'permitted' && subjectConsent !== 'pending'`. Task 8 dùng lại hàm này.

Collection upload (không drafts; cổng công khai là `rights` + `subjectConsent`. Đây là quyết định của plan):
- `upload`: `mimeTypes: ['image/*']`, `imageSizes`: `thumb` 480, `card` 960, `wide` 1600, `full` 2400, định dạng webp.
- Trường:
  - `code` (text, unique khi có, dạng `TL-001`), `title`, `description` (textarea), `alt` (required);
  - `category` (select: Làng quê, Nghề dệt, Con người, Sản phẩm, Ký ức, Tư liệu lịch sử), `era` (`old` | `now`), `takenAt` (text);
  - `relatedLabel`, `relatedHref`, `photographer`, `owner`, `source` (text);
  - `rights` (`unknown` | `permitted` | `restricted`, default `unknown`, `reviewerOnlyField`);
  - `subjectConsent` (`not_applicable` | `pending` | `given`, default `pending`, `reviewerOnlyField`);
  - `inArchive` (checkbox).
- Validate: `inArchive` bật thì `code`, `category`, `era` bắt buộc.
- `access.read`: đã đăng nhập thì đọc tất cả. Khách thì trả query `{ and: [{ rights: { equals: 'permitted' } }, { subjectConsent: { not_equals: 'pending' } }] }`. Payload dùng read access này khi phục vụ file.
- Create/update = đã đăng nhập, delete = reviewer.

- [ ] **Step 1: Viết test.**
  - `khách không lấy được file ảnh rights unknown`: tạo asset bằng reviewer (filePath fixture), `fetch` URL file qua `payload` REST handler (hoặc `GET /api/archive-assets/file/<filename>` với server test) thì status 403 hoặc 404.
  - `khách lấy được file ảnh permitted + not_applicable`: status 200.
  - `ảnh permitted nhưng subjectConsent pending vẫn bị chặn`.
  - `inArchive thiếu code thì lỗi validate`.
  - `editor không sửa rights`.
- [ ] **Step 2:** Chạy test, kết quả phải FAIL.
- [ ] **Step 3:** Cài đặt.
- [ ] **Step 4:** Chạy test, kết quả phải PASS.
- [ ] **Step 5:** Commit `feat: kho tư liệu ảnh với quyền dùng và đồng ý`.

---

### Task 6: CraftSteps, Products, Stories, People, Makers

**Files:**
- Create: `src/collections/{CraftSteps,Products,Stories,People,Makers}.ts`
- Test: `tests/int/control-fields.int.spec.ts`

Mọi collection dưới đây dùng `contentCollectionDefaults` và `workflowField()`. Riêng Stories dùng `workflowField({ allowIdea: true })`. Các trường chữ hiển thị đều `localized: true`. "(R)" nghĩa là `reviewerOnlyField`.

- **CraftSteps:** `n` (number 1–7, unique), `title`, `subtitle`, `body` (textarea), `tools`, `image` (→ archive-assets), `shotNeeded` (text), `focusX`, `focusY` (number 0–100), `verifiedBy` (text, R).
- **Products:**
  - `slug` (unique), `code` (vd "HIỆN VẬT 01"), `name`, `group` (`traditional` | `contemporary`), `summary` (textarea), `images` (→ archive-assets, hasMany);
  - `material`, `technique`, `size`, `care` (textarea);
  - `annotations` (array: `n`, `title`, `x`, `y` 0–100, `body`, `source` → sources);
  - `typeConfirmed` (checkbox, R), `maker` (→ makers).
- **Stories:**
  - `slug` (unique), `title`, `sapo` (textarea), `category` (select: Lịch sử, Ký ức làng quê, Đời sống hôm nay, Nghề truyền thống), `cover` (→ archive-assets);
  - `body` (richText lexical, có `BlocksFeature({ inlineBlocks: [{ slug: 'cite', fields: [{ name: 'source', type: 'relationship', relationTo: 'sources', required: true }] }] })`);
  - `editor` (text), `readingMinutes` (number), `sources` (→ sources, hasMany).
- **People:**
  - `slug` (unique), `name` (text, có thể trống), `category` (select: Nghệ nhân, Gia đình làm nghề, Người giữ nghề, lấy đủ danh sách từ `PeopleIndex.dc.html`), `role`, `note`, `yearsInCraft` (text), `portrait` (→ archive-assets);
  - `story` (richText), `quote` (textarea), `quoteSource` (→ sources);
  - `consent` (group: `name`, `photo`, `quote` đều checkbox, R), `reviewedBySubject` (checkbox, R).
- **Makers:** `name`, `contact` (textarea), `verified` (checkbox, R), `publicConsent` (checkbox, R).

- [ ] **Step 1: Viết test.** Test tham số hoá `editor không sửa được trường kiểm soát`, chạy trên các cặp:
  - `[craft-steps, verifiedBy]`;
  - `[products, typeConfirmed]`;
  - `[people, consent.name]`, `[people, consent.photo]`, `[people, consent.quote]`, `[people, reviewedBySubject]`;
  - `[makers, verified]`, `[makers, publicConsent]`.

  Với mỗi cặp: reviewer tạo doc, editor update trường đó, đọc lại thì giá trị không đổi.

  Thêm test `story chấp nhận workflow idea`, `product không chấp nhận workflow idea`.
- [ ] **Step 2:** Chạy test, kết quả phải FAIL.
- [ ] **Step 3:** Cài đặt, đăng ký vào config, chạy `npm run generate:types`.
- [ ] **Step 4:** Chạy test, kết quả phải PASS. `npm run build` phải PASS.
- [ ] **Step 5:** Commit `feat: collection công đoạn, sản phẩm, bài viết, con người, cơ sở dệt`.

---

### Task 7: Globals SiteSettings và PageIntros

**Files:**
- Create: `src/globals/SiteSettings.ts`, `src/globals/PageIntros.ts`
- Test: `tests/int/globals.int.spec.ts`

**Interfaces:**
- Produces: `RouteKey = 'home' | 'lang-hoi' | 'cau-chuyen' | 'nghe-det-chieu' | 'con-nguoi' | 'san-pham' | 'thu-vien' | 'ket-noi'`, export từ `src/globals/PageIntros.ts`.

Thiết kế:
- Cả hai global: `versions: { drafts: true }`, `access: { read: isLoggedIn, update: isLoggedIn }`, `hooks.beforeChange: [guardPublish]`.
- **SiteSettings:** `tagline`, `description`, `address`, `addressNote`, `email`, `phone`, `visitInfo` (textarea), `copyright`.
- **PageIntros:** mỗi `RouteKey` một group gồm `eyebrow`, `title`, `lead`. Riêng `home` thêm `heroTitle` (textarea, giữ ngắt dòng).

- [ ] **Step 1: Viết test.**
  - `editor không đăng site-settings`: `updateGlobal` với `_status:'published'` của editor rejects.
  - `reviewer đăng được`.
  - `khách không đọc global qua API`.
- [ ] **Step 2:** Chạy test, kết quả phải FAIL.
- [ ] **Step 3:** Cài đặt.
- [ ] **Step 4:** Chạy test, kết quả phải PASS.
- [ ] **Step 5:** Commit `feat: global thông tin site và phần mở đầu trang`.

---

### Task 8: Quy tắc hiển thị (hàm thuần)

**Files:**
- Create: `src/lib/content/types.ts`, `src/lib/content/visibility.ts`, `src/lib/content/mode.ts`
- Test: `tests/unit/visibility.test.ts`, `tests/unit/mode.test.ts`

**Interfaces:**
- Produces (dùng ở Task 9 và mọi phase sau):

```ts
// types.ts
export type Mode = 'public' | 'preview'
export type Flag = 'unpublished' | 'rights-not-permitted' | 'consent-pending' | 'unverified' | 'idea'
export interface ImageView {
  url: string; alt: string; width: number; height: number
  sizes: Partial<Record<'thumb' | 'card' | 'wide' | 'full', string>>
  photographer: string | null; code: string | null; flags: Flag[]
}
export interface PersonView {
  slug: string; category: string; role: string | null
  name: string | null; portrait: ImageView | null
  quote: { text: string; sourceId: string } | null
  consentPending: boolean; flags: Flag[]
}

// visibility.ts
export const UNVERIFIED = '[cần xác minh]'
export function isUnverified(v: unknown): boolean
export function showText(v: string | null | undefined, mode: Mode): string | null
export function toImageView(asset: ArchiveAsset | number | null | undefined, mode: Mode): ImageView | null
export function toPersonView(p: Person, mode: Mode): PersonView

// mode.ts
export async function getMode(): Promise<Mode>
```

Quy tắc:
- `isUnverified`: trả true khi giá trị là null, undefined, chuỗi rỗng hoặc chỉ có khoảng trắng, hoặc chứa dấu khớp `/\[\s*cần xác minh\s*\]/iu` (so trên chuỗi đã chuẩn hoá NFC).
- `showText`: ở `public`, giá trị unverified thì trả `null`. Ở `preview`, chuỗi rỗng thì trả `UNVERIFIED`, còn lại trả nguyên văn.
- `toImageView`: asset chưa populate (là number) hoặc null thì trả `null`. Ở `public`, nếu `!isAssetPubliclyAllowed` thì trả `null`. Ở `preview`, luôn trả view, gắn flag `rights-not-permitted` hoặc `consent-pending` tuỳ trường hợp.
- `toPersonView`:
  - `name` chỉ hiện khi `consent.name`;
  - `portrait` chỉ hiện khi `consent.photo` *và* `toImageView` khác null;
  - `quote` chỉ hiện khi `consent.quote` *và* có `quoteSource` *và* `!isUnverified(quote)`;
  - `consentPending = !(consent.name && consent.photo)`.
  - Ở `preview`, các trường bị ẩn vẫn trả về giá trị và gắn flag `consent-pending`. Nhãn "Chờ đồng ý" là việc của component.
- `getMode`: trả `'preview'` khi `(await draftMode()).isEnabled`. Ngoài ra, khi `APP_ENV !== 'production'` và `PREVIEW_ALL === 'true'` thì cũng trả `'preview'`. Production luôn bỏ qua `PREVIEW_ALL`.

- [ ] **Step 1: Viết test** `tests/unit/visibility.test.ts`:
  - `isUnverified`: `null`, `''`, `'  '`, `'Kiểu dệt: [cần xác minh].'`, `'[Cần xác minh]'`, `'[ cần xác minh ]'` đều cho true. `'Sinh tại làng Hải Triều'`, `'[?]'` cho false.
  - `showText('Kiểu dệt: [cần xác minh].', 'public')` cho `null`. Ở `'preview'` trả nguyên văn. `showText('', 'preview')` cho `'[cần xác minh]'`.
  - `toImageView({rights:'unknown', subjectConsent:'not_applicable', ...}, 'public')` cho `null`. Ở `'preview'` cho view có `flags` chứa `'rights-not-permitted'`.
  - `toImageView({rights:'permitted', subjectConsent:'pending'}, 'public')` cho `null`.
  - Person `consent {name:false, photo:true, quote:false}`, portrait permitted, chạy `'public'`: `name === null`, `portrait !== null`, `consentPending === true`.
  - Person `consent.photo:true`, portrait `rights:'unknown'`, chạy `'public'`: `portrait === null`.
  - Person `consent.quote:true` nhưng `quoteSource` null: `quote === null`.
  - Person mọi consent false, chạy `'preview'`: `name` khác null và `flags` chứa `'consent-pending'`.

  Viết `tests/unit/mode.test.ts` (mock `next/headers`): `APP_ENV=production, PREVIEW_ALL=true, draftMode off` cho `'public'`. `APP_ENV=staging, PREVIEW_ALL=true` cho `'preview'`.
- [ ] **Step 2:** Chạy `npx vitest run tests/unit`, kết quả phải FAIL.
- [ ] **Step 3:** Cài đặt.
- [ ] **Step 4:** Chạy lại, kết quả phải PASS.
- [ ] **Step 5:** Commit `feat: quy tắc hiển thị công khai/preview`.

---

### Task 9: Hàm truy vấn `lib/content`

**Files:**
- Create: `src/lib/content/index.ts` (và chia file theo kiểu nội dung nếu dài)
- Test: `tests/int/content.int.spec.ts`

**Interfaces:**
- Consumes: Task 8, `RouteKey` ở Task 7.
- Produces (mọi hàm nhận `mode: Mode`; trang gọi `getMode()` rồi truyền vào):

```ts
getSources(): Promise<SourceView[]>                       // { id: string (sourceId), publisher, title, url, date }
getTimeline(mode): Promise<TimelineEventView[]>           // sort theo order; { label, title, body, confidence, sourceIds, flags }
getCraftSteps(mode): Promise<CraftStepView[]>             // sort theo n; { n, title, subtitle, body, tools, image: ImageView|null, shotNeeded, focus: [x,y], flags }
getProducts(mode): Promise<ProductCardView[]>
getProduct(slug, mode): Promise<ProductView | null>       // annotations: chỉ giữ body đã qua showText; maker chỉ khi publicConsent
getStories(mode): Promise<StoryCardView[]>                // gồm cả idea (hasDetail=false)
getStory(slug, mode): Promise<StoryView | null>           // null khi workflow==='idea'
getPeople(mode): Promise<PersonView[]>
getPerson(slug, mode): Promise<PersonDetailView | null>
getArchive(mode): Promise<ArchiveItemView[]>              // chỉ inArchive; ImageView + title, description, category, era, related
getSiteSettings(mode): Promise<SiteSettingsView>
getPageIntro(route: RouteKey, mode): Promise<PageIntroView>
```

Quy tắc chung:
- Gọi Local API với `overrideAccess: true`. Ở `public`: `draft: false` và `where: { _status: { equals: 'published' } }`. Ở `preview`: `draft: true` và không lọc theo `_status`.
- Áp `showText` cho mọi trường chữ, `toImageView` cho mọi ảnh.
- Bản ghi chưa đăng chỉ có ở `preview` và mang flag `unpublished`.
- Hàm trả view model thuần (plain object). Không trả document Payload thô cho component.

- [ ] **Step 1: Viết test** (DB test, dựng dữ liệu bằng reviewer):
  - `public bỏ bản ghi chưa đăng`: 1 timeline đã đăng + 1 nháp cho `getTimeline('public')` có length 1, còn `'preview'` có length 2 và bản nháp có flag `unpublished`.
  - `public hiện bản đã đăng, không lộ nháp mới`: đăng title "A", sau đó reviewer lưu nháp title "B". `getTimeline('public')[0].title === 'A'`, còn `'preview'` cho `'B'`.
  - `bìa không được phép thì null`: story đã đăng, cover `rights:'unknown'`. `getStory(slug,'public').cover === null`.
  - `idea có thẻ, không có trang`: story `workflow:'idea'` đã đăng. `getStories('public')` chứa nó với `hasDetail === false`, và `getStory(slug,'public') === null`.
  - `maker chưa đồng ý bị ẩn`: `getProduct(slug,'public').maker === null`.
  - `thư viện chỉ lấy inArchive và ảnh được phép`.
  - `site settings trống thì ẩn`: global đã đăng với `email: ''` cho `getSiteSettings('public').email === null`, còn `'preview'` cho `'[cần xác minh]'`. (Artboard chỉ có placeholder `[Email liên hệ]`, nên seed để trống trường này.)
- [ ] **Step 2:** Chạy test, kết quả phải FAIL.
- [ ] **Step 3:** Cài đặt.
- [ ] **Step 4:** Chạy test, kết quả phải PASS.
- [ ] **Step 5:** Commit `feat: lớp truy vấn nội dung có lọc công khai`.

---

### Task 10: Script seed

**Files:**
- Create: `src/seed/index.ts`, `src/seed/guard.ts`, `src/seed/data/archive.ts`, `src/seed/data/chuyen-ve-trang-chieu.md`, `src/seed/data/site.ts`, `src/seed/data/extras.ts`
- Test: `tests/unit/seed-guard.test.ts`, `tests/int/seed.int.spec.ts`

**Interfaces:**
- Produces:
  - `assertSeedAllowed(env: NodeJS.ProcessEnv): void`: ném lỗi khi `APP_ENV === 'production'` hoặc `APP_ENV` không có.
  - `seed(payload: Payload): Promise<void>`: idempotent, upsert theo khoá tự nhiên (`sourceId`, `slug`, `n`, `code`, tên file ảnh, `order`).
  - `injectCitations(root: SerializedEditorState, idBySourceId: Record<string, number>): SerializedEditorState`: thay token `[[cite:<sourceId>]]` trong text node bằng inline block `cite`.

Nguồn dữ liệu:
- `content/seed/*.json` là gốc.
- Trường còn thiếu lấy **nguyên văn** từ artboard: sapo/mô tả/alt của Stories (`StoriesIndex.dc.html`), danh sách người mẫu (`PeopleIndex.dc.html`, tên để `null`), mô tả Products (`ProductsIndex.dc.html`), 14 mục thư viện (`ArchivePage.dc.html`: code `TL-001` đến `TL-014` theo thứ tự mảng `data`, `era: 'now'`, `inArchive: true`).
- Toàn văn "Chuyện về Trạng Chiếu" từ `StoryDetail.dc.html` lưu thành markdown, chú thích nguồn viết dạng `[[cite:id]]`. Chuyển sang Lexical bằng `convertMarkdownToLexical` của `@payloadcms/richtext-lexical`, rồi chạy `injectCitations`.
- SiteSettings lấy từ footer `Home.dc.html`. Email, phone, visitInfo để trống vì artboard chỉ có placeholder. PageIntros lấy từ phần đầu mỗi artboard desktop.
- Mọi ảnh trong `design/reference-images/*.webp` được upload với `rights: 'unknown'`, `subjectConsent: 'pending'`. Mọi consent để false.
- Trạng thái đăng: bản ghi trong seed có `status: 'idea'` thì đăng với workflow `idea`; `status: 'draft'` hoặc `pending` thì giữ nháp; còn lại đăng. Sources và Globals thì đăng.
- Tạo reviewer từ `SEED_REVIEWER_EMAIL` / `SEED_REVIEWER_PASSWORD` nếu chưa có.

- [ ] **Step 1: Viết test.**
  - Unit: `assertSeedAllowed({APP_ENV:'production'})` throws. Thiếu APP_ENV cũng throws. `development` và `staging` không throw.
  - Unit: `injectCitations` trên một paragraph "abc [[cite:danviet-2024]] def" cho ra 3 node: text, inlineBlock (source = id), text.
  - Int: chạy `seed(payload)` hai lần. Đếm `sources` = số mục trong `sources.json`, `craft-steps` = 7, `archive-assets` có `inArchive` = 14, không có bản trùng.
- [ ] **Step 2:** Chạy test, kết quả phải FAIL.
- [ ] **Step 3:** Cài đặt. `src/seed/index.ts` gọi `assertSeedAllowed(process.env)` trước mọi thao tác ghi.
- [ ] **Step 4:** Chạy test, kết quả phải PASS. Chạy `npm run seed` trên DB dev, mở `/admin`, phải thấy đủ dữ liệu và ảnh.
- [ ] **Step 5:** Commit `feat: seed dữ liệu khởi đầu từ gói bàn giao`.

---

### Task 11: Khung layout — SiteHeader, MobileMenu, SiteFooter, Breadcrumb

**Files:**
- Create: `src/components/layout/{SiteHeader,MobileMenu,SiteFooter,Breadcrumb,nav}.tsx|ts`
- Modify: `src/app/(frontend)/layout.tsx`
- Test: `tests/e2e/layout.e2e.spec.ts`

**Interfaces:**
- Consumes: `getSiteSettings`, `getMode`.
- Produces:
  - `NAV_ITEMS: { n: string; label: string; href: string }[]`: 01 Làng Hới `/lang-hoi`, 02 Câu chuyện `/cau-chuyen`, 03 Nghề dệt chiếu `/nghe-det-chieu`, 04 Con người `/con-nguoi`, 05 Sản phẩm `/san-pham`, 06 Thư viện `/thu-vien`. Nút "Kết nối" trỏ `/ket-noi`.
  - `<Breadcrumb items={{ label: string; href?: string }[]} />`
  - `<SiteFooter variant="full" | "compact" />`

Tra copy, khoảng cách và trạng thái trong `Home.dc.html` (header, footer), `MenuMobile.dc.html`, `Components.dc.html`. So với `design/screens/Home.jpg`, `HomeMobile.jpg`, `MenuMobile.jpg`, `Components.jpg`.

Hành vi:
- Desktop: trang hiện tại có `aria-current="page"` và gạch chân sợi rơm.
- Nút VI · EN: EN `disabled`.
- Mobile < 1024: logo + nút menu 48×48 (`aria-expanded`, `aria-controls`). Menu mở toàn màn hình, Esc đóng, focus trả về nút menu, không khoá cuộn trang (theo `CLAUDE.md`).
- Footer `full` chỉ dùng ở `/`. Các dòng địa chỉ/email/phone đi qua `showText`.

- [ ] **Step 1: Viết test e2e.**
  - `header desktop có 6 mục đánh số và Kết nối` (viewport 1440).
  - `trang hiện tại có aria-current`.
  - `menu mobile mở/đóng bằng bàn phím`: viewport 390, Tab tới nút menu, Enter, mong đợi `aria-expanded="true"` và thấy 6 mục. Esc thì `aria-expanded="false"` và focus ở nút menu.
  - `nút menu ≥ 44px`.
  - `EN bị vô hiệu`.
  - `axe không có lỗi serious/critical ở / (1440 và 390)`.
- [ ] **Step 2:** Chạy test, kết quả phải FAIL.
- [ ] **Step 3:** Cài đặt. MobileMenu là client component, phần còn lại là server component.
- [ ] **Step 4:** Chạy test, kết quả phải PASS. Chụp màn hình header và footer ở 1440 và 390, đặt cạnh `Home.jpg` / `HomeMobile.jpg` / `MenuMobile.jpg`, ghi các điểm lệch vào mô tả commit nếu có.
- [ ] **Step 5:** Commit `feat: header, menu mobile, footer, breadcrumb`.

---

### Task 12: Kết thúc phase

- [ ] **Step 1:** `npm run lint && npm run test:int && npx vitest run tests/unit && npm run test:e2e && npm run build`. Tất cả phải PASS.
- [ ] **Step 2:** Đăng nhập `/admin` bằng tài khoản editor (tạo bằng reviewer). Thử đăng một bài: giao diện phải báo lỗi. Đổi sang reviewer: đăng được.
- [ ] **Step 3:** Dừng lại, gửi người dùng: tóm tắt, ảnh chụp header/footer so với thiết kế, cách chạy local (`docker compose up -d`, `npm run seed`, `npm run dev`).

---

## Lộ trình các plan tiếp theo

Mỗi phase có plan riêng, viết khi phase trước được người dùng duyệt. Plan sau dùng interface của `lib/content` ở Task 8–9.

| Plan | Nội dung | Ghi chú cho người viết plan |
| --- | --- | --- |
| Phase 2 — Component | Button, LinkArrow, SectionHeading, DocumentLabel, VerifyNote, SourceNote, PortraitCard, StoryCard, ObjectCard, FilterChips, Tabs, trạng thái phản hồi, `/styleguide` | `/styleguide` chỉ hiện khi `APP_ENV !== 'production'`. Component nhận view model, hiển thị flag thành nhãn ("Chờ đồng ý", "Bản nháp", "Chủ đề đề xuất", "Ảnh cần chụp") |
| Phase 3 — Trang chủ | `/` desktop + mobile | Dùng `getPageIntro('home')` |
| Phase 4 — Nghề dệt + Làng Hới | CraftJourney, Timeline | Đặc tả tương tác HANDOFF mục 1–2 |
| Phase 5 — Các trang còn lại | Câu chuyện (+ render inline `cite` thành SourceNote), Con người, Sản phẩm (PatternExplorer), Thư viện (lightbox, `?anh=TL-001`), Kết nối (form minh hoạ) | `generateStaticParams` chỉ cho bản ghi đủ điều kiện ở chế độ public |
| Phase 6 — Admin hoàn thiện | Route bật/tắt Draft Mode (chỉ cho user đã đăng nhập), nút "Xem trước" trong admin, hook `afterChange`/`afterDelete` gọi `revalidateTag`, nhãn admin, test e2e quy trình hai vai trò | — |
| Phase 7 — Staging + kiểm tra | `@payloadcms/storage-s3` cho R2 (bật khi có biến môi trường), Neon, Vercel Hobby, mật khẩu + `noindex` cho staging, `PREVIEW_ALL=true`, axe/Lighthouse, so ảnh chụp | Kiểm tra hạn mức Image Optimization của Vercel Hobby. Nếu thiếu thì dùng `imageSizes` sẵn có và `unoptimized` |
