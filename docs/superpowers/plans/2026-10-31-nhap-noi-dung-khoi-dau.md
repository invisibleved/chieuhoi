# Lệnh nhập nội dung khởi đầu (`import:content`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một lệnh chạy được ở prod đưa toàn bộ nội dung chữ đã kiểm trong repo vào CMS dưới dạng bản nháp, không ảnh, không ghi đè.

**Architecture:** Tách phần "seed JSON → dữ liệu Payload" của `src/seed/index.ts` thành hàm thuần dùng chung (`src/seed/content.ts`), có tham số ảnh và trạng thái. `npm run seed` gọi chúng với ảnh tham khảo như cũ; hàm mới `importContent` (`src/seed/importContent.ts`) gọi chúng không ảnh, chỉ tạo bản ghi chưa có, lưu nháp, rồi điền trường trống của global `page-intros` (gộp với dữ kiện trang trong một lần lưu) và `site-settings`. Lệnh `src/scripts/import-content.ts` in báo cáo.

**Tech Stack:** Payload CMS 3.92 (Local API, drafts), Postgres, TypeScript strict, vitest.

**Spec:** `docs/superpowers/specs/2026-10-31-nhap-noi-dung-khoi-dau-design.md` (phần A).

## Global Constraints

- Lệnh nhập không bao giờ tạo/gắn `archive-assets`; mọi quan hệ ảnh (`image`, `images`, `cover`, block `figure`, `media`, `heroImage`, `heroInset`, `villageImages`) vắng mặt hoặc rỗng.
- Lệnh nhập không bao giờ đăng: collection tạo bằng `draft: true` và `workflow: 'draft'`; global lưu `draft: true`, `_status: 'draft'`.
- Chỉ tạo, không ghi đè: khoá tự nhiên `sources.sourceId`, `timeline-events.order`, `craft-steps.n`, `products.slug`, `stories.slug`. Global: chỉ điền trường đang trống, tính trên bản mới nhất (`findGlobal({ draft: true })`).
- `status` trong `content/seed/*.json` bị bỏ qua ở lệnh nhập; seed dev vẫn dùng như hiện nay.
- Không nhập: `peopleSamples`, bài `status: 'idea'`, `makers`, ảnh.
- Chạy mọi `APP_ENV`, không `assertSeedAllowed`, không `user` (`overrideAccess: true`).
- `npm run seed` ở dev cho kết quả không đổi (test `tests/int/seed.int.spec.ts` hiện có phải qua mà không sửa kỳ vọng).
- Không đổi schema, không migration.
- `docs/DEPLOY.md` sửa nhưng **không** `git add` (file có thay đổi riêng của người dùng).
- Copy tiếng Việt nguyên văn từ seed hiện có; không viết câu dữ kiện mới.
- `test:int` và `guide:seed` không chạy song song. Ảnh chụp không commit.

## Review Focus

1. Bản ghi admin đã sửa (vd. đổi tiêu đề mốc `order: 3`) rồi chạy lại lệnh → không bị ghi đè. (Task 2, test "không ghi đè bản ghi đã có")
2. Global đang có bản nháp chờ duyệt → lệnh điền trường trống vào chính bản nháp đó, báo `warning`, không tạo bản đăng. (Task 2, test "global có nháp chờ duyệt")
3. Người duyệt đăng một mục vừa nhập (bài Trạng Chiếu, có `body` validate) → đăng được, hiện ở truy vấn công khai. (Task 2, test "người duyệt đăng được")
4. Trường global admin đã điền (vd. `lang-hoi.title` khác seed) → giữ nguyên, các trường trống cạnh nó vẫn được điền. (Task 2, test "global chỉ điền trường trống")
5. Bài Trạng Chiếu không còn block `figure` nhưng còn đủ inline `cite`. (Task 1 unit + Task 2 int)

---

### Task 1: Hàm chuyển dữ liệu dùng chung, seed dev dùng lại

**Files:**
- Create: `src/seed/content.ts`
- Modify: `src/seed/index.ts` (các khối Dòng thời gian, Công đoạn, Sản phẩm, Bài viết: thay phần dựng `data` bằng hàm mới)
- Test: `tests/unit/seed/content.test.ts`

**Interfaces:**
- Produces (trong `src/seed/content.ts`):
  - `type SourceIdMap = Record<string, number>`
  - `type AssetFn = ((p: string | null | undefined) => number | null) | null` — `null` nghĩa là không gắn ảnh.
  - `readSeedJson<T>(file: string): T` — đọc `content/seed/<file>` theo `process.cwd()`.
  - `timelineDocs(sourceIds: SourceIdMap, workflow: 'draft' | 'published'): { key: number; data: Record<string, unknown> }[]` — 7 phần tử, `key` = `order`. Ném lỗi như hiện nay khi lệch số mốc với `timelineCopy`.
  - `craftStepDocs(asset: AssetFn, workflow: 'draft' | 'published'): { key: number; status?: SeedStatus; data: Record<string, unknown> }[]` — `key` = `n`. Khi `asset === null` thì không có khoá `image`.
  - `productDocs(sourceIds: SourceIdMap, asset: AssetFn, workflow: 'draft' | 'published'): { key: string; status?: SeedStatus; data: Record<string, unknown> }[]` — `key` = `slug`. Khi `asset === null` thì không có khoá `images`.
  - `stripFigureParagraphs(markdown: string): string` — bỏ mọi dòng chỉ chứa `[[figure:…]]` (cùng regex `FIGURE` của `citations.ts`).
  - `storyDocs(...)`: builder tự đặt tên/chữ ký; phải cho phép (a) seed dev: mọi bài, có ảnh bìa và figure như hiện nay; (b) lệnh nhập: chỉ bài không phải `idea`, không `cover`, thân bài đã `stripFigureParagraphs`, `workflow: 'draft'`. Thân bài cần `editorConfig` lấy từ `payload.collections.stories.config` như `index.ts` đang làm, nên hàm này được phép nhận `payload`.
  - `type SeedStatus = 'idea' | 'draft' | 'pending' | undefined` (chuyển từ `index.ts`).
  - Seed dev truyền `workflow` đúng như hiện nay: mốc và sản phẩm `'published'`, công đoạn `'draft'`.

- [ ] **Step 1: Viết test hỏng** `tests/unit/seed/content.test.ts`:
  - `timelineDocs(ids, 'draft')`: dài 7; `[2].data.title === 'Khung dệt về làng'`; `[2].data.confidence === 'oral'`; `[0].data.sources` đổi đúng id từ `ids`; mọi `data.workflow === 'draft'`.
  - `craftStepDocs(null, 'draft')`: dài 7; không phần tử nào có khoá `image`; `[0].data.shortTitle === 'Nguyên liệu'`; `shotNeeded`, `focusX` giữ nguyên từ JSON.
  - `craftStepDocs(() => 9, 'draft')`: phần tử có `image` trong JSON thì `data.image === 9`.
  - `productDocs(ids, null, 'draft')`: dài 7; không khoá `images`; `chieu-cap-dieu` có 3 annotations, nguồn annotation đổi sang id.
  - `stripFigureParagraphs`: input có dòng `[[figure:nkc14.webp|Đôi tay…]]` giữa hai đoạn → output không còn `[[figure:`, còn nguyên `[[cite:`, hai đoạn còn lại giữ nguyên.
- [ ] **Step 2:** `npx vitest run tests/unit/seed/content.test.ts` → FAIL (module không tồn tại).
- [ ] **Step 3:** Viết `src/seed/content.ts`; sửa `src/seed/index.ts` dùng các hàm này, giữ nguyên `upsert`, thứ tự tạo, trạng thái đăng và kết quả.
- [ ] **Step 4:** `npx vitest run tests/unit/seed/content.test.ts` → PASS; `npm run test:int -- tests/int/seed.int.spec.ts` → PASS không sửa test; `npx tsc --noEmit` sạch.
- [ ] **Step 5: Commit** `refactor(seed): tách hàm chuyển dữ liệu seed dùng chung`.

### Task 2: `importContent`

**Files:**
- Create: `src/seed/importContent.ts`
- Modify: `src/seed/pageFacts.ts` (tách phần tính dữ liệu điền của dữ kiện trang để dùng trong cùng một lần lưu; `hasPendingDraft` nhận `slug`)
- Test: `tests/int/import-content.int.spec.ts`

**Interfaces:**
- Consumes: Task 1 (`timelineDocs`, `craftStepDocs`, `productDocs`, hàm bài viết, `readSeedJson`).
- Produces:
  ```ts
  export type ContentReport = {
    sourcesCreated: string[]; sourcesSkipped: string[]
    created: { collection: 'timeline-events' | 'craft-steps' | 'products' | 'stories'; key: string }[]
    existing: { collection: 'timeline-events' | 'craft-steps' | 'products' | 'stories'; key: string }[]
    globals: { slug: 'page-intros' | 'site-settings'; filled: string[]; saved: 'draft' | 'none'; warning?: string }[]
  }
  export async function importContent(payload: Payload): Promise<ContentReport>
  ```
  - `filled` liệt kê đường dẫn trường đã điền, vd. `'lang-hoi.title'`, `'lang-hoi.facts'`, `'tagline'`.
  - `importPageFacts` giữ chữ ký và hành vi hiện tại (test hiện có phải qua). Nó dùng chung phần tính `fill` với `importContent`.
- Quy tắc:
  - Nguồn: tạo mọi id trong `content/seed/sources.json` còn thiếu (đã đăng sẵn vì collection không có nháp).
  - Collection: với mỗi phần tử, `find` theo khoá với `draft: true`; có thì đưa vào `existing`; không thì `create({ draft: true, data: { ...data, workflow: 'draft' } })`. Truyền `null` cho ảnh.
  - `page-intros`: với mỗi route trong `pageIntros` (`site.ts`) và mỗi trường `eyebrow`, `title`, `heroTitle`, `lead` có trong seed: điền nếu trường ở bản mới nhất trống (`isEmptyGroup`). Gộp với dữ kiện trang, một `updateGlobal({ draft: true })` duy nhất. Giữ nguyên các trường khác của route (ghi `{ ...existing, ...fill }`).
  - `site-settings`: điền trường trống trong `siteSettings`, một lần lưu nháp.
  - Global có bản nháp chờ duyệt (`hasPendingDraft(payload, slug)`) → vẫn lưu nháp và đặt `warning` (cùng lời trong `importPageFacts`, đổi tên global tương ứng: "Phần mở đầu trang" / "Thông tin site").
  - Không có gì để điền → `saved: 'none'`, không gọi `updateGlobal`.

- [ ] **Step 1: Viết test hỏng** `tests/int/import-content.int.spec.ts` (`resetDb` trước mỗi ca, theo `tests/int/page-intros.int.spec.ts`):
  - "DB trắng: tạo đủ, tất cả là nháp": `created` có 7 timeline, 7 craft-steps, 7 products, 1 stories (`chuyen-ve-trang-chieu`); `sourcesCreated.length === 5`; `payload.find({ collection, draft: false, where: { _status: { equals: 'published' } } })` trả 0 cho cả 4 collection; mọi doc `workflow === 'draft'`; `archive-assets` count 0; không doc nào có `image`/`images`/`cover` khác null/rỗng.
  - "bài Trạng Chiếu không có figure, còn cite": duyệt `body` → không node `blockType: 'figure'`, có ≥1 inline `cite`.
  - "chạy lần hai không tạo gì": lần hai `created` rỗng, `sourcesCreated` rỗng, mọi `globals[].saved === 'none'`.
  - "không ghi đè bản ghi đã có": sau lần 1, sửa mốc `order: 3` title thành `'Sửa tay'` (draft) → lần 2 → title vẫn `'Sửa tay'`, `existing` chứa `{ collection: 'timeline-events', key: '3' }`.
  - "global chỉ điền trường trống": trước khi nhập, `updateGlobal('page-intros', { 'lang-hoi': { title: 'Tiêu đề riêng' } })` (đăng) → nhập → bản nháp mới nhất: `lang-hoi.title === 'Tiêu đề riêng'`, `lang-hoi.lead` bằng seed, `lang-hoi.facts` có dữ liệu; bản `draft: false` vẫn `title === 'Tiêu đề riêng'` và không có `lead`.
  - "global có nháp chờ duyệt": tạo nháp `site-settings` với `tagline: 'Nháp'` → nhập → `tagline === 'Nháp'`, `description` bằng seed, `warning` có mặt cho `site-settings`.
  - "người duyệt đăng được": sau khi nhập, với `makeUser(payload, 'reviewer')`, đăng (`update` với `_status: 'published'`, `workflow: 'published'`) bài Trạng Chiếu, mốc `order: 1`, công đoạn `n: 1`, sản phẩm `chieu-cap-dieu`; `updateGlobal` đăng hai global → không lỗi; `find` không `draft` với `_status: 'published'` trả các doc đó.
- [ ] **Step 2:** `npm run test:int -- tests/int/import-content.int.spec.ts` → FAIL.
- [ ] **Step 3:** Viết `src/seed/importContent.ts`, chỉnh `src/seed/pageFacts.ts`.
- [ ] **Step 4:** `npm run test:int -- tests/int/import-content.int.spec.ts tests/int/page-intros.int.spec.ts tests/int/seed.int.spec.ts` → PASS.
- [ ] **Step 5: Commit** `feat(seed): importContent nhập nội dung khởi đầu dạng nháp`.

### Task 3: Lệnh `import:content`, DEPLOY, chạy thử DB trắng

**Files:**
- Create: `src/scripts/import-content.ts`
- Modify: `package.json` (script `"import:content": "cross-env NODE_OPTIONS=--no-deprecation payload run src/scripts/import-content.ts"`)
- Modify (không commit): `docs/DEPLOY.md`
- Test: `tests/unit/scripts/import-content.test.ts`

**Interfaces:**
- Consumes: `importContent`, `ContentReport` (Task 2).
- Produces: `formatContentReport(r: ContentReport): string`; `main()` theo mẫu `src/scripts/import-page-facts.ts`.

- [ ] **Step 1: Viết test hỏng** `formatContentReport`:
  - Báo cáo có `created` 7 mốc → có dòng chứa `Dòng thời gian: tạo 7`.
  - Có `existing` → dòng chứa `đã có sẵn`.
  - `globals` có `saved: 'draft'` cho `page-intros` → dòng chứa `Phần mở đầu trang` và `bản nháp`; có `warning` → dòng bắt đầu `Lưu ý:`.
  - Không tạo gì, mọi global `saved: 'none'` → kết quả chứa đúng `Không có gì để nhập.`
  - Có tạo → dòng cuối nhắc người duyệt vào `/admin` đăng từng mục.
  - Nhãn collection tiếng Việt: Dòng thời gian, Công đoạn, Sản phẩm, Bài viết.
- [ ] **Step 2:** `npx vitest run tests/unit/scripts/import-content.test.ts` → FAIL.
- [ ] **Step 3:** Viết script và thêm npm script.
- [ ] **Step 4:** Test PASS. Sửa `docs/DEPLOY.md`: mục "Nhập dữ kiện trang (lần đầu lên prod)" đổi sang `npm run import:content`, liệt kê phải đăng: 7 mốc, 7 công đoạn, 7 sản phẩm, 1 bài, Phần mở đầu trang, Thông tin site; lưu ý chạy lại sẽ tạo lại bản ghi đã xoá hẳn và điền lại trường cố ý để trống; ảnh và con người nhập trong /admin. Dòng "Không chạy `npm run seed`" nêu `import:content`.
- [ ] **Step 5: Chạy thử DB trắng.**
  - `chieuhoi_demo` trắng → `APP_ENV=production npm run migrate` → `create-reviewer` → `npm run import:content` (in đủ báo cáo) → chạy lại in `Không có gì để nhập.`
  - `next dev -p 3001` với `PREVIEW_ALL=false`: trước khi đăng, `/lang-hoi` không có mốc.
  - Đăng mọi mục qua Local API bằng người duyệt (hoặc admin UI), rồi chụp 1440 và 390: `/`, `/lang-hoi`, `/nghe-det-chieu`, `/san-pham`, `/cau-chuyen` vào scratchpad. Không commit ảnh.
- [ ] **Step 6:** `npm run lint`, `npx tsc --noEmit`, `npm run test:unit`, `npm run test:int`, `npm run build` sạch.
- [ ] **Step 7: Commit** (không gồm `docs/DEPLOY.md`) `feat(scripts): lệnh import:content`.
