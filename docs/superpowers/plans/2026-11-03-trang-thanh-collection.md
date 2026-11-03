# Collection Trang Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển global `page-intros` thành collection `pages` (mỗi trang một tài liệu có nháp/đăng riêng), chặn xoá Nguồn đang được trích, kiểm nguồn của trang khi đăng, và đặt ảnh dụng cụ vào trong dòng dụng cụ, mà trang công khai không đổi.

**Architecture:** Làm qua ba đợt, mỗi đợt một nhóm commit riêng và một lần push riêng.
- **Đợt 1 (Task 1–5):** thêm `pages` (ẩn, chỉ đọc) cạnh global, và thêm lệnh `migrate:pages` để chép dữ liệu.
- **Đợt 2a (Task 6–9):** đổi lớp `lib/content` và các lệnh nhập liệu sang đọc/ghi `pages`, mở `pages` trong admin, gỡ global khỏi code. Đợt này không có migration.
- **Đợt 2b (Task 10):** chỉ có migration xoá bảng cũ.
- Mỗi cặp "code cũ đang chạy + DB đã migrate" trong lúc Vercel build phải chạy được. Xem bảng "Code nào chạy trên DB nào" ở mục 6.6 của spec; Task 9 diễn tập đúng các cặp đó.

**Tech Stack:** Next.js 16 App Router, Payload CMS 3.92 (adapter Postgres, drizzle), TypeScript strict, vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-03-trang-thanh-collection-design.md`

## Global Constraints

- Kiến trúc một chiều: `app` → `components` → `lib/content` → Payload. Chỉ `lib/content` gọi Payload; component chỉ nhận `*View` qua `import type`. `src/collections`, `src/globals`, `src/access`, `src/hooks` không import từ `components` hay `app`.
- Đổi schema thì chạy `npm run migrate:create <tên>` và commit `src/migrations`. Mỗi đợt có migration riêng nếu đổi schema.
- Tên bảng, cột, ràng buộc trong Postgres tối đa 63 ký tự.
- Trang công khai không đổi: e2e các project `public`, `a11y-public`, `chromium` phải qua mà không sửa kỳ vọng về chữ, ảnh hay số chú thích.
- Lời báo lỗi trong admin bằng tiếng Việt.
- Không tạo chữ nội dung mới. Bước chép dữ liệu chỉ chép.
- `test:int` và `guide:seed` không chạy song song.
- **Không bao giờ stage hay commit `docs/DEPLOY.md`.** Đoạn hướng dẫn mới đưa cho người dùng tự ghi.
- **Không push** khi người dùng chưa đồng ý rõ ràng. Push main làm Vercel deploy.
- Đợt 2a không có migration. Chỉ đợt 1 và đợt 2b đổi schema.
- Chuỗi kết thúc mỗi commit: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Trước khi xoá workspace SDD, chép mọi mục review còn mở vào `docs/superpowers/backlog.md`.
- Lệnh kiểm chung cho mỗi task (nếu không nói khác): `npm run lint && npx tsc --noEmit && npm run test:unit`, cộng file test int của task: `npm run test:int -- <file>`.

## Review Focus

1. Nguồn chỉ được trích trong **bản nháp chưa đăng** (bản công khai không trích) vẫn phải bị chặn xoá. Test ở Task 1.
2. Global **chưa từng đăng** nhưng có bản nháp: `migrate:pages` tạo 8 trang dạng nháp, không trang nào thành đã đăng. Test ở Task 5.
3. Lưu trang qua API (không qua admin) kèm ô của trang khác, ví dụ trang `home` gửi `facts`: ô đó bị bỏ, không ghi xuống DB. Test ở Task 3.
4. Đổi thứ tự hai dòng dụng cụ rồi đăng: ảnh đi theo đúng tên dụng cụ trên `/nghe-det-chieu`. Test ở Task 6.
5. Chạy `migrate:pages` hai lần liên tiếp: lần hai không đổi gì, và `--check` báo không khác biệt. Test ở Task 5.

---

## File Structure

| File | Trách nhiệm | Task |
|---|---|---|
| `src/hooks/sourceRefs.ts` (mới) | Tìm nơi đang trích một nguồn; hook `beforeDelete` của Nguồn | 1 |
| `src/collections/pages/routeKeys.ts` (mới) | `ROUTE_KEYS`, `RouteKey`, `ROUTE_LABELS`, `ROUTE_PATHS` (chuyển từ `PageIntros.ts`) | 2 |
| `src/globals/pageFacts.ts` | Hàm tạo trường nhận tiền tố `dbName` và tuỳ chọn ảnh dụng cụ | 2 |
| `src/globals/pageMedia.ts` | Thêm `PAGES_MEDIA_SLOTS` (không có `tool-1..3`) | 2 |
| `src/collections/pages/fields.ts` (mới) | Danh sách trường của `pages`, map ô riêng theo trang | 3 |
| `src/collections/pages/stripForeign.ts` (mới) | Hàm thuần bỏ ô không thuộc trang | 3 |
| `src/collections/pages/checkPageSources.ts` (mới) | Hàm thuần tìm câu trích nguồn ngoài `pageSources` | 4 |
| `src/collections/Pages.ts` (mới) | Collection config, quyền, hook, cờ `PAGES_LIVE` | 3, 4, 8 |
| `src/seed/migratePages.ts` (mới) | `pageFromGlobal`, `samePageContent`, `migratePages`, `checkPages` | 5 |
| `src/scripts/migrate-pages.ts` (mới) | CLI `--check`, `--replace` | 5 |
| `src/lib/content/queries.ts`, `pages.ts`, `pageFacts.ts` | Đọc `pages` theo `slug` | 6 |
| `src/seed/index.ts`, `importContent.ts`, `pageFacts.ts`, `guide.ts` | Ghi `pages` | 7 |
| `src/admin/guide/*` | Lời hướng dẫn và ảnh | 9 |
| `src/globals/PageIntros.ts` (xoá) | Gỡ ở đợt 2a, bảng xoá ở đợt 2b | 8, 10 |

---

## Đợt 1

### Task 1: Chặn xoá Nguồn đang được trích

**Files:**
- Create: `src/hooks/sourceRefs.ts`
- Modify: `src/collections/Sources.ts:32-33` (thêm `beforeDelete`)
- Modify: `tests/int/helpers.ts:22-33`, `src/seed/guide.ts:51-61` (thêm cờ vào `context`)
- Test: `tests/unit/hooks/source-refs.test.ts`, `tests/int/source-delete.int.spec.ts`

**Interfaces:**
- Produces:
  - `citedSourceIds(value: unknown): Set<number>`: hàm thuần, đệ quy.
  - `type SourceRef = { collection: string; id: number | string | null; label: string }`
  - `findSourceRefs(payload: Payload, sourceId: number): Promise<SourceRef[]>`
  - `blockCitedSourceDelete: CollectionBeforeDeleteHook`
  - Cờ `req.context.skipSourceRefGuard`.

- [ ] **Step 1: Viết test unit cho `citedSourceIds`.** Mỗi trường hợp một `it`, với `doc` như sau:
  - `{ sources: [3, { id: 5 }] }` → `{3, 5}`.
  - `{ annotations: [{ source: 7 }] }` → `{7}`.
  - `{ quoteSource: { id: 9 } }` → `{9}`.
  - `{ pageSources: [2] }` → `{2}`.
  - Văn bản Lexical `{ root: { children: [{ type: 'paragraph', children: [{ type: 'inlineBlock', fields: { blockType: 'cite', source: 4 } }] }] } }` → `{4}`.
  - Trường chữ `{ source: 'Ảnh của ông A' }` → tập rỗng. Chỉ đếm số nguyên và object có `id` là số.
  - Lồng sâu `{ 'lang-hoi': { founder: { paragraphs: [{ sentences: [{ sources: [11] }] }] } }` → `{11}`.
- [ ] **Step 2: Chạy `npx vitest run tests/unit/hooks/source-refs.test.ts`.** Kỳ vọng: FAIL, chưa có module.
- [ ] **Step 3: Viết `citedSourceIds`.** Duyệt đệ quy object và mảng. Tại khoá `sources`, `pageSources`, `source`, `quoteSource`, nhận số nguyên hoặc `{ id: number }`. Trong node có `fields.blockType === 'cite'`, nhận `fields.source`.
- [ ] **Step 4: Chạy lại test unit.** Kỳ vọng: PASS.
- [ ] **Step 5: Viết test int `tests/int/source-delete.int.spec.ts`.** Dùng `getTestPayload`, `resetDb`, `makeUser('reviewer')`. Các trường hợp:
  - Nguồn được `timeline-events` đã đăng trích: `payload.delete({ collection: 'sources', id, user: reviewer, overrideAccess: false })` ném lỗi. Thông điệp chứa `'Không xoá được nguồn'` và tiêu đề mốc.
  - Nguồn chỉ có trong **bản nháp** của một story (bản đăng không có): vẫn ném lỗi.
  - Nguồn nằm trong khối `cite` của `people.story`: ném lỗi.
  - Nguồn trong `products.annotations.source`: ném lỗi.
  - Nguồn trong global `page-intros` (`lang-hoi.facts[0].sources`): ném lỗi.
  - Nguồn không ai trích: xoá được.
  - `resetDb(payload)` chạy được khi còn nguồn được trích, và sau đó `sources` rỗng.
- [ ] **Step 6: Chạy `npm run test:int -- tests/int/source-delete.int.spec.ts`.** Kỳ vọng: FAIL ở các ca chặn.
- [ ] **Step 7: Viết `findSourceRefs` và `blockCitedSourceDelete`.**
  - Với mỗi collection `timeline-events`, `stories`, `products`, `people` (và `pages` khi Task 3 có), đọc mọi tài liệu hai lần: `draft: false` và `draft: true`, `depth: 0`, `overrideAccess: true`, `pagination: false`. Gặp tài liệu có `citedSourceIds` chứa `sourceId` thì thêm một `SourceRef`, nhãn là `title`, `name` hoặc `label` của tài liệu.
  - Với global `page-intros`, đọc cả `draft: false` lẫn `draft: true`.
  - Hook bỏ qua khi `req.context?.skipSourceRefGuard === true`. Nếu có ref, ném `APIError` (status 400) với thông điệp `Không xoá được nguồn "<sourceId>" vì đang được trích ở: <danh sách "Nhãn collection: tên mục", cách nhau bằng "; ">.`
  - Gắn hook vào `hooks.beforeDelete` của `Sources`.
  - Thêm `skipSourceRefGuard: true` vào `context` của `resetDb` và `wipe`.
- [ ] **Step 8: Chạy test int của task và `npm run test:int` toàn bộ.** Kỳ vọng: PASS. Mọi file int khác vẫn qua, vì `resetDb` đã có cờ.
- [ ] **Step 9: Commit**
  ```bash
  git add src/hooks/sourceRefs.ts src/collections/Sources.ts tests/int/helpers.ts src/seed/guide.ts tests/unit/hooks/source-refs.test.ts tests/int/source-delete.int.spec.ts
  git commit -m "feat(sources): chặn xoá nguồn đang được trích"
  ```

### Task 2: Tách khoá trang, tiền tố `dbName`, danh sách ô ảnh mới

Chỉ đổi cấu trúc code. Global `page-intros` phải sinh **đúng schema cũ**: `npm run migrate:create` không được tạo migration nào.

**Files:**
- Create: `src/collections/pages/routeKeys.ts`
- Modify: `src/globals/PageIntros.ts`, `src/globals/pageFacts.ts`, `src/globals/pageMedia.ts`, `src/lib/content/queries.ts:5`
- Test: `tests/unit/admin/page-facts-fields.test.ts`

**Interfaces:**
- Produces:
  - `ROUTE_KEYS`, `type RouteKey`, `ROUTE_LABELS`, cùng giá trị như hiện nay.
  - `ROUTE_PATHS: Record<RouteKey, string>`: `home: '/'`, `'lang-hoi': '/lang-hoi'`, `'cau-chuyen': '/cau-chuyen'`, `'nghe-det-chieu': '/nghe-det-chieu'`, `'con-nguoi': '/con-nguoi'`, `'san-pham': '/san-pham'`, `'thu-vien': '/thu-vien'`, `'ket-noi': '/ket-noi'`.
  - `type FactsFieldOpts = { dbPrefix?: string; toolImage?: boolean }`.
  - `villageFactsFields(opts?: FactsFieldOpts): Field[]` và `craftFactsFields(opts?: FactsFieldOpts): Field[]`.
    - Mặc định (`dbPrefix: ''`, `toolImage: false`) cho ra đúng config hiện nay.
    - `dbPrefix: 'pg_'` cho `dbName` là `pg_lh_founder_paras`, `pg_lh_founder_sents`, `pg_lh_heritage_sents`, `pg_ndc_compare`.
    - `toolImage: true` thêm `{ name: 'image', type: 'upload', relationTo: 'archive-assets', label: 'Ảnh' }` vào mỗi dòng `tools`, và đổi mô tả mảng `tools` thành `'Ảnh nằm ngay trong từng dòng.'`
  - `PAGES_MEDIA_SLOTS`: giống `PAGE_MEDIA_SLOTS` nhưng `'nghe-det-chieu'` bỏ `'tool-1'`, `'tool-2'`, `'tool-3'`. `PAGE_MEDIA_SLOTS` giữ nguyên.

- [ ] **Step 1: Viết test.** Thêm vào `page-facts-fields.test.ts`:
  - `villageFactsFields()` có `dbName` `lh_founder_paras` và `lh_founder_sents`.
  - `villageFactsFields({ dbPrefix: 'pg_' })` có `pg_lh_founder_paras`.
  - `craftFactsFields({ toolImage: true })`: dòng `tools` có trường `image` upload tới `archive-assets`.
  - `craftFactsFields()` không có trường đó.
  - `PAGES_MEDIA_SLOTS['nghe-det-chieu']` không chứa `'tool-1'`; `PAGE_MEDIA_SLOTS['nghe-det-chieu']` vẫn chứa.
  - `ROUTE_PATHS['lang-hoi'] === '/lang-hoi'`.
- [ ] **Step 2: Chạy `npx vitest run tests/unit/admin/page-facts-fields.test.ts`.** Kỳ vọng: FAIL.
- [ ] **Step 3: Viết code.**
  - Chuyển `ROUTE_KEYS`, `RouteKey`, `ROUTE_LABELS` sang `routeKeys.ts`.
  - `PageIntros.ts` import lại từ đó và re-export `RouteKey`. `queries.ts` import `RouteKey` từ `@/collections/pages/routeKeys`.
  - Thêm `opts` vào hai hàm tạo trường và thêm `PAGES_MEDIA_SLOTS`.
- [ ] **Step 4: Chạy test unit.** Rồi chạy `npm run migrate:create kiem_tra_khong_doi` trên DB dev đã migrate. Kỳ vọng: Payload báo không có thay đổi schema. Nếu có file migration sinh ra thì xoá nó và sửa cho tới khi không đổi.
- [ ] **Step 5: Commit**
  ```bash
  git add src/collections/pages/routeKeys.ts src/globals/PageIntros.ts src/globals/pageFacts.ts src/globals/pageMedia.ts src/lib/content/queries.ts tests/unit/admin/page-facts-fields.test.ts
  git commit -m "refactor(pages): tách khoá trang, tiền tố dbName cho trường dữ kiện"
  ```

### Task 3: Collection `pages` (ẩn, chỉ đọc) và migration

**Files:**
- Create: `src/collections/pages/fields.ts`, `src/collections/pages/stripForeign.ts`, `src/collections/Pages.ts`, `src/migrations/<ngày>_pages.ts` (sinh bằng `migrate:create pages`)
- Modify: `src/payload.config.ts:39` (thêm `Pages` vào `collections`), `src/lib/routes.ts` (thêm `'pages'`), `src/hooks/sourceRefs.ts` (quét thêm `pages`)
- Test: `tests/unit/pages/strip-foreign.test.ts`, `tests/unit/routes.test.ts`, `tests/int/pages-collection.int.spec.ts`

**Interfaces:**
- Consumes: Task 2 (`ROUTE_KEYS`, `ROUTE_LABELS`, `ROUTE_PATHS`, `FactsFieldOpts`, `PAGES_MEDIA_SLOTS`).
- Produces:
  - `PAGE_ONLY_FIELDS: Record<RouteKey, readonly string[]>`:
    - `home`: `['heroTitle', 'heroImage', 'heroInset', 'heroCaption', 'villageImages']`
    - `lang-hoi`: `['media', 'facts', 'founder', 'location', 'heritage', 'pageSources']`
    - `nghe-det-chieu`: `['media', 'tools', 'hand', 'machine', 'compareRows', 'pageSources']`
    - `cau-chuyen`, `con-nguoi`, `san-pham`: `['media']`
    - `thu-vien`, `ket-noi`: `[]`
  - `ALL_PAGE_ONLY_FIELDS`: hợp của tất cả các mảng trên.
  - `stripForeignFields(slug: RouteKey, data: Record<string, unknown>): Record<string, unknown>`: trả bản sao, mọi khoá thuộc `ALL_PAGE_ONLY_FIELDS` mà không thuộc `PAGE_ONLY_FIELDS[slug]` bị đặt thành `null` (mảng thì `[]`).
  - `export const PAGES_LIVE = false` trong `Pages.ts`. Task 8 đổi thành `true`.
  - Collection slug `'pages'`, trường `slug` kiểu select.
  - `previewPathFor('pages', doc)` trả `ROUTE_PATHS[doc.slug]`, hoặc `null` khi `slug` lạ.

Config `Pages` (`src/collections/Pages.ts`):
- Nhãn: `{ singular: 'Trang', plural: 'Các trang' }`. `admin.group`: `ADMIN_GROUPS.pages`. `admin.useAsTitle: 'slug'`, để danh sách hiện nhãn trang ("Làng Hới"…) qua nhãn của select. Không dùng `title`, vì tiêu đề có ngắt dòng. `admin.defaultColumns: ['slug', '_status', 'workflow', 'updatedAt']`.
- `admin.hidden: !PAGES_LIVE`. `admin.preview: previewFor('pages')`.
- `access`: `read: isLoggedIn`, `create: () => false`, `delete: () => false`, `update: PAGES_LIVE ? isLoggedIn : () => false`.
- `versions: { drafts: true }`.
- `hooks`:
  - `beforeOperation: [recordDraftArg]`
  - `beforeChange: [guardPublish, syncWorkflow, stripForeignHook]`; `stripForeignHook` gọi `stripForeignFields(data.slug ?? originalDoc.slug, data)`.
  - `afterChange: [revalidateAfterChange]`
- `fields`:
  - `slug`: `{ type: 'select', options: ROUTE_KEYS kèm nhãn ROUTE_LABELS, required: true, unique: true, admin: { readOnly: true, position: 'sidebar' } }`
  - `workflowField()`
  - `eyebrow`, `title`, `lead`, đúng như `routeGroup`.
  - Các trường của `home`.
  - `media`: dùng `PAGES_MEDIA_SLOTS`. Ô ảnh được chọn và hàm `validate` theo `siblingData.slug`: chỉ nhận ô thuộc trang, mỗi ô một lần. Lỗi: `'Ô ảnh không thuộc trang này.'` và `'Mỗi ô ảnh chỉ được dùng một lần.'`.
  - `villageFactsFields({ dbPrefix: 'pg_' })`, `craftFactsFields({ dbPrefix: 'pg_', toolImage: true })`.
  - Mỗi trường riêng có `admin.condition: (data) => PAGE_ONLY_FIELDS[data.slug]?.includes(<tên>)`.

- [ ] **Step 1: Viết test unit `strip-foreign.test.ts`.**
  - `stripForeignFields('home', { title: 'x', facts: [{ term: 'a' }], heroTitle: 'h' })` → `facts` là `[]`, `heroTitle` vẫn là `'h'`, `title` vẫn là `'x'`.
  - `stripForeignFields('lang-hoi', { tools: [{}], facts: [{}] })` → `tools` là `[]`, `facts` giữ nguyên.
  - Thêm vào `routes.test.ts`: `previewPathFor('pages', { slug: 'lang-hoi' }) === '/lang-hoi'`, và `previewPathFor('pages', { slug: 'x' }) === null`.
- [ ] **Step 2: Chạy hai file test unit.** Kỳ vọng: FAIL.
- [ ] **Step 3: Viết `fields.ts`, `stripForeign.ts`, `Pages.ts`, sửa `routes.ts`, thêm vào config.** Thêm `pages` vào danh sách collection mà `findSourceRefs` quét.
- [ ] **Step 4: Chạy `npm run migrate:create pages`.** Mở file migration và kiểm:
  - Chỉ có `CREATE TABLE`, `CREATE TYPE`, `CREATE INDEX`, `ADD CONSTRAINT` cho bảng mới. Không có `DROP` hay `ALTER` trên bảng cũ.
  - Không tên nào dài quá 63 ký tự.
- [ ] **Step 5: Viết test int `pages-collection.int.spec.ts`.** Tạo trang bằng `payload.create({ collection: 'pages', overrideAccess: true, ... })`. Các trường hợp:
  - `create` với `user: reviewer, overrideAccess: false` ném lỗi `Forbidden`.
  - Tạo trang thứ hai cùng `slug: 'home'` (overrideAccess) ném lỗi trùng.
  - `delete` với `user: reviewer, overrideAccess: false` ném lỗi.
  - Khi `PAGES_LIVE === false`: `update` với `user: editor, overrideAccess: false` ném lỗi.
  - `update` trang `home` (overrideAccess) với `facts: [{ term: 'Diện tích', detail: '...' }]`, rồi `findByID` → `facts` rỗng.
  - `update` trang `san-pham` với `media: [{ slot: 'hero' }]` ném lỗi validate `'Ô ảnh không thuộc trang này.'` khi `_status: 'published'`.
  - Lưu nháp trang `lang-hoi` rồi đăng trang `nghe-det-chieu`: `find({ collection: 'pages', draft: false, where: { slug: { equals: 'lang-hoi' } } })` vẫn là bản đăng cũ.
- [ ] **Step 6: Chạy `npm run test:int -- tests/int/pages-collection.int.spec.ts` và test unit.** Kỳ vọng: PASS.
- [ ] **Step 7: Chạy `npm run build`.** Kỳ vọng: build qua. Admin không hiện "Trang" trong menu.
- [ ] **Step 8: Commit**
  ```bash
  git add src/collections/Pages.ts src/collections/pages src/migrations src/payload.config.ts src/payload-types.ts src/lib/routes.ts src/hooks/sourceRefs.ts tests/unit/pages tests/unit/routes.test.ts tests/int/pages-collection.int.spec.ts
  git commit -m "feat(pages): collection Trang (ẩn, chỉ đọc) cạnh global cũ"
  ```

### Task 4: Kiểm nguồn của trang khi đăng

**Files:**
- Create: `src/collections/pages/checkPageSources.ts`
- Modify: `src/collections/pages/fields.ts` (thêm `validate` cho `pageSources` của `pages`)
- Test: `tests/unit/pages/check-page-sources.test.ts`, `tests/int/pages-collection.int.spec.ts`

**Interfaces:**
- Produces:
  - `type MissingSource = { where: string; sourceIds: number[] }`
  - `missingPageSources(page: Record<string, unknown>): MissingSource[]`: hàm thuần. Duyệt `facts`, `founder.paragraphs[].sentences`, `founder.conflict`, `location`, `heritage.sentences`, `tools[].note`, `hand.text`, `hand.note`, `machine.text`, `machine.note`, `compareRows`. Lấy `sources` của từng mục (số hoặc `{id}`) và so với `pageSources`.
  - Nhãn `where` theo mẫu: `'Bảng thông tin đầu trang, dòng "<term>"'`, `'Tổ nghề, đoạn <n>, câu <m>'`, `'Hộp Các nguồn chưa thống nhất, câu <n>'`, `'Vị trí'`, `'Di sản hôm nay, câu <n>'`, `'Dụng cụ "<name>"'`, `'Thẻ Dệt thủ công'`, `'Thẻ Dệt bằng máy'`, `'Bảng so sánh, hàng "<aspect>"'`. Số đếm từ 1.
  - Cờ `req.context.skipPageSourcesCheck`: dùng ở Task 5.

- [ ] **Step 1: Viết test unit.**
  - Trang có `pageSources: [1, 2]` và `facts: [{ term: 'Diện tích', sources: [1, 3] }]` → `[{ where: 'Bảng thông tin đầu trang, dòng "Diện tích"', sourceIds: [3] }]`.
  - Mọi nguồn đều có trong danh sách → `[]`.
  - `founder.paragraphs[1].sentences[0].sources: [{ id: 4 }]`, `pageSources: []` → `where` là `'Tổ nghề, đoạn 2, câu 1'`.
  - Trang không có ô dữ kiện nào → `[]`.
- [ ] **Step 2: Chạy test unit.** Kỳ vọng: FAIL.
- [ ] **Step 3: Viết code.**
  - Viết `missingPageSources`.
  - `validate` của `pageSources` trong `pages` nhận `{ data, req }`:
    - Trả `true` nếu `req.context?.skipPageSourcesCheck`.
    - Ngược lại, nếu có mục thiếu thì trả chuỗi `Chưa có trong Nguồn tham khảo của trang: <where> (<sourceId của từng nguồn, đọc từ DB>)`, các mục cách nhau bằng `"; "`.
  - Payload bỏ qua `validate` khi lưu nháp, nên chỉ chặn lúc đăng.
- [ ] **Step 4: Thêm ca test int vào `pages-collection.int.spec.ts`.**
  - Trang `lang-hoi` có câu trích nguồn ngoài `pageSources`: `update` với `_status: 'published'` ném lỗi chứa `'Chưa có trong Nguồn tham khảo của trang'`.
  - Cùng dữ liệu, `draft: true`: lưu được.
  - Có `context: { skipPageSourcesCheck: true }`: đăng được.
- [ ] **Step 5: Chạy test unit và int của task.** Kỳ vọng: PASS.
- [ ] **Step 6: Commit**
  ```bash
  git add src/collections/pages tests/unit/pages tests/int/pages-collection.int.spec.ts
  git commit -m "feat(pages): kiểm nguồn của trang khi đăng"
  ```

### Task 5: Lệnh `migrate:pages`

**Files:**
- Create: `src/seed/migratePages.ts`, `src/scripts/migrate-pages.ts`
- Modify: `package.json` (thêm `"migrate:pages": "cross-env NODE_OPTIONS=--no-deprecation payload run src/scripts/migrate-pages.ts"`)
- Test: `tests/unit/seed/migrate-pages.test.ts`, `tests/int/migrate-pages.int.spec.ts`

**Interfaces:**
- Consumes: Task 2, Task 3 (`PAGES_MEDIA_SLOTS`, collection `pages`), Task 4 (`missingPageSources`, cờ `skipPageSourcesCheck`).
- Produces:
  - `pageFromGlobal(group: Record<string, unknown> | undefined, slug: RouteKey): Record<string, unknown>`: hàm thuần.
    - Chép đúng các trường chung và `PAGE_ONLY_FIELDS[slug]`.
    - Bỏ `id` của các dòng mảng, để Payload tạo mới.
    - Với `nghe-det-chieu`: ảnh của dòng `media` có `slot` là `tool-<n>` chuyển vào `tools[n-1].image`, và dòng `tool-n` bị bỏ khỏi `media`.
    - Giá trị quan hệ (`sources`, `pageSources`, ảnh) đưa về id số.
  - `samePageContent(a: Record<string, unknown>, b: Record<string, unknown>): boolean`: so sâu, bỏ qua khoá `id`, `createdAt`, `updatedAt`, `_status`, `workflow`, `slug`.
  - `type MigrateReport = { pages: { slug: RouteKey; action: 'created-published' | 'created-published+draft' | 'created-draft' | 'skipped'; rows: number; citations: number }[]; sourceIssues: { slug: RouteKey; missing: MissingSource[] }[] }`
  - `migratePages(payload: Payload, opts?: { replace?: boolean }): Promise<MigrateReport>`
  - `type PageDiff = { slug: RouteKey; state: 'published' | 'draft'; reason: 'missing' | 'different' }`
  - `checkPages(payload: Payload): Promise<PageDiff[]>`

Luật của `migratePages` (theo spec 6.6). Đọc global hai lần: `published = findGlobal({ draft: false, depth: 0 })`, `latest = findGlobal({ draft: true, depth: 0 })`. Với mỗi `slug` trong `ROUTE_KEYS`:
1. Trang đã có và không có `replace`: `skipped`. Có `replace`: xoá trang đó (overrideAccess) rồi làm tiếp.
2. Nếu `published._status === 'published'`:
   - Tạo trang từ `pageFromGlobal(published[slug], slug)` với `_status: 'published'`, `workflow: 'published'`.
   - Nếu `!samePageContent(pageFromGlobal(latest[slug]), pageFromGlobal(published[slug]))` thì `update` với `draft: true` bằng dữ liệu của `latest`, và `action` là `created-published+draft`.
3. Nếu global chưa từng đăng: tạo trang với `draft: true` từ `latest`, `action` là `created-draft`.
4. Mọi lần ghi dùng `overrideAccess: true` và `context: { skipPageSourcesCheck: true, disableRevalidate: true }`.
5. `sourceIssues` lấy `missingPageSources` của dữ liệu đã chép.

`checkPages` so `pageFromGlobal(published[slug])` với bản đăng của trang, và `pageFromGlobal(latest[slug])` với bản nháp mới nhất của trang.

CLI `src/scripts/migrate-pages.ts`, cùng kiểu với `src/scripts/import-content.ts`:
- `--check`: in từng `PageDiff` theo dạng `<slug> (<state>): <thiếu|khác>`, hoặc `Không có khác biệt.`. Có khác biệt thì `process.exit(1)`.
- `--replace` truyền vào `migratePages`.
- Không có cờ: in báo cáo, mỗi trang một dòng `<nhãn trang>: <hành động tiếng Việt>, <rows> dòng, <citations> chú thích`, rồi in `sourceIssues` dưới tiêu đề `Câu trích nguồn chưa có trong Nguồn tham khảo của trang (cần sửa trong admin):`.

- [ ] **Step 1: Viết test unit cho `pageFromGlobal` và `samePageContent`.**
  - `pageFromGlobal({ media: [{ id: 'a', slot: 'tool-2', image: 8 }, { slot: 'hero', image: 3 }], tools: [{ name: 'Khung' }, { name: 'Go' }] }, 'nghe-det-chieu')` → `tools[1].image === 8`, `media` chỉ còn ô `hero`, không dòng nào có `id`.
  - `pageFromGlobal({ facts: [{ term: 'x' }], heroTitle: 'h' }, 'home')` → có `heroTitle`, không có khoá `facts`.
  - `samePageContent` bằng nhau khi chỉ khác `id` của dòng.
  - `samePageContent` khác nhau khi một `detail` khác.
- [ ] **Step 2: Chạy test unit.** Kỳ vọng: FAIL.
- [ ] **Step 3: Viết `pageFromGlobal` và `samePageContent`.** Chạy test unit, kỳ vọng PASS.
- [ ] **Step 4: Viết test int `migrate-pages.int.spec.ts`.**
  - Global đã đăng, rồi lưu nháp đổi `lang-hoi.lead`: `migratePages` → `lang-hoi` là `created-published+draft`, 7 trang còn lại là `created-published`. Bản đăng của `lang-hoi` giữ `lead` cũ, bản nháp có `lead` mới.
  - Global chưa từng đăng (chỉ có nháp): 8 trang `created-draft`. `find({ draft: false, where: { _status: { equals: 'published' } } })` rỗng.
  - Chạy hai lần: lần hai 8 trang `skipped`, và `checkPages` trả `[]`.
  - Dữ liệu `lang-hoi` có câu trích nguồn ngoài `pageSources`: trang vẫn đăng, và `sourceIssues` có mục đó.
  - Global `nghe-det-chieu.media` có ô `tool-1` với ảnh: trang mới có `tools[0].image` là ảnh đó.
  - Sửa global sau khi chép: `checkPages` báo `lang-hoi` `different`. `migratePages({ replace: true })` rồi `checkPages` trả `[]`.
- [ ] **Step 5: Viết `migratePages`, `checkPages` và CLI.**
- [ ] **Step 6: Chạy test int của task.** Rồi chạy thử trên DB dev: `npm run migrate:pages`, sau đó `npm run migrate:pages -- --check`. Kỳ vọng: báo cáo 8 trang, rồi `Không có khác biệt.`
- [ ] **Step 7: Kiểm đợt 1 toàn bộ:** `npm run lint && npx tsc --noEmit && npm run build && npm run test:unit && npm run test:int && npm run test:e2e`. Kỳ vọng: tất cả qua, e2e không sửa kỳ vọng nào.
- [ ] **Step 8: Commit**
  ```bash
  git add src/seed/migratePages.ts src/scripts/migrate-pages.ts package.json tests/unit/seed/migrate-pages.test.ts tests/int/migrate-pages.int.spec.ts
  git commit -m "feat(pages): lệnh migrate:pages chép Phần mở đầu trang sang Trang"
  ```
- [ ] **Step 9: Dừng, báo người dùng.**
  - Đưa đoạn hướng dẫn "Chuyển Phần mở đầu trang sang Trang, đợt 1" để họ tự ghi vào `docs/DEPLOY.md`. Đoạn này gồm: push, chờ deploy, chạy `bash -c 'set -a; . ./.env.prod.local; set +a; npm run migrate:pages'`, đọc báo cáo, chạy `--check`, và quy tắc ngừng sửa.
  - Nhắc người dùng tạo bản sao DB prod trên Neon trước khi push, vì đợt 1 có migration.
  - Hỏi người dùng có push đợt 1 không. Code của đợt 2a làm tiếp được trên nhánh, nhưng không push trước khi họ báo đợt 1 đã chạy xong trên prod.

## Đợt 2a

### Task 6: `lib/content` đọc `pages`

**Files:**
- Modify: `src/lib/content/queries.ts:70-77, 532-575`, `src/lib/content/pages.ts:24-90`, `src/lib/content/pageFacts.ts:127-145`
- Test: `tests/int/pages.int.spec.ts`, `tests/int/page-intros.int.spec.ts`, `tests/int/home-media.int.spec.ts`, `tests/int/content.int.spec.ts`, `tests/unit/...` (các test của `craftFactsFrom`)

**Interfaces:**
- Consumes: Task 3 (collection `pages`, `PAGES_MEDIA_SLOTS`).
- Produces:
  - `readPageDoc(payload: Payload, slug: RouteKey, mode: Mode, depth?: number): Promise<Record<string, unknown>>`, trong `queries.ts`. Trả `{}` khi không có trang. Ở `public`, chỉ đọc bản đã đăng và trả `{}` khi chưa đăng, giống `readGlobalDoc`.
  - `readGlobalDoc` chỉ còn nhận `'site-settings' | 'page-intros'`. `'page-intros'` bị bỏ ở Task 10.
  - `getPageIntro`, `getHomeMedia`, `getPageMedia` (dùng `PAGES_MEDIA_SLOTS`), `getVillagePage`, `getCraftPage` đọc qua `readPageDoc`.
  - `craftFactsFrom(page)` đọc ảnh dụng cụ ở `tools[i].image`. `craftToolCards` nhận ảnh từ dòng, không còn nhận hàm `(n) => media['tool-n']`.
  - View model (`*View`) không đổi.

- [ ] **Step 1: Sửa test int theo nguồn dữ liệu mới.** Các test đang tạo dữ liệu bằng `updateGlobal({ slug: 'page-intros' })` chuyển sang tạo hoặc sửa tài liệu `pages`, chỉ đổi cách tạo dữ liệu, giữ nguyên kỳ vọng về view model. Thêm hai test vào `pages.int.spec.ts`:
  - Trang `nghe-det-chieu` có `tools[0] = { name: 'Khung dệt', image: A }`, `tools[1] = { name: 'Go', image: B }`. Đăng, rồi đảo thứ tự hai dòng và đăng lại. `getCraftPage('public').tools` cho thấy `Khung dệt` vẫn có ảnh A.
  - `lang-hoi` có nháp chưa đăng, `nghe-det-chieu` vừa đăng: `getVillagePage('public')` vẫn trả bản đăng cũ của `lang-hoi`.
- [ ] **Step 2: Chạy `npm run test:int -- tests/int/pages.int.spec.ts`.** Kỳ vọng: FAIL.
- [ ] **Step 3: Viết `readPageDoc` và đổi các hàm đọc.**
- [ ] **Step 4: Chạy các file int của task và `npm run test:unit`.** Kỳ vọng: PASS.
- [ ] **Step 5: Commit**
  ```bash
  git add src/lib/content tests/int tests/unit
  git commit -m "feat(content): đọc phần mở đầu và dữ kiện trang từ collection Trang"
  ```

### Task 7: Seed và lệnh nhập liệu ghi vào `pages`

**Files:**
- Modify: `src/seed/index.ts:230-250`, `src/seed/importContent.ts:60-80`, `src/seed/pageFacts.ts:105-210`, `src/seed/guide.ts`, `src/scripts/import-content.ts`, `src/scripts/import-page-facts.ts`
- Create: `ensurePages(payload: Payload): Promise<RouteKey[]>` trong `src/seed/pageFacts.ts`. Tạo trang còn thiếu (overrideAccess, dạng nháp, chỉ có `slug`) và trả các `slug` vừa tạo.
- Test: `tests/int/import-content.int.spec.ts`, `tests/int/seed.int.spec.ts`, `tests/unit/scripts/import-content.test.ts`

**Interfaces:**
- Consumes: Task 3, Task 6.
- Produces:
  - `hasPendingDraft(payload, target: { collection: 'pages'; slug: RouteKey } | { global: 'site-settings' }): Promise<boolean>`
  - `importPageFacts` và `importContent` ghi từng trang bằng `payload.update({ collection: 'pages', where: { slug }, draft: true })`. Báo cáo theo trang: dòng `Phần mở đầu trang:` thành từng dòng `Trang <nhãn>: đã điền <các nhóm> và lưu bản nháp`.

- [ ] **Step 1: Sửa kỳ vọng các test int nhập liệu.**
  - Sau `importContent`: có 8 trang, đều là nháp, có đúng các nhóm như trước.
  - Chạy lại thì không đổi gì.
  - Trang có nháp chờ thì in cảnh báo như `pendingDraftWarning` hiện nay.
- [ ] **Step 2: Chạy test.** Kỳ vọng: FAIL.
- [ ] **Step 3: Đổi các lệnh ghi.** `seed` và `guide:seed` gọi `ensurePages` sau khi xoá DB.
- [ ] **Step 4: Chạy `npm run test:int`.** Rồi chạy riêng, không song song với `test:int`: `npm run guide:seed`. Kỳ vọng: PASS, và `guide:seed` chạy xong không lỗi.
- [ ] **Step 5: Commit**
  ```bash
  git add src/seed src/scripts tests/int tests/unit
  git commit -m "feat(seed): seed và import:content ghi vào collection Trang"
  ```

### Task 8: Mở `pages` trong admin, gỡ global cũ khỏi code (không migration)

Sau task này không còn code nào đọc bảng `page_intros*` lúc chạy. Bảng vẫn nằm trong DB, và **không tạo migration** ở đợt 2a.

**Files:**
- Modify:
  - `src/collections/Pages.ts` (`PAGES_LIVE = true`)
  - `src/payload.config.ts:40` (bỏ `PageIntros`)
  - `src/globals/pageMedia.ts` (bỏ `PAGE_MEDIA_SLOTS`, giữ `PAGES_MEDIA_SLOTS`)
  - `src/globals/pageFacts.ts` (bỏ giá trị mặc định cũ nếu không còn chỗ gọi)
  - `src/lib/content/queries.ts` (`readGlobalDoc` chỉ nhận `'site-settings'`)
  - `src/lib/routes.ts` (bỏ `'page-intros'`)
  - `src/hooks/sourceRefs.ts` (bỏ quét global)
  - `src/seed/pageFacts.ts` (`hasPendingDraft` bỏ nhánh global `page-intros`)
- Delete: `src/globals/PageIntros.ts`, `src/seed/migratePages.ts`, `src/scripts/migrate-pages.ts`, `tests/unit/seed/migrate-pages.test.ts`, `tests/int/migrate-pages.int.spec.ts`, script `migrate:pages` trong `package.json`
- Test: `tests/int/pages-collection.int.spec.ts`, `tests/int/source-delete.int.spec.ts`, `tests/int/globals.int.spec.ts`, `tests/unit/admin-config.test.ts`

**Interfaces:**
- Consumes: Task 3, Task 6, Task 7.

- [ ] **Step 1: Sửa test.**
  - Ca "editor không sửa được `pages`" đổi thành "editor lưu nháp được, không đăng được". Đây là luật của `guardPublish`.
  - `admin-config.test.ts`: config không có global `page-intros`, và menu có "Trang".
  - `source-delete.int.spec.ts`: bỏ ca global, thêm ca nguồn trích trong `pages`.
  - Bỏ các ca global trong `globals.int.spec.ts`.
- [ ] **Step 2: Chạy test.** Kỳ vọng: FAIL.
- [ ] **Step 3: Đổi cờ, xoá code, sửa chỗ gọi.** Chạy `npx tsc --noEmit`, rồi chạy `grep -rn "page-intros\|PageIntros\|PAGE_MEDIA_SLOTS\b" src tests`. Kỳ vọng: chỉ còn kết quả trong `src/migrations`.
- [ ] **Step 4: Kiểm không có migration mới.** Chạy `git status src/migrations`. Kỳ vọng: không có file mới.
  - **Không chạy `migrate:create` ở đợt này.** Nếu chạy, nó sẽ sinh lệnh xoá bảng, và lệnh đó thuộc đợt 2b.
  - Dev DB dùng `push` có thể tự xoá bảng cũ ở máy. Như vậy không sao.
- [ ] **Step 5: Chạy test của task và `npm run test:int`.** Kỳ vọng: PASS.
- [ ] **Step 6: Commit**
  ```bash
  git add -A src tests package.json
  git commit -m "feat(pages): mở Trang trong admin, gỡ Phần mở đầu trang khỏi code"
  ```

### Task 9: Hướng dẫn admin, kiểm và diễn tập các cặp code–DB

**Files:**
- Modify: `src/admin/guide/sections.ts:95-110`, `src/admin/guide/shots.ts`, `tests/e2e/admin-guide-shots.e2e.spec.ts`, `tests/e2e/admin-ui.e2e.spec.ts`, `public/admin-guide/*` (ảnh chụp lại)

**Nội dung lời hướng dẫn:**
- Đổi "Mở menu bên trái, bấm **Phần mở đầu trang**." thành "Mở menu bên trái, bấm **Trang**, rồi bấm tên trang cần sửa."
- Mục người duyệt thêm hai ý:
  - "Đăng trang nào chỉ đổi trang đó."
  - "Không xoá được một nguồn khi nó còn đang được trích; hộp báo lỗi liệt kê nơi đang trích. Khôi phục một phiên bản cũ của mục thì xem lại chú thích."

- [ ] **Step 1: Sửa lời hướng dẫn và cách chụp.** Đường dẫn admin đổi thành `/admin/collections/pages/<id>`, thay cho `/admin/globals/page-intros`.
- [ ] **Step 2: Chụp lại ảnh.** Chạy `npm run guide:seed && npm run guide:shots`. Kỳ vọng: `labels.json` được ghi lại, sau đó `npm run test:unit` qua.
- [ ] **Step 3: Kiểm toàn bộ:** `npm run lint && npx tsc --noEmit && npm run build && npm run test:unit && npm run test:int && npm run test:e2e`. Kỳ vọng:
  - Tất cả qua.
  - E2e trang công khai không sửa kỳ vọng nào.
  - E2e admin chỉ đổi phần liên quan tới "Trang".
- [ ] **Step 4: Commit**
  ```bash
  git add src/admin public/admin-guide tests/e2e
  git commit -m "docs(admin): hướng dẫn mục Trang, chặn xoá nguồn"
  ```
- [ ] **Step 5: Tạo migration đợt 2b trên một nhánh tạm để diễn tập.** Chạy `npm run migrate:create drop_page_intros`. File này sẽ được commit ở Task 10. Kiểm:
  - Chỉ có `DROP TABLE` / `DROP TYPE` cho `page_intros*`, `_page_intros_v*`, `lh_*`, `_lh_*`, `ndc_*`, `_ndc_*` và enum của chúng.
  - Không đụng bảng nào có tiền tố `pages`, `_pages_v` hay `pg_`.
- [ ] **Step 6: Diễn tập trên `chieuhoi_staging`** theo mục 8 của `docs/DEPLOY.md`. Mỗi bước chạy `next start` bằng `APP_ENV=staging` ở cổng 3200, và chụp trang công khai bằng `screens.e2e.spec.ts` trỏ tới :3200. Ảnh không commit.
  1. Dựng DB bằng code `b47b45b` (main hiện tại): `migrate`, `seed`, đăng global, lưu thêm một bản nháp. Chụp bộ ảnh **gốc**.
  2. **Cặp lệch 1: code main + DB đợt 1.** Chạy `npm run migrate` bằng code commit cuối đợt 1, rồi build và chạy **code `b47b45b`**. Kỳ vọng: ảnh giống bộ gốc, và admin sửa, đăng được "Phần mở đầu trang".
  3. Code cuối đợt 1: chạy `migrate:pages` rồi `--check`. Kỳ vọng: `Không có khác biệt.`
  4. Code cuối đợt 2a (Task 9): build và chạy. Kỳ vọng: ảnh giống bộ gốc.
  5. **Cặp lệch 2: code đợt 2a + DB đợt 2b.** Chạy migration ở Step 5, giữ nguyên code 2a đang chạy. Kỳ vọng:
     - ảnh giống bộ gốc;
     - admin mở được danh sách "Trang" và một trang;
     - xoá một nguồn đang được trích thì bị chặn, xoá nguồn không ai trích thì được.
- [ ] **Step 7: Dừng, báo người dùng.**
  - Báo kết quả diễn tập.
  - Đưa đoạn hướng dẫn đợt 2a để họ tự ghi vào `docs/DEPLOY.md`: chạy `--check` trên prod bằng code đợt 1, push, rồi kiểm web.
  - Lưu ý cho họ: chỉ quay về đợt 1 ngay sau khi lên 2a, trước khi ai sửa "Trang".
  - Chỉ push đợt 2a khi người dùng báo đợt 1 đã chạy xong trên prod và đồng ý push.

## Đợt 2b

### Task 10: Migration xoá bảng cũ

**Files:**
- Create: `src/migrations/<ngày>_drop_page_intros.ts` và `.json` (file đã sinh và kiểm ở Task 9 Step 5)
- Modify: `src/migrations/index.ts`, `docs/superpowers/backlog.md`

- [ ] **Step 1: Đưa migration vào nhánh.** Mở lại file và kiểm như Task 9 Step 5.
- [ ] **Step 2: Kiểm toàn bộ:** `npm run lint && npx tsc --noEmit && npm run build && npm run test:unit && npm run test:int && npm run test:e2e`. Kỳ vọng: tất cả qua.
- [ ] **Step 3: Đếm bảng trên DB dev** sau `npm run migrate`, bằng câu `select count(*) from information_schema.tables where table_schema='public' and (table_name like '%pages%' or table_name like 'pg\_%' or table_name like '\_pg\_%')`. Kỳ vọng: khoảng 40. Ghi con số thật vào báo cáo.
- [ ] **Step 4: Ghi backlog** vào `docs/superpowers/backlog.md`, gồm các mục còn mở:
  - Dữ kiện năm sinh/mất trùng giữa dòng thời gian và tổ nghề.
  - Câu riêng cho điện thoại lẫn trong dữ liệu.
  - E2e `workflow` và `a11y-public` chạy song song trên cùng server nên có thể đụng nhau.
  - Các mục review còn mở của plan này.
- [ ] **Step 5: Commit**
  ```bash
  git add src/migrations docs/superpowers/backlog.md
  git commit -m "chore(db): xoá bảng Phần mở đầu trang cũ"
  ```
- [ ] **Step 6: Dừng, báo người dùng.**
  - Đưa đoạn hướng dẫn đợt 2b để họ tự ghi vào `docs/DEPLOY.md`: tạo bản sao DB prod trên Neon trước, push, rồi kiểm web.
  - Chỉ push khi đợt 2a đã chạy ổn trên prod và người dùng đồng ý.
