# Dữ kiện trang Làng Hới và Nghề dệt vào CMS — kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Biên tập viên sửa được trong `/admin` mọi dữ kiện của `/lang-hoi` và `/nghe-det-chieu` (kèm nguồn), web hiện giống hệt hiện nay với dữ liệu seed, và prod có lệnh nhập riêng chỉ lưu bản nháp.

**Architecture:** Thêm nhóm trường vào hai tab sẵn có của global `page-intros`. Lớp `src/lib/content` đọc các nhóm đó, ánh xạ về **đúng hình dạng copy cũ** (`{ text: {desktop, mobile}, cite }`) rồi gộp vào copy UI trước khi `applyMode`, nên `VillageCopyView` và component Làng Hới không đổi. Trang Nghề dệt thêm `cite`/`sources` vào view model và hiện `Cite`/`SourceList` khi có nguồn. Một hàm `importPageFacts` dùng chung cho seed (dev/staging) và lệnh `npm run import:page-facts` (mọi môi trường).

**Tech Stack:** Next.js 16.4, Payload CMS 3.92 (Postgres), TypeScript strict, vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-30-du-lieu-trang-vao-cms-design.md`

## Global Constraints

- Phụ thuộc một chiều: `app` → `components` → `lib/content` → Payload. Component chỉ `import type` từ `@/lib/content`; không lọc consent/rights trong component.
- Chữ giao diện (eyebrow, title section, nhãn nút, aria, "Đọc tiếp", "Mốc của bạn", ô bản đồ chờ) **ở lại** `src/lib/content/copy/*.ts`.
- Không bịa dữ kiện. Seed chép **nguyên văn** nội dung hiện có trong `copy/village.ts` và `copy/craft.ts` (gồm sửa ngày 2026-10-30). Không điền số liệu Vietnam+ mới.
- Chữ trống hoặc `[cần …]`/`[chờ …]` bị ẩn ở public, hiện ở preview (đi qua `showText`/`applyMode`). Ghi chú biên tập luôn `null` ở public.
- Câu có nguồn mà mọi nguồn bị ẩn thì câu ẩn ở public; dòng bảng thông tin có nguồn mà hết nguồn bị ẩn thì bỏ dòng.
- Nhãn admin tiếng Việt, không lộ từ kỹ thuật (sourceId, JSON, desktop/mobile). Không thêm menu hay global mới.
- `npm run seed` vẫn chặn ngoài development/staging; không sửa `src/seed/guard.ts`.
- Lệnh nhập không bao giờ đăng global, không sửa nguồn đã có, không tạo người/sản phẩm/câu chuyện/ảnh/mốc dòng thời gian.
- Đổi schema thì `npm run migrate:create page_facts` và commit `src/migrations`.
- Ảnh chụp so thiết kế không bao giờ commit. `test:int` và `guide:seed` chạy lần lượt, không song song.
- Làm trên nhánh `du-lieu-trang-cms`, không làm trên `main`.

## Review Focus

- Global đã đăng **trước** khi deploy (prod/dev có tiêu đề, ảnh nhưng chưa có nhóm mới): bản công khai phải ẩn section rỗng, không lỗi. Test ở Task 4 (`hides empty founder/location/heritage when groups are missing`).
- Admin gỡ một nguồn khỏi "Nguồn tham khảo của trang" nhưng câu vẫn trích nó: nguồn tự nối vào cuối, số không bị trùng hay nhảy. Test ở Task 2 (`orderSources appends cited ids not listed`).
- Biên tập viên đang có bản nháp khi seed/import chạy: không được đăng đè, không mất chữ đã nhập trong nháp. Test ở Task 3 (`keeps pending draft and only fills empty groups`).
- Quan hệ nguồn đã bị xoá (relationship trỏ tới id không còn): bỏ qua, không crash. Test ở Task 2 (`sourceIdsOf ignores unpopulated or missing relations`).
- "Dòng cho điện thoại" nhiều dòng (hàng đầu bảng so sánh có hai dòng mobile): tách theo xuống dòng, bỏ dòng trống. Test ở Task 2 (`compareMobileLines splits by newline and auto-composes when empty`).

---

### Task 0: Nhánh và lưu phần việc đang dở

**Files:** các file đang sửa chưa commit (`content/seed/sources.json`, `content/seed/timeline.json`, `src/seed/data/timeline.ts`, `src/lib/content/copy/village.ts`, `tests/int/pages.int.spec.ts`, `tests/unit/village/village-view.test.tsx`), spec, kế hoạch này. **Không** đụng `docs/DEPLOY.md` (người dùng đang sửa dở).

- [ ] **Step 1:** Kiểm Docker: `docker compose ps` trả về trong vài giây và `chieuhoi-db` ở trạng thái `running`. Treo thì dừng lại, báo người dùng khởi động lại Docker Desktop rồi `docker compose up -d`.
- [ ] **Step 2:** `git switch -c du-lieu-trang-cms`
- [ ] **Step 3:** `npm run test:unit` → PASS. `npm run test:int` → PASS (lần đầu chạy phần sửa ngày 2026-10-30).
- [ ] **Step 4: Commit** hai commit riêng:

```bash
git add content/seed/sources.json content/seed/timeline.json src/seed/data/timeline.ts src/lib/content/copy/village.ts tests/int/pages.int.spec.ts tests/unit/village/village-view.test.tsx
git commit -m "content: địa giới theo NQ 1666 và NQ 202, mốc đền thờ tổ nghề"
git add docs/superpowers/specs/2026-10-30-du-lieu-trang-vao-cms-design.md docs/superpowers/plans/2026-10-30-du-lieu-trang-vao-cms.md
git commit -m "docs: spec và kế hoạch đưa dữ kiện trang vào CMS"
```

---

### Task 1: Schema các nhóm mới trong Phần mở đầu trang

**Files:**
- Create: `src/globals/pageFacts.ts`
- Modify: `src/globals/PageIntros.ts` (hàm `routeGroup`)
- Create: `src/migrations/<timestamp>_page_facts.ts` (+ `.json`, `index.ts` do lệnh sinh)
- Test: `tests/unit/admin/page-facts-fields.test.ts`, `tests/int/page-intros.int.spec.ts` (thêm case)

**Interfaces:**
- Produces (tên trường trong Payload, các task sau đọc/ghi đúng các tên này):
  - Dạng **câu có nguồn** `citedSentenceFields(): Field[]` → `text` (textarea, "Câu", required), `mobileText` (textarea, "Bản ngắn cho điện thoại"), `hideOnMobile` (checkbox, "Ẩn trên điện thoại"), `sources` (relationship `sources`, hasMany, "Nguồn").
  - `pageSourcesField(): Field` → `pageSources` (relationship `sources`, hasMany, "Nguồn tham khảo của trang", admin.isSortable, mô tả "Số [1], [2]… trên trang theo đúng thứ tự này.").
  - `villageFactsFields(): Field[]` (thêm vào nhóm `lang-hoi`):
    - `facts` array "Bảng thông tin đầu trang": `term` ("Mục", required), `detail` ("Nội dung", required), `detailMobile` ("Bản ngắn cho điện thoại"), `note` ("Ghi chú"), `noteMobile` ("Ghi chú ngắn cho điện thoại"), `editorNote` ("Ghi chú biên tập (chỉ hiện ở bản xem trước)"), `sources` ("Nguồn").
    - `founder` group "Tổ nghề": `paragraphs` array "Đoạn" → `sentences` array "Câu" (`citedSentenceFields`); `conflict` array "Hộp Các nguồn chưa thống nhất" (`citedSentenceFields`); `conflictEditorNote` ("Ghi chú biên tập cuối hộp"); `noPortrait` ("Dòng không có chân dung").
    - `location` group "Vị trí": `text` ("Câu mô tả"), `sources` ("Nguồn"), `editorNote` ("Ghi chú biên tập").
    - `heritage` group "Di sản hôm nay": `sentences` array (`citedSentenceFields`), `editorNote`.
    - `pageSourcesField()`.
  - `craftFactsFields(): Field[]` (thêm vào nhóm `nghe-det-chieu`):
    - `tools` array "Dụng cụ", maxRows 3, mô tả "Ảnh lấy từ ô ảnh Dụng cụ 1–3 theo thứ tự dòng.": `name` ("Tên dụng cụ", required), `note` group "Ghi chú" (`citedSentenceFields`, `text` không required).
    - `hand` và `machine` group "Thẻ Dệt thủ công" / "Thẻ Dệt bằng máy": `title` ("Tiêu đề thẻ"), `text` group "Mô tả" (citedSentence), `note` group "Ghi chú" (citedSentence).
    - `compareRows` array "Bảng so sánh": `aspect` ("Khía cạnh", required), `hand` ("Thủ công"), `machine` ("Bằng máy"), `mobile` (textarea "Dòng cho điện thoại", mô tả "Mỗi dòng một ý. Để trống thì tự ghép: Thủ công: … · Máy: …"), `sources`.
    - `pageSourcesField()`.
  - Mọi ô chữ `localized: true` như các ô sẵn có.

Ghi chú: `text` trong citedSentence chỉ required khi dùng trong mảng câu (founder, conflict, heritage). Với nhóm `tools.note`, `hand.text`… truyền `citedSentenceFields({ required: false })`.

- [ ] **Step 1: Write the failing test** `tests/unit/admin/page-facts-fields.test.ts`

```ts
import { PageIntros } from '@/globals/PageIntros'
const group = (k: string) => PageIntros.fields.find((f) => 'name' in f && f.name === k) as { fields: { name?: string; label?: string; maxRows?: number }[] }
const names = (k: string) => group(k).fields.map((f) => f.name)

it('Làng Hới có các nhóm dữ kiện', () => {
  expect(names('lang-hoi')).toEqual(expect.arrayContaining(['facts', 'founder', 'location', 'heritage', 'pageSources']))
})
it('Nghề dệt có dụng cụ tối đa 3 dòng và bảng so sánh', () => {
  expect(names('nghe-det-chieu')).toEqual(expect.arrayContaining(['tools', 'hand', 'machine', 'compareRows', 'pageSources']))
  expect(group('nghe-det-chieu').fields.find((f) => f.name === 'tools')?.maxRows).toBe(3)
})
it('các trang khác không có nhóm dữ kiện', () => {
  expect(names('home')).not.toContain('pageSources')
})
it('nhãn admin không có từ kỹ thuật', () => {
  const labels: string[] = []
  const walk = (fs: unknown[]) => fs.forEach((f) => {
    const x = f as { label?: unknown; fields?: unknown[] }
    if (typeof x.label === 'string') labels.push(x.label)
    if (x.fields) walk(x.fields)
  })
  walk([...group('lang-hoi').fields, ...group('nghe-det-chieu').fields])
  for (const l of labels) expect(l).not.toMatch(/sourceId|desktop|mobile|JSON/i)
})
```

- [ ] **Step 2:** `npm run test:unit -- tests/unit/admin/page-facts-fields.test.ts` → FAIL (thiếu trường).
- [ ] **Step 3:** Viết `src/globals/pageFacts.ts` theo Interfaces; trong `routeGroup` thêm `...(key === 'lang-hoi' ? villageFactsFields() : [])` và `...(key === 'nghe-det-chieu' ? craftFactsFields() : [])` sau `pageMediaField`.
- [ ] **Step 4:** `npm run test:unit` → PASS.
- [ ] **Step 5: Int test lưu không hợp lệ** trong `tests/int/page-intros.int.spec.ts`: `updateGlobal` với `'lang-hoi': { facts: [{ term: '', detail: 'x' }] }` reject; với `'nghe-det-chieu': { tools: [4 dòng] }` reject; với `compareRows: [{ aspect: '' }]` reject.
- [ ] **Step 6:** `npm run dev` một lần cho dev DB push schema, dừng; `npm run migrate:create page_facts`; `npm run generate:types`. Kiểm migration chỉ thêm bảng/cột của nhóm mới (không drop gì).
- [ ] **Step 7:** `npm run test:int -- tests/int/page-intros.int.spec.ts` → PASS. `npm run lint` → sạch.
- [ ] **Step 8: Commit** `feat(cms): nhóm dữ kiện trang Làng Hới và Nghề dệt trong Phần mở đầu trang`

---

### Task 2: Ánh xạ global → dữ kiện trang (hàm thuần)

**Files:**
- Create: `src/lib/content/pageFacts.ts`
- Test: `tests/unit/content/page-facts.test.ts`

**Interfaces:**
- Consumes: tên trường của Task 1 (doc đọc với `depth: 1`, nên `sources` là mảng object `{ sourceId }` hoặc số id nếu không populate).
- Produces:

```ts
export type CitedText = { text: { desktop: string | null; mobile: string | null }; cite: string[] }
export function sourceIdsOf(v: unknown): string[]           // object có sourceId → giữ; còn lại bỏ
export function toCited(row: SentenceRow | null | undefined): CitedText
//   desktop = text ?? null; mobile = hideOnMobile ? null : (mobileText || text || null)
export function orderSources(listed: string[], cited: string[]): string[]  // listed (bỏ trùng) rồi nối cited chưa có, theo thứ tự gặp
export function compareMobileLines(r: { hand?: string | null; machine?: string | null; mobile?: string | null }): string[]
//   mobile có chữ → tách '\n', trim, bỏ dòng trống; trống → [`Thủ công: ${hand} · Máy: ${machine}`]
export function villageFactsFrom(g: Record<string, unknown> | undefined): VillageFacts
export function craftFactsFrom(g: Record<string, unknown> | undefined): CraftFacts
```

`VillageFacts` (chưa áp mode, đúng hình dạng copy cũ):
`{ facts: { term: string; detail: Variant; note: Variant; editorNote: string | null; cite: string[] }[]; founder: { paragraphs: { parts: CitedText[] }[]; conflict: { parts: CitedText[]; closing: Variant }; noPortrait: Variant }; location: { body: { text: string; cite: string[] }; note: Variant }; heritage: { paragraphs: CitedText[]; note: Variant }; sourceOrder: string[] }`
- `facts[].detail` = `{ desktop: detail, mobile: detailMobile || detail }`; `note` tương tự với `noteMobile`.
- Ghi chú biên tập và `noPortrait` là chỉ-desktop: `{ desktop: x || null, mobile: null }` (khớp copy cũ).
- `location.body.text` = `text ?? ''`.
- `sourceOrder` = `orderSources(pageSources, mọi cite theo thứ tự: facts → founder (đoạn, rồi hộp) → location → heritage)`.

`CraftFacts`: `{ tools: { n: number; name: string; note: Variant; cite: string[] }[]; hand: Way; machine: Way; rows: { aspect: string; hand: string; machine: string; mobile: string[]; cite: string[] }[]; sourceOrder: string[] }`, `Way = { title: string; text: Variant; note: Variant; cite: string[] }` (cite = hợp của cite Mô tả và Ghi chú, bỏ trùng). `tools[].n` = vị trí 1..3. Ô trống → `''` cho `hand`/`machine` của hàng (để `showText` ẩn như hiện nay).

`g` thiếu hoặc nhóm thiếu → mọi mảng rỗng, mọi Variant `{ desktop: null, mobile: null }`, không throw.

- [ ] **Step 1: Write the failing tests** (một `it` cho mỗi ý):
  - `toCited`: `{text:'A'}` → `{desktop:'A',mobile:'A'}`; `{text:'A',mobileText:'a'}` → mobile `'a'`; `{text:'A',hideOnMobile:true}` → mobile `null`; `cite` lấy `sourceId`.
  - `sourceIdsOf ignores unpopulated or missing relations`: `[{sourceId:'x'}, 7, null, {}]` → `['x']`.
  - `orderSources appends cited ids not listed`: `(['b','a'], ['a','c','b','d','c'])` → `['b','a','c','d']`.
  - `compareMobileLines splits by newline and auto-composes when empty`: `'Thủ công: x\n\nBằng máy: y'` → hai dòng; `{hand:'[cần xác minh]',machine:'[cần xác minh]'}` → `['Thủ công: [cần xác minh] · Máy: [cần xác minh]']`.
  - `villageFactsFrom(undefined)` → facts `[]`, founder.paragraphs `[]`, location.body `{text:'',cite:[]}`, sourceOrder `[]`.
  - `villageFactsFrom` với pageSources `['vietnamplus-2026','danviet-2024','daidoanket-2021','nq-1666-2025','nq-202-2025']` và một câu trích `'x-moi'` → sourceOrder kết thúc bằng `'x-moi'`.
- [ ] **Step 2:** `npm run test:unit -- tests/unit/content/page-facts.test.ts` → FAIL.
- [ ] **Step 3:** Viết `src/lib/content/pageFacts.ts` theo Interfaces. Không import Payload (chỉ type).
- [ ] **Step 4:** chạy lại → PASS; `npm run lint`.
- [ ] **Step 5: Commit** `feat(content): ánh xạ dữ kiện trang từ Phần mở đầu trang`

---

### Task 3: Dữ liệu seed và `importPageFacts`

**Files:**
- Create: `src/seed/data/pageFacts.ts` (nội dung nguyên văn)
- Create: `src/seed/pageFacts.ts` (hàm ghi)
- Modify: `src/seed/index.ts` (gọi sau vòng globals)
- Test: `tests/unit/seed/page-facts-data.test.ts`, `tests/int/seed.int.spec.ts` (thêm case)

**Interfaces:**
- Produces:

```ts
// src/seed/data/pageFacts.ts — dạng nhập của Payload, nguồn ghi bằng sourceId (chuỗi), đổi sang id lúc ghi.
export const PAGE_FACT_SOURCE_IDS = ['vietnamplus-2026', 'danviet-2024', 'daidoanket-2021', 'nq-1666-2025', 'nq-202-2025'] as const
export const villageFactsSeed: { facts; founder; location; heritage; pageSources: string[] }
export const craftFactsSeed: { tools; hand; machine; compareRows; pageSources: string[] }

// src/seed/pageFacts.ts
export type ImportReport = { sourcesCreated: string[]; sourcesSkipped: string[]; filled: string[]; skipped: { group: string; reason: string }[]; saved: 'published' | 'draft' | 'none' }
export function isEmptyGroup(v: unknown): boolean   // mọi chuỗi trống/null, mọi mảng rỗng, checkbox bỏ qua
export async function importPageFacts(payload: Payload, opts: { publish: 'never' | 'when-no-draft'; force?: boolean; user?: TypedUser }): Promise<ImportReport>
```

Nội dung seed (chép nguyên văn từ `copy/village.ts`, `copy/craft.ts` hiện tại, rồi xoá ở Task 4/5):
- `facts`: 3 dòng TÊN GỌI, ĐỊA GIỚI HIỆN NAY, TỔ NGHỀ với `detail`, `detailMobile` (chỉ khi khác `detail`: dòng TỔ NGHỀ `'Phạm Đôn Lễ, "Trạng Chiếu"'`), `note`/`noteMobile` (ĐỊA GIỚI: `'Trước đây: xã Tân Lễ, huyện Hưng Hà, tỉnh Thái Bình'` / `'Trước đây: xã Tân Lễ, huyện Hưng Hà, Thái Bình'`), `sources` như `cite` hiện tại.
- `founder.paragraphs`, `conflict`, `conflictEditorNote` (`'Cần đối chiếu với sử liệu khoa bảng trước khi đăng chính thức.'`), `noPortrait`: theo `villageCopy.founder`. Câu `mobile: null` → `hideOnMobile: true`; câu có mobile khác desktop → `mobileText`.
- `location`: `text` = `'Sông Luộc bao quanh làng rồi đổ ra sông Hồng; bên kia sông là thành phố Hưng Yên.'`, `sources: ['daidoanket-2021']`, `editorNote` = câu "Mô tả này theo bài báo năm 2021…".
- `heritage`: 2 câu + `editorNote` "Số hộ, số khung dệt…".
- `tools`: Khung dệt, Khuôn in hoa văn, Bàn chải quét màu, ghi chú desktop/mobile như hiện tại, không nguồn.
- `hand`/`machine`: title, text, note như `craftCompare`, không nguồn.
- `compareRows`: 4 hàng; hàng 1 `mobile: 'Thủ công: đưa sợi và dệt trên khung\nBằng máy: nạp cói vào máy'`; 3 hàng sau `mobile` để trống (tự ghép ra đúng chuỗi hiện tại).
- `pageSources`: Làng Hới = `PAGE_FACT_SOURCE_IDS`; Nghề dệt = `[]`.

Luật `importPageFacts` (spec, mục Chuyển tiếp và Kiến trúc):
1. Với mỗi id trong `PAGE_FACT_SOURCE_IDS` chưa có `sourceId` trong DB: tạo từ `content/seed/sources.json`. Có rồi: không sửa, ghi vào `sourcesSkipped`.
2. Đọc `findGlobal({ slug: 'page-intros', draft: true, depth: 0 })` làm bản gốc. `hasPendingDraft` = bản này `_status === 'draft'` và khác bản `draft: false` (hoặc `findGlobalVersions` mới nhất là draft) — dùng cách nào chắc chắn hơn với Payload 3.92, ghi chú trong code.
3. Với từng nhóm `lang-hoi.{facts,founder,location,heritage,pageSources}` và `nghe-det-chieu.{tools,hand,machine,compareRows,pageSources}`: `force || isEmptyGroup(current)` thì điền (đổi sourceId → id), ngược lại `skipped` với lý do `'đã có dữ liệu'`.
4. Không nhóm nào cần điền → `saved: 'none'`, không gọi `updateGlobal`.
5. Ghi cả đối tượng route (`{ ...current[route], ...nhómĐiền }`) để không mất ô cũ.
6. `publish: 'never'` hoặc `hasPendingDraft` → `updateGlobal({ draft: true, data })`, `saved: 'draft'` (kèm cảnh báo trong report khi do nháp). Ngược lại `data._status = 'published'`, cần `user` reviewer.

Trong `seed()` (`src/seed/index.ts`): sau vòng `for (const [slug, data] of globals)`, gọi `importPageFacts(payload, { publish: 'when-no-draft', force, user })` và `console.log` report.

- [ ] **Step 1: Unit test** `page-facts-data.test.ts`: mọi `sources` trong hai seed nằm trong `PAGE_FACT_SOURCE_IDS`; mọi id đó có trong `content/seed/sources.json`; `tools.length === 3`; `isEmptyGroup({ sentences: [], editorNote: '' })` true, `isEmptyGroup({ text: 'x' })` false.
- [ ] **Step 2: Int test** trong `tests/int/seed.int.spec.ts`:
  - `fills empty groups and publishes on fresh db`: `resetDb` → `seed` → `findGlobal(draft:false)` có `lang-hoi.facts.length === 3`, `_status === 'published'`.
  - `keeps pending draft and only fills empty groups`: đăng global có `lang-hoi.location.text = 'Đã sửa'`, sau đó lưu nháp `'lang-hoi'.lead = 'Nháp'`, xoá trống `heritage`; gọi `importPageFacts(payload, { publish: 'when-no-draft', user })` → `saved === 'draft'`; bản đã đăng vẫn không có heritage; bản nháp có heritage, `location.text === 'Đã sửa'`, `lead === 'Nháp'`.
  - `import never publishes and is idempotent`: DB trắng → `importPageFacts(payload, { publish: 'never' })` → 5 nguồn tạo, `saved === 'draft'`, `findGlobal(draft:false)._status !== 'published'`; gọi lần hai → `sourcesCreated` rỗng, `saved === 'none'`; số document của `people`, `products`, `stories`, `archive-assets`, `timeline-events` đều 0.
  - `does not edit existing sources`: tạo `vietnamplus-2026` với title `'Cũ'` → import → title vẫn `'Cũ'`.
- [ ] **Step 3:** chạy → FAIL.
- [ ] **Step 4:** Viết `src/seed/data/pageFacts.ts`, `src/seed/pageFacts.ts`, sửa `src/seed/index.ts`.
- [ ] **Step 5:** `npm run test:unit` và `npm run test:int -- tests/int/seed.int.spec.ts` → PASS.
- [ ] **Step 6: Commit** `feat(seed): dữ liệu và hàm nhập dữ kiện trang`

---

### Task 4: Trang Làng Hới đọc từ CMS

**Files:**
- Modify: `src/lib/content/copy/village.ts` (bỏ `villageFacts`, `villageSourceOrder`, phần dữ kiện trong `villageCopy`)
- Modify: `src/lib/content/pages.ts` (`getVillagePage`)
- Modify: `tests/unit/village/village-view.test.tsx`, `tests/unit/copy.test.ts`, `tests/int/pages.int.spec.ts`
- Không đổi: `src/components/village/VillageView.tsx`, `VillagePageView`, `VillageCopyView` (hình dạng giữ nguyên)

**Interfaces:**
- Consumes: `villageFactsFrom` (Task 2), seed (Task 3).
- `villageCopy` giữ khoá cũ nhưng giá trị dữ kiện là rỗng, có chú thích `// lấp từ CMS ở pages.ts`: `founder.paragraphs: [] as { parts: CitedText[] }[]`, `founder.conflict.parts: [] as CitedText[]`, `founder.conflict.preview.closing: { desktop: null, mobile: null }`, `founder.noPortrait: { desktop: null, mobile: null }`, `location.body: { text: '', cite: [] as string[] }`, `location.preview.note`, `heritage.paragraphs: [] as CitedText[]`, `heritage.preview.note` cũng rỗng. Kiểu `{ desktop: string | null; mobile: string | null }` ghi rõ để `ApplyMode` ra `Variant`.
- `getVillagePage`: đọc `readGlobalDoc(payload, 'page-intros', mode, 1)['lang-hoi']` (gộp với lần đọc của `getPageMedia` nếu tiện), `const f = villageFactsFrom(g)`; `sources` theo `f.sourceOrder` (thay `villageSourceOrder`); `facts` như logic cũ, `note` preview nối `· editorNote`; gộp `{ ...villageCopy, founder: { ...villageCopy.founder, paragraphs: f.founder.paragraphs, conflict: { ...villageCopy.founder.conflict, parts: f.founder.conflict.parts, preview: { closing: f.founder.conflict.closing } }, noPortrait: f.founder.noPortrait }, location: { ...villageCopy.location, body: f.location.body, preview: { ...villageCopy.location.preview, note: f.location.note } }, heritage: { ...villageCopy.heritage, paragraphs: f.heritage.paragraphs, preview: { note: f.heritage.note } } }` rồi `applyMode(merged, mode, { cites: visible })`.

- [ ] **Step 1: Int test** `pages.int.spec.ts`: giữ nguyên các assert hiện có (seed → view model bằng như cũ: thứ tự nguồn `['vietnamplus-2026','danviet-2024','daidoanket-2021','nq-1666-2025','nq-202-2025']`, `facts[1].note`, trường hợp ẩn danviet). Thêm:
  - `edits in admin show on page`: publish global với `lang-hoi.location.text = 'Làng nằm ở xã Long Hưng.'` → `getVillagePage('public').copy.location.body.text` bằng chuỗi đó.
  - `hides empty founder/location/heritage when groups are missing`: publish global chỉ có `eyebrow/title/lead` cho `lang-hoi` → public: `facts` `[]`, `copy.founder.paragraphs` `[]`, `copy.location.body.text` `null`, `sources` `[]`; render `VillageView` không throw (unit) .
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3:** Sửa `copy/village.ts` và `getVillagePage`. Sửa test unit `village-view.test.tsx` và `copy.test.ts` dựng fixture từ `villageFactsFrom(<seed đã đổi sourceId thành {sourceId}>)` thay cho `villageFacts`; giữ mọi assert hiển thị đang có (đặc biệt 'Cần đối chiếu với sử liệu khoa bảng' chỉ ở preview).
- [ ] **Step 4:** `npm run test:unit`, `npm run test:int -- tests/int/pages.int.spec.ts` → PASS; `npm run lint`.
- [ ] **Step 5: Commit** `feat(lang-hoi): dữ kiện trang đọc từ CMS`

---

### Task 5: Trang Nghề dệt đọc từ CMS, có chú thích nguồn

**Files:**
- Modify: `src/lib/content/copy/craft.ts` (bỏ `craftTools`, `craftCompare`)
- Modify: `src/lib/content/types.ts` (`CraftPageView`)
- Modify: `src/lib/content/pages.ts` (`getCraftPage`)
- Modify: `src/components/content/FigureCard.tsx`, `src/components/content/ComparisonTabs.tsx`, `src/components/craft/CraftView.tsx`
- Modify: `src/app/(frontend)/styleguide/page.tsx` (+ fixture cục bộ thay cho `craftTools`/`craftCompare`)
- Test: `tests/unit/craft/craft-view.test.tsx`, `tests/unit/components/figure-card.test.tsx` (hoặc file test FigureCard/ComparisonTabs hiện có), `tests/int/pages.int.spec.ts`

**Interfaces:**
- Consumes: `craftFactsFrom` (Task 2).
- `CraftPageView` thêm: `tools[].cite: string[]`, `compare.hand.cite`, `compare.machine.cite`, `compare.rows[].cite: string[]`, `sources: SourceView[]` (theo `sourceOrder`, đã lọc nguồn ẩn, `date` qua `formatDate`). `title` của thẻ hand/machine thành `string | null` (qua `showText`).
- `FigureCard` thêm prop `cite?: ReactNode`, render ngay sau `<VariantText value={caption} />` trong `figcaption`.
- `ComparisonTabs` thêm prop `numbers?: Map<string, number>`; render `<Cite ids={way.cite} numbers={numbers} variant="bracket" />` sau đoạn mô tả, và sau ô `machine` của mỗi hàng (`r.cite`). Không có `numbers` hoặc không số nào → `Cite` trả `null`, markup như cũ.
- `CraftView`: `const numbers = sourceNumbers(page.sources)`; truyền `cite={<Cite ids={t.cite} numbers={numbers} variant="bracket" />}` cho `FigureCard`, `numbers` cho `ComparisonTabs`; cuối trang (trước `ReadNext`) `{page.sources.length > 0 ? <SourceList sources={page.sources} /> : null}`.
- `getCraftPage`: thay vòng lặp `craftCompare.rows` bằng `f.rows` với `mobile: compareMobileLines` (đã làm ở Task 2), giữ nguyên logic `muted`/bỏ hàng; câu có nguồn hết bị ẩn → ẩn ở public (dùng `applyMode(..., { cites: visible })` cho tools/hand/machine).

- [ ] **Step 1: Tests**:
  - unit FigureCard: có `cite` → render node đó trong `figcaption`; không có → markup như snapshot cũ.
  - unit ComparisonTabs: `numbers` có `'vietnamplus-2026' → 1` và `rows[0].cite = ['vietnamplus-2026']` → có `[1]`; không `numbers` → không có `[`.
  - unit CraftView: `sources: []` → không có heading "Nguồn tham khảo"; có 1 nguồn → có.
  - int `pages.int.spec.ts`: với seed, `getCraftPage('public')` bằng kết quả cũ (tools 3 tên, rows như cũ) và `sources` `[]`; publish global gắn `vietnamplus-2026` cho `compareRows[1]` với `hand: '2 lá/ngày'` → public có `sources[0].id === 'vietnamplus-2026'`, `rows` có `cite`.
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3:** Sửa theo Interfaces. Cập nhật `/styleguide` để FigureCard và ComparisonTabs có một ví dụ kèm chú thích.
- [ ] **Step 4:** `npm run test:unit`, `npm run test:int -- tests/int/pages.int.spec.ts`, `npm run lint` → PASS.
- [ ] **Step 5: Commit** `feat(nghe-det-chieu): dữ kiện trang đọc từ CMS, chú thích nguồn khi có`

---

### Task 6: Lệnh `npm run import:page-facts` và hướng dẫn deploy

**Files:**
- Create: `src/scripts/import-page-facts.ts`
- Modify: `package.json` (script)
- Modify: `docs/DEPLOY.md` (**đọc kỹ trước**: người dùng đang có thay đổi chưa commit; chỉ thêm mục mới và sửa dòng "Không chạy `npm run seed`…", không đụng phần khác)
- Test: `tests/unit/scripts/import-page-facts.test.ts` (định dạng in report)

**Interfaces:**
- Consumes: `importPageFacts`, `ImportReport` (Task 3).
- Produces: `export function formatReport(r: ImportReport): string` trong `src/scripts/import-page-facts.ts` (tách phần chạy vào `main()` chỉ chạy khi `!process.env.VITEST`, như `src/seed/index.ts`).
- Script: `"import:page-facts": "cross-env NODE_OPTIONS=--no-deprecation payload run src/scripts/import-page-facts.ts"`. Không gọi `assertSeedAllowed`. Luôn `publish: 'never'`, không `force`.

- [ ] **Step 1: Unit test** `formatReport`: có dòng "Đã tạo nguồn: vietnamplus-2026, …", "Bỏ qua nhóm lang-hoi.location: đã có dữ liệu", "Đã lưu bản nháp. Người duyệt vào /admin › Phần mở đầu trang để xem và đăng."; với `saved: 'none'` → "Không có gì để nhập."
- [ ] **Step 2:** FAIL → viết script → PASS.
- [ ] **Step 3:** `docs/DEPLOY.md`: mục "Nhập dữ kiện trang (lần đầu lên prod)": deploy (`npm run ci`) → `npm run import:page-facts` với env prod → người duyệt mở `/admin`, xem trước, đăng **Phần mở đầu trang**. Sửa dòng cấm seed thành: không chạy `npm run seed` ở production; lệnh được phép là `npm run import:page-facts` và `npm run create-reviewer`.
- [ ] **Step 4:** `npm run lint` → sạch.
- [ ] **Step 5: Commit** `feat(scripts): lệnh nhập dữ kiện trang cho production`

---

### Task 7: Hướng dẫn admin

**Files:**
- Modify: `src/admin/guide/sections.ts`, `src/admin/guide/shots.ts`, phần dựng ảnh trong `tools/guide.mjs` / `src/seed/guide.ts` theo mẫu các ảnh có sẵn
- Regenerate: `public/admin-guide/*` (gồm `labels.json`)

**Interfaces:** mục mới `{ id: 'du-kien-trang', title: 'Sửa dữ kiện trang Làng Hới và Nghề dệt', audience: 'all', when: 'Dùng khi bạn cần sửa một dữ kiện, ví dụ địa giới của làng, hoặc gắn nguồn cho một câu.' }`, đặt sau `them-nguoi-san-pham`.

- [ ] **Step 1:** Viết các bước (câu ngắn, gọi "bạn", nhãn in đậm khớp đúng chữ trên admin): mở menu → **Phần mở đầu trang** → tab **Làng Hới** → **Bảng thông tin đầu trang** → mở dòng **ĐỊA GIỚI HIỆN NAY** → sửa **Nội dung** → ở **Nguồn** chọn nguồn (chưa có thì thêm ở mục **Nguồn** trước) → **Lưu bản nháp** → gửi người duyệt. Một bước nói thứ tự **Nguồn tham khảo của trang** quyết định số [1], [2]. Hai ảnh: `du-kien-dia-gioi` (khung đỏ quanh dòng Địa giới mở ra), `du-kien-nguon` (khung đỏ quanh ô Nguồn).
- [ ] **Step 2:** `npm run guide:seed && npm run guide:shots` (không chạy song song với `test:int`).
- [ ] **Step 3:** `npm run test:unit` → PASS (labels khớp).
- [ ] **Step 4: Commit** `docs(admin): hướng dẫn sửa dữ kiện trang`

---

### Task 8: So hiển thị và chạy thử như prod trên dev

**Files:** không sửa code. Ảnh chụp ở thư mục gitignore, không commit.

- [ ] **Step 1: Ảnh trước.** `git stash`/checkout commit của Task 0 trong worktree tạm, `npm run seed`, chụp `SCREENS=1 npm run test:e2e -- --project=chromium --no-deps tests/e2e/screens.e2e.spec.ts` cho `/lang-hoi`, `/nghe-det-chieu` ở 1440 và 390 (preview và public). Quay lại nhánh, `npm run seed`, chụp lại, `node tools/screens-sheet.mjs`. Expected: không khác biệt.
- [ ] **Step 2:** `npm run lint`, `npm run build`, `npm run test:unit`, `npm run test:int` → PASS.
- [ ] **Step 3: Chạy thử từ DB trắng (như prod)** — làm theo đúng thứ tự trong DEPLOY.md:
  1. `docker compose exec db createdb -U <user> chieuhoi_demo` (user lấy từ `.env`).
  2. Với `DATABASE_URI=…/chieuhoi_demo`, `APP_ENV=development`: `npm run migrate` (tạo schema như prod).
  3. `REVIEWER_EMAIL=… REVIEWER_PASSWORD=… npm run create-reviewer`.
  4. `npm run import:page-facts` → in "Đã tạo nguồn: …5 nguồn", "Đã lưu bản nháp…". Chạy lần hai → "Không có gì để nhập."
  5. `npm run dev`, mở `/lang-hoi` ở chế độ công khai: section dữ kiện **chưa hiện** (global chưa đăng).
  6. Đăng nhập `/admin` bằng người duyệt → **Phần mở đầu trang** → xem tab Làng Hới, Nghề dệt chiếu có đủ dữ liệu → đăng.
  7. Mở lại `/lang-hoi` và `/nghe-det-chieu`: bảng thông tin, Tổ nghề, Vị trí, Di sản, nguồn [1]–[5] hiện đủ; không có ảnh (DB trắng, đúng như prod chưa tải ảnh). Chụp 1440 và 390 gửi người dùng xem.
  8. Xong thì `dropdb chieuhoi_demo`.
- [ ] **Step 4:** Chép mục review còn mở vào `docs/superpowers/backlog.md`, commit `docs: backlog sau đợt dữ kiện trang`.
