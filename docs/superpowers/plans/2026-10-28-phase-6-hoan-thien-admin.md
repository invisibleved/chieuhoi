# Chiếu Hới — Phase 6: Hoàn thiện admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thiện admin Payload theo spec mục 9 bước 6:
- nhãn tiếng Việt và nhóm menu đầy đủ;
- nút "Xem trước" trên từng bản ghi, mở trang công khai bằng Draft Mode của Next;
- nội dung đăng, sửa, gỡ đăng, xoá hiện lên trang công khai ngay, không build lại (revalidate);
- kiểm thử quy trình hai vai trò từ đầu đến cuối trên bản build production.

Hết Phase 6 thì dừng để người dùng xem.

**Architecture:**
- Không đổi schema DB (chỉ nhãn, mô tả, validate, hook, `admin.preview`). Không cần migration.
- **Revalidate:** `src/hooks/revalidate.ts` có hook `afterChange`/`afterDelete` cho collection và `afterChange` cho global. Mỗi hook gọi `revalidatePath('/', 'layout')`, gắn qua `contentCollectionDefaults` và cấu hình riêng của ArchiveAssets, Sources và hai global.
- **Đường dẫn trang:** `src/lib/routes.ts` là module thuần, không phụ thuộc gì.
  - `previewPathFor(collection, doc)` cho collection, dùng ở `admin.preview`;
  - `safeInternalPath(raw)` dùng ở route xem trước.
- **Xem trước:**
  - Route handler `src/app/(frontend)/preview/route.ts` và `src/app/(frontend)/preview/exit/route.ts`.
  - Kiểm đăng nhập qua `canPreview(headers)` trong `lib/content/preview.ts`, lớp duy nhất gọi Payload.
  - Thanh báo xem trước là `components/layout/PreviewBar`. Layout lấy view model bằng `getPreviewBar()`.

**Tech Stack:** Node 22.23.4, Next 16.4.3, React 19, Payload 3.92 (Postgres), Vitest, Playwright.
- `revalidatePath(path, 'layout')` có trong `next/cache`.
- `revalidateTag` ở Next 16 bắt buộc tham số thứ hai, plan không dùng nó.
- `draftMode()` lấy từ `next/headers`.
- `admin.preview: (doc, { req, locale, token }) => string | null` có cho cả collection và global (`GeneratePreviewURL` trong `payload/dist/config/types.d.ts`).
- Đọc lại kiểu trong `node_modules` trước khi dùng, không đoán.

**Spec:** `docs/superpowers/specs/2026-10-26-chieu-hoi-web-design.md`. Đọc kèm:
- mục 5 "Vai trò và quyền";
- mục 7 "Dữ liệu đi ra trang công khai": Draft Mode, nút "Xem trước", `afterChange`/`afterDelete` gọi `revalidatePath`;
- mục 9 bước 6.

Đọc thêm:
- `CLAUDE.md` ("Kiến trúc", "Component dùng chung");
- `docs/superpowers/backlog.md` mục A (mode chốt lúc build, `/ket-noi` đọc SiteSettings lúc build, `Sources.url`) và C Phase 1 (`Sources.date`, reviewer cuối cùng tự xoá mình).

## Global Constraints

- **Mọi quy tắc trong `CLAUDE.md` áp dụng.**
  - Phụ thuộc một chiều: `app` → `components` → `lib/content` → Payload.
  - Chỉ `lib/content` gọi Payload ở phía trang công khai. Route handler xem trước cũng không gọi `getPayload` trực tiếp.
  - Component chỉ `import type` từ `@/lib/content`.
- **Lint kiến trúc mở rộng cho `src/hooks/**`:** không import `@/components/*`, `@/app/*`.
- **`src/lib/routes.ts` không import gì**, kể cả Payload hay Next, để collection, lib và component dùng chung được.
- **Nhãn admin bằng tiếng Việt.**
  - Mọi collection có `labels.singular` và `labels.plural`; mọi global có `label`.
  - Mọi trường có `name` (kể cả trường lồng trong `group`/`array`/`row`/`collapsible`) có `label`.
  - Mọi option có `label`.
- **Quyền giữ nguyên bảng spec mục 5.** Phase này không nới quyền nào.
  - Xem trước bật được cho mọi người đã đăng nhập admin (biên tập viên và người duyệt).
  - Đăng, gỡ đăng, xoá vẫn chỉ người duyệt.
- **Route xem trước chỉ chuyển hướng tới đường dẫn nội bộ:**
  - bắt đầu bằng đúng một `/`;
  - không có `\`, không có ký tự điều khiển;
  - không bắt đầu bằng `/admin` hay `/api`.
  - Sai thì về `/`.
- **Người chưa đăng nhập gọi `/preview`:** trả 401 với `Cache-Control: no-store` và không đặt cookie `__prerender_bypass`.
- **Revalidate không bao giờ làm hỏng thao tác lưu.** Lỗi khi gọi ngoài request Next (seed, `payload run`, vitest) bị nuốt và ghi `payload.logger.debug`.
- **Copy mới** (thanh xem trước, mô tả trường) không có trên artboard, do Claude viết. Chép đúng chuỗi trong plan, không tự diễn đạt lại.
- **Không sửa giao diện trang công khai** ngoài việc thêm `PreviewBar`, thanh này chỉ hiện khi Draft Mode bật.
- **Chạy lệnh:** `fnm exec --using=22.23.4 -- npm run …`. Shell là fish, lệnh ghép bọc trong `bash -c`.

## Review Focus

1. **Open redirect qua `/preview?path=`:**
   - Đầu vào: `//evil.example`, `/\evil.example`, `https://evil.example`, `/%2F%2Fevil.example`, `javascript:alert(1)`, chuỗi rỗng, thiếu tham số, `/admin`, `/api/users`.
   - Mong đợi: tất cả về `/`.
   - Test: unit `safeInternalPath` (Task 3), e2e route (Task 6).
2. **Người chưa đăng nhập, hoặc cookie `payload-token` giả, gọi `/preview`:**
   - Mong đợi: 401, không bật Draft Mode.
   - Lần gọi sau tới trang công khai vẫn là bản public, không có nhãn `[cần xác minh]`.
   - Test: e2e (Task 4).
3. **Lưu nội dung khi không có request Next** (seed, `npm run seed`, int test, `payload run`):
   - Mong đợi: lưu thành công, không ném lỗi.
   - Test: int `revalidate.int.spec.ts` (Task 5); `npm run seed` chạy hết trên DB trống (Task 7).
4. **Gỡ đăng và xoá cũng phải biến khỏi trang công khai**, không chỉ đăng mới.
   - Một trang `/cau-chuyen/[slug]` đã cache sau khi gỡ đăng phải trả 404, và thẻ trên `/cau-chuyen` phải mất.
   - Test: e2e quy trình (Task 6).
5. **Biên tập viên lưu nháp trên bản đã đăng:**
   - Mong đợi: trang công khai vẫn hiện bản đã đăng cũ cho tới khi người duyệt đăng.
   - Revalidate chạy cũng không được làm lộ nháp, vì lib đọc `draft: false` ở public.
   - Test: e2e quy trình (Task 6).
6. **Hạ vai trò hoặc xoá người duyệt cuối cùng** (kể cả tự xoá mình) làm khoá admin.
   - Mong đợi: bị chặn với thông báo tiếng Việt.
   - Test: int (Task 2).

## Ruling của Claude trong plan (báo người dùng khi hết phase)

- **R1 Phase 6 theo spec mục 9 (hoàn thiện admin), không theo `KICKOFF_PROMPT.md`** ("Kiểm tra": axe/Lighthouse, bàn phím, so ảnh chụp). Spec ghi rõ nó thay lộ trình KICKOFF, và phần kiểm tra đã thuộc Phase 7.
  Nếu sai: đổi thứ tự hai phase, không mất việc.
- **R2 Revalidate cả site** bằng `revalidatePath('/', 'layout')` mỗi khi lưu hoặc xoá bất kỳ bản ghi nội dung nào: 7 collection nội dung, ArchiveAssets, Sources và 2 global. Users không revalidate.
  - Site có khoảng 15 trang, lượt xem ít. Map từng collection sang đúng route dễ sót (ảnh dùng ở nhiều trang, nguồn đánh số trên nhiều trang), và sót nghĩa là lộ hoặc kẹt dữ liệu.
  - Nếu sai: mỗi lần lưu, mọi trang được dựng lại ở lượt xem kế tiếp, tốn thêm CPU.
- **R3 Lỗi revalidate bị nuốt** (ghi `debug`). Seed và int test chạy ngoài request Next, nên `revalidatePath` ném lỗi "static generation store missing".
  Nếu sai: revalidate hỏng ở production sẽ không báo lỗi. Bù lại, e2e quy trình (Task 6) chạy trên bản build production và kiểm đúng việc này.
- **R4 Route xem trước** là `/preview?path=…` và `/preview/exit?path=…`, đặt trong `(frontend)`.
  - Mọi người đã đăng nhập admin đều bật được, theo spec ("chỉ bật cho người đã đăng nhập admin").
  - Không dùng secret trong URL. Phiên Payload (cookie cùng origin) là bằng chứng.
- **R5 Đường dẫn xem trước theo từng loại bản ghi** (`previewPathFor`):

  | Collection | Đường dẫn |
  |---|---|
  | `stories` | `workflow === 'idea'` hoặc không có slug → `/cau-chuyen`; còn lại → `/cau-chuyen/{slug}` |
  | `people` | `/con-nguoi/{slug}`; không có slug → `/con-nguoi` |
  | `products` | `/san-pham/{slug}`; không có slug → `/san-pham` |
  | `craft-steps` | `/nghe-det-chieu` |
  | `timeline-events` | `/lang-hoi` |
  | `makers` | `/san-pham` |
  | `archive-assets` | `inArchive && code` → `/thu-vien?anh={encodeURIComponent(code)}`; còn lại → `null` (không có nút) |
  | `sources`, `users` | `null` |
  | global `site-settings`, `page-intros` | `/` |

  Slug được `encodeURIComponent`.
- **R6 `PreviewBar` không có trên artboard.** Đây là một dải nền `bg-bg-ink` trên cùng trang, không dính khi cuộn.
  - Copy: `Bạn đang xem bản xem trước, gồm cả nội dung chưa đăng.` và link `Thoát xem trước`.
  - Thanh chỉ hiện khi Draft Mode bật, không hiện khi chỉ có `PREVIEW_ALL` (staging/dev).
  - Link thoát quay về trang hiện tại.
- **R7 Nhóm menu admin:**
  - `Nội dung`: Câu chuyện, Con người, Công đoạn, Mốc thời gian, Sản phẩm, Cơ sở dệt;
  - `Tư liệu`: Ảnh tư liệu, Nguồn;
  - `Trang`: Thông tin site, Phần mở đầu trang;
  - `Quản trị`: Người dùng.
  - Tiêu đề tab admin có hậu tố ` — Chiếu Hới`.
- **R8 Mô tả trường kiểm soát.** Mọi trường chỉ người duyệt sửa được có `admin.description` = `Chỉ người duyệt sửa được.`
  - Hằng `CONTROL_FIELD_NOTE` đặt trong `src/access/roles.ts`.
  - Trường đã có mô tả thì nối thêm vào sau, cách bằng một dấu cách.
- **R9 Không xoá hoặc hạ vai trò người duyệt cuối cùng.**
  - Thông báo: `Phải còn ít nhất một người duyệt.`
  - Đếm bằng `payload.count` trong hook. Race khi hai người duyệt cùng xoá nhau chấp nhận được (2–3 người dùng).
- **R10 `Sources`:**
  - `url` trống hoặc bắt đầu `http://`/`https://`. Thông báo: `Chỉ nhận đường dẫn http:// hoặc https://.`
  - `date` trống hoặc đúng `YYYY-MM-DD` và là ngày có thật. Thông báo: `Ngày phải có dạng YYYY-MM-DD.`
  - Lớp lib cũng bỏ `url` không phải http(s) khỏi view model, vì dữ liệu cũ có thể còn sót.
- **R11 E2E quy trình chạy trên bản build production ở cổng 3100.**
  - Project Playwright mới `workflow`, `dependencies: ['public']`, để bài tạm không lọt vào lúc `public-pages` đang kiểm.
  - Spec tự tạo một biên tập viên và một bài tạm (slug có hậu tố ngẫu nhiên), rồi xoá cả hai ở `afterAll`.
  - Dev server không cache trang, nên không kiểm được revalidate trên đó.
- **R12 Để sang Phase 7 (ghi vào backlog A):**
  - Chặn build production bằng `.env` dev (mode chốt lúc build).
  - Ảnh `next/image` đã tối ưu còn trong cache sau khi thu hồi quyền ảnh.
  - Race bootstrap user đầu tiên.
  - Ba việc này thuộc cấu hình deploy, hoặc chỉ xảy ra ở dev.

## Cấu trúc file

```
src/
  lib/
    routes.ts                         [mới] previewPathFor, safeInternalPath, PREVIEW_ROUTE, PREVIEW_EXIT_ROUTE
    content/
      preview.ts                      [mới] canPreview(headers), getPreviewBar()
      copy/preview.ts                 [mới] previewCopy
      queries.ts                      [sửa] getSources bỏ url không phải http(s)
      index.ts                        [sửa] export canPreview, getPreviewBar, previewCopy type
  hooks/
    revalidate.ts                     [mới] revalidateSite, revalidateAfterChange/AfterDelete, revalidateGlobalAfterChange
  access/
    roles.ts                          [sửa] CONTROL_FIELD_NOTE, controlFieldAdmin()
    publishing.ts                     [sửa] contentCollectionDefaults thêm hook revalidate + admin.preview
  collections/*.ts, globals/*.ts      [sửa] labels, admin.group, mô tả trường kiểm soát, preview, hook
  collections/Users.ts                [sửa] labels, chặn xoá/hạ người duyệt cuối
  collections/Sources.ts              [sửa] validate url/date
  payload.config.ts                   [sửa] admin.meta.titleSuffix
  app/(frontend)/
    preview/route.ts                  [mới]
    preview/exit/route.ts             [mới]
    layout.tsx                        [sửa] render PreviewBar
    styleguide/page.tsx               [sửa] mẫu PreviewBar
  components/layout/PreviewBar.tsx    [mới] client (usePathname)
eslint.config.mjs                     [sửa] thêm src/hooks/** vào khối tầng dữ liệu
playwright.config.ts                  [sửa] project workflow
tests/
  unit/admin-config.test.ts           [mới] nhãn, nhóm, mô tả, hook, preview của mọi collection/global
  unit/routes.test.ts                 [mới]
  unit/revalidate.test.ts             [mới]
  unit/layout/preview-bar.test.tsx    [mới]
  int/sources.int.spec.ts             [mới]
  int/users.int.spec.ts               [sửa] người duyệt cuối
  int/revalidate.int.spec.ts          [mới]
  int/preview.int.spec.ts             [mới] canPreview
  e2e/preview.e2e.spec.ts             [mới] (cổng 3000)
  e2e/workflow.e2e.spec.ts            [mới] (cổng 3100)
docs/superpowers/backlog.md           [sửa] Task 7
```

`tests/unit/admin-config.test.ts` do Task 1 tạo; Task 3 và Task 5 thêm `describe` riêng vào cùng file.

---

### Task 1: Nhãn tiếng Việt, nhóm menu, mô tả trường kiểm soát

**Files:**
- Modify: `src/collections/*.ts`, `src/globals/{SiteSettings,PageIntros}.ts`, `src/access/roles.ts`, `src/payload.config.ts`
- Test: `tests/unit/admin-config.test.ts`

**Interfaces:**
- Produces:
  - `CONTROL_FIELD_NOTE = 'Chỉ người duyệt sửa được.'`, dùng ở Task 2.
  - `controlFieldAdmin(description?: string): { description: string }` trả `description ? \`${description} ${CONTROL_FIELD_NOTE}\` : CONTROL_FIELD_NOTE`.
  - `ADMIN_GROUPS = { content: 'Nội dung', archive: 'Tư liệu', pages: 'Trang', admin: 'Quản trị' } as const`, đặt trong `src/access/roles.ts`.
  - Danh sách collection và global xuất trong `tests/unit/admin-config.test.ts`, các task sau dùng lại.

- [ ] **Step 1: Viết test `tests/unit/admin-config.test.ts`** (`// @vitest-environment node`)

  Import trực tiếp 9 collection và 2 global, không import `@payload-config`.
  - Viết helper `walk(fields)`, duyệt đệ quy `group`, `array`, `row`, `collapsible`, `tabs[].fields`, `blocks[].fields`.
  - Test:
    - `mọi collection có labels singular/plural tiếng Việt`: chuỗi không rỗng, khác slug. Users là `Người dùng`/`Người dùng`.
    - `mọi global có label`: PageIntros là `Phần mở đầu trang`.
    - `mọi collection và global có admin.group thuộc ADMIN_GROUPS`, và bảng nhóm khớp R7, assert bằng `toEqual` trên map slug → group.
    - `mọi trường có name đều có label`: bỏ qua tên bắt đầu bằng `_`. Mỗi option của `select`/`radio` là object có `label`.
    - `trường chỉ người duyệt sửa có mô tả kiểm soát`: mọi trường có `access.update === reviewerOnlyField` thì `String(admin?.description)` kết thúc bằng `CONTROL_FIELD_NOTE`. Ít nhất 11 trường như vậy:
      - People: `consent.name`, `consent.photo`, `consent.quote`, `reviewedBySubject`;
      - ArchiveAssets: `rights`, `subjectConsent`;
      - TimelineEvents: `confidence`;
      - Products: `typeConfirmed`;
      - CraftSteps: `verifiedBy`;
      - Makers: `verified`, `publicConsent`;
      - Users: `role`.

- [ ] **Step 2: Chạy và thấy test fail**

  Run: `fnm exec --using=22.23.4 -- npx vitest run tests/unit/admin-config.test.ts --config ./vitest.config.mts`
  Expected: FAIL, thiếu `labels` của Users, thiếu `admin.group`, thiếu mô tả.

- [ ] **Step 3: Thêm hằng và helper vào `src/access/roles.ts`, rồi sửa từng collection và global cho test qua**

  - **Nhãn:**
    - `Users.labels = { singular: 'Người dùng', plural: 'Người dùng' }`;
    - `PageIntros.label = 'Phần mở đầu trang'`;
    - các collection khác giữ nhãn đang có. Thiếu thì đặt theo tên trong R7.
  - **Mô tả:** trường kiểm soát dùng `admin: { ...admin, ...controlFieldAdmin(admin?.description) }`.
  - **Tiêu đề tab:** `payload.config.ts` đặt `admin.meta = { titleSuffix: ' — Chiếu Hới' }`. Kiểm tên khoá trong kiểu `Config['admin']['meta']` của Payload 3.92 trước khi viết.

- [ ] **Step 4: Chạy lại test, chạy lint và kiểm type**

  Run:
  - `fnm exec --using=22.23.4 -- npx vitest run tests/unit/admin-config.test.ts --config ./vitest.config.mts`
  - `bash -c "fnm exec --using=22.23.4 -- npm run lint && fnm exec --using=22.23.4 -- npx tsc --noEmit"`

  Expected: PASS, không lỗi.

- [ ] **Step 5: Kiểm không đổi schema**

  Run: `fnm exec --using=22.23.4 -- npm run generate:types`, rồi `git diff --stat src/payload-types.ts`.

  Expected: chỉ đổi nhãn hoặc chú thích, hoặc không đổi gì. Không có trường mới. Nếu `payload-types.ts` đổi, commit cùng task.

- [ ] **Step 6: Commit** `feat(phase-6): nhãn tiếng Việt, nhóm menu và mô tả trường kiểm soát trong admin`

---

### Task 2: Chặn dữ liệu sai trong admin (Sources, người duyệt cuối)

**Files:**
- Modify: `src/collections/Sources.ts`, `src/collections/Users.ts`, `src/lib/content/queries.ts` (`getSources` và chỗ dựng `SourceView.url`)
- Test: `tests/int/sources.int.spec.ts` (mới), `tests/int/users.int.spec.ts`, `tests/unit/visibility.test.ts` (hoặc file unit gần nhất của helper mới)

**Interfaces:**
- Produces:
  - `isHttpUrl(v: unknown): boolean` trong `src/lib/content/visibility.ts`;
  - `validateHttpUrl` và `validateIsoDate` (kiểu `TextFieldSingleValidation` của Payload) trong `src/collections/Sources.ts`, xuất để test.

- [ ] **Step 1: Viết test int**

  - **`tests/int/sources.int.spec.ts`** (theo mẫu `tests/int/content.int.spec.ts`, `resetDb` + `makeUser`):
    - `url javascript: bị từ chối`: tạo nguồn `url: 'javascript:alert(1)'` → `rejects.toThrow(/Chỉ nhận đường dẫn http/)`.
    - `url https và trống được nhận`: tạo được.
    - `date sai dạng bị từ chối`: `'14/08/2026'` và `'2026-02-30'` → `rejects.toThrow(/YYYY-MM-DD/)`. Còn `'2026-08-14'` và trống thì tạo được.
    - `getSources bỏ url không phải http`: chèn thẳng bằng `payload.db.updateOne`, hoặc tạo với `context: { skipValidation }` nếu cần, một nguồn có `url = 'ftp://x'`. Khi đó `getSources('public')[0].url === null`.
  - **`tests/int/users.int.spec.ts`**, thêm:
    - `không xoá được người duyệt cuối cùng`: chỉ có 1 reviewer, `payload.delete({ collection: 'users', id, user: reviewer, overrideAccess: false })` → `rejects.toThrow(/Phải còn ít nhất một người duyệt/)`.
    - `không hạ vai trò người duyệt cuối cùng`: update `role: 'editor'` → cùng lỗi.
    - `còn người duyệt khác thì xoá được`: có 2 reviewer, xoá 1 → thành công.

- [ ] **Step 2: Chạy và thấy test fail**

  Run: `fnm exec --using=22.23.4 -- npm run test:int -- tests/int/sources.int.spec.ts tests/int/users.int.spec.ts`

- [ ] **Step 3: Cài đặt**

  - **Sources:**
    - `validate` cho `url` và `date` theo R10.
    - Ngày có thật: dựng `new Date(Date.UTC(y, m-1, d))` rồi so lại y/m/d.
    - Đổi mô tả `date` thành `Dạng YYYY-MM-DD. Để trống nếu chưa rõ.`
  - **Users:**
    - `beforeDelete` chặn khi bản ghi bị xoá là reviewer và `count({ where: { role: { equals: 'reviewer' } } })` ≤ 1.
    - `beforeChange` (operation `update`) chặn khi `originalDoc.role === 'reviewer'`, `data.role === 'editor'` và số reviewer ≤ 1.
    - Ném `ValidationError` (giống ArchiveAssets) với `path: 'role'` khi hạ vai trò. Khi xoá, ném `APIError('Phải còn ít nhất một người duyệt.', 400)`.
  - **lib:** dựng `SourceView.url` bằng `isHttpUrl(d.url) ? d.url : null`. `isHttpUrl` dùng `/^https?:\/\/[^\s]+$/i`.

- [ ] **Step 4: Chạy lại int, rồi chạy cả bộ unit**

  Run:
  - `fnm exec --using=22.23.4 -- npm run test:int -- tests/int/sources.int.spec.ts tests/int/users.int.spec.ts tests/int/seed.int.spec.ts`
  - `fnm exec --using=22.23.4 -- npm run test:unit`

  Expected: PASS. Seed vẫn qua vì cả 3 nguồn seed là https và ngày đúng dạng.

- [ ] **Step 5: Commit** `feat(phase-6): kiểm url/ngày của nguồn, giữ ít nhất một người duyệt`

---

### Task 3: Đường dẫn xem trước và nút "Xem trước" trong admin

**Files:**
- Create: `src/lib/routes.ts`, `tests/unit/routes.test.ts`
- Modify:
  - `src/access/publishing.ts`: `contentCollectionDefaults` không chứa `admin`, vì mỗi collection tự có `admin`. Thêm helper `previewFor(slug)`.
  - 7 collection nội dung, `ArchiveAssets`, 2 global;
  - `tests/unit/admin-config.test.ts`.

**Interfaces:**
- Produces:
  - `PREVIEW_ROUTE = '/preview'`, `PREVIEW_EXIT_ROUTE = '/preview/exit'`.
  - `type PreviewCollection = 'stories' | 'people' | 'products' | 'craft-steps' | 'timeline-events' | 'makers' | 'archive-assets' | 'site-settings' | 'page-intros'`.
  - `previewPathFor(slug: PreviewCollection, doc: Record<string, unknown>): string | null`, theo bảng R5.
  - `safeInternalPath(raw: string | null | undefined): string`, theo Global Constraints. Giải mã một lần bằng `decodeURIComponent` trong try/catch trước khi kiểm, để chặn `/%2F%2Fevil`.
  - `previewUrl(path: string): string` trả `${PREVIEW_ROUTE}?path=${encodeURIComponent(path)}`.
  - `previewFor(slug: PreviewCollection): GeneratePreviewURL` trong `src/access/publishing.ts`. Trả `previewUrl(p)` hoặc `null`.

- [ ] **Step 1: Viết test `tests/unit/routes.test.ts`**

  ```ts
  it.each([
    ['stories', { slug: 'chuyen-a', workflow: 'draft' }, '/cau-chuyen/chuyen-a'],
    ['stories', { slug: 'y-tuong', workflow: 'idea' }, '/cau-chuyen'],
    ['stories', { workflow: 'draft' }, '/cau-chuyen'],
    ['people', { slug: 'ba-a' }, '/con-nguoi/ba-a'],
    ['products', { slug: 'chieu 1' }, '/san-pham/chieu%201'],
    ['craft-steps', {}, '/nghe-det-chieu'],
    ['timeline-events', {}, '/lang-hoi'],
    ['makers', {}, '/san-pham'],
    ['archive-assets', { inArchive: true, code: 'TL-001' }, '/thu-vien?anh=TL-001'],
    ['archive-assets', { inArchive: false, code: 'TL-001' }, null],
    ['archive-assets', { inArchive: true }, null],
    ['site-settings', {}, '/'],
    ['page-intros', {}, '/'],
  ])('previewPathFor %s', (slug, doc, out) => expect(previewPathFor(slug as PreviewCollection, doc)).toBe(out))

  it.each([
    ['/cau-chuyen/a', '/cau-chuyen/a'],
    ['/thu-vien?anh=TL-001', '/thu-vien?anh=TL-001'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    ['https://evil.example', '/'],
    ['/%2F%2Fevil.example', '/'],
    ['javascript:alert(1)', '/'],
    ['', '/'],
    [null, '/'],
    ['/admin/collections/users', '/'],
    ['/api/users', '/'],
    ['/a\nb', '/'],
  ])('safeInternalPath(%j)', (raw, out) => expect(safeInternalPath(raw)).toBe(out))

  it('previewUrl mã hoá path', () => expect(previewUrl('/thu-vien?anh=TL-001')).toBe('/preview?path=%2Fthu-vien%3Fanh%3DTL-001'))
  ```

  Thêm vào `admin-config.test.ts` một `describe('xem trước')`:
  - `admin.preview` là hàm ở 7 collection nội dung, `archive-assets` và 2 global;
  - `sources` và `users` không có `admin.preview`;
  - `Stories.admin.preview({ slug: 'a', workflow: 'draft' }, {} as never)` trả `'/preview?path=%2Fcau-chuyen%2Fa'`.

- [ ] **Step 2: Chạy và thấy test fail**

  Run: `fnm exec --using=22.23.4 -- npx vitest run tests/unit/routes.test.ts tests/unit/admin-config.test.ts --config ./vitest.config.mts`

- [ ] **Step 3: Viết `src/lib/routes.ts`, rồi gắn `admin.preview: previewFor('<slug>')` vào từng config**

- [ ] **Step 4: Chạy lại test, lint và kiểm type**

  Run: các lệnh ở Step 2, rồi `bash -c "fnm exec --using=22.23.4 -- npm run lint && fnm exec --using=22.23.4 -- npx tsc --noEmit"`.

  Expected: PASS.

- [ ] **Step 5: Commit** `feat(phase-6): nút Xem trước trên từng bản ghi trong admin`

---

### Task 4: Route xem trước (Draft Mode) và `PreviewBar`

**Files:**
- Create:
  - `src/lib/content/preview.ts`, `src/lib/content/copy/preview.ts`;
  - `src/app/(frontend)/preview/route.ts`, `src/app/(frontend)/preview/exit/route.ts`;
  - `src/components/layout/PreviewBar.tsx`;
  - `tests/unit/layout/preview-bar.test.tsx`, `tests/int/preview.int.spec.ts`, `tests/e2e/preview.e2e.spec.ts`.
- Modify: `src/lib/content/index.ts`, `src/lib/content/mode.ts` (nếu cần tách `isDraftMode`), `src/app/(frontend)/layout.tsx`, `src/app/(frontend)/styleguide/page.tsx`, `tests/unit/copy.test.ts` (nếu bộ test copy liệt kê file copy).

**Interfaces:**
- Consumes: `safeInternalPath`, `PREVIEW_EXIT_ROUTE` (Task 3).
- Produces:
  - `previewCopy = { label: 'Bạn đang xem bản xem trước, gồm cả nội dung chưa đăng.', exit: 'Thoát xem trước' } as const`.
  - `type PreviewBarView = { label: string; exitLabel: string; exitRoute: string }`.
  - `canPreview(headers: Headers): Promise<boolean>`: `payload.auth({ headers })` có user thì true; lỗi thì false.
  - `getPreviewBar(): Promise<PreviewBarView | null>`: chỉ khác null khi `(await draftMode()).isEnabled`.
  - Component `PreviewBar({ view }: { view: PreviewBarView })`, client. Link thoát là `${exitRoute}?path=${encodeURIComponent(pathname + search)}`, dùng `usePathname` và `useSearchParams`.
    - `useSearchParams` cần `<Suspense>` ở layout khi trang tĩnh. Kiểm cảnh báo build Next 16. Nếu cần, chỉ dùng `usePathname` và chấp nhận mất `?anh=`.

- [ ] **Step 1: Viết test**

  - **Unit `preview-bar.test.tsx`**, mock `next/navigation`:
    - render chữ `previewCopy.label`;
    - link `Thoát xem trước` có `href="/preview/exit?path=%2Fcau-chuyen%2Fa"` khi pathname là `/cau-chuyen/a`;
    - phần tử gốc là `<aside>` có `aria-label="Chế độ xem trước"`.
  - **Int `preview.int.spec.ts`:**
    - `canPreview(new Headers())` → false;
    - header `Authorization: JWT <token>` của user đăng nhập bằng `payload.login` → true;
    - header `Cookie: payload-token=abc` → false.
  - **E2E `preview.e2e.spec.ts`** (project chromium, cổng 3000):
    - `chưa đăng nhập: /preview trả 401 và không đặt cookie __prerender_bypass`: dùng `page.request.get('/preview?path=/', { maxRedirects: 0 })`. Status 401; trong `context.cookies()` không có `__prerender_bypass`.
    - `người duyệt: /preview?path=/cau-chuyen bật Draft Mode, hiện PreviewBar, thoát thì mất`:
      - gọi `loginReviewer`, rồi `goto('/preview?path=/cau-chuyen')`;
      - URL cuối là `/cau-chuyen`, `getByRole('complementary', { name: 'Chế độ xem trước' })` hiện;
      - bấm `Thoát xem trước` → URL vẫn `/cau-chuyen`, thanh biến mất.
    - `path ngoài bị đưa về /`: `goto('/preview?path=//evil.example')` → `new URL(page.url()).pathname === '/'` và host vẫn là localhost.

- [ ] **Step 2: Chạy và thấy test fail**

  Run:
  - `fnm exec --using=22.23.4 -- npx vitest run tests/unit/layout/preview-bar.test.tsx --config ./vitest.config.mts`
  - `fnm exec --using=22.23.4 -- npm run test:int -- tests/int/preview.int.spec.ts`

- [ ] **Step 3: Cài đặt**

  - **`/preview` GET:**
    - `if (!(await canPreview(request.headers)))` → `new Response('Cần đăng nhập trang quản trị để xem trước.', { status: 401, headers: { 'Cache-Control': 'no-store' } })`.
    - Ngược lại `(await draftMode()).enable()`, rồi `redirect(safeInternalPath(url.searchParams.get('path')))`.
  - **`/preview/exit` GET:** `(await draftMode()).disable()` rồi redirect tương tự. Không cần đăng nhập.
  - **Layout:**
    - `const previewBar = await getPreviewBar()`, render `{previewBar && <PreviewBar view={previewBar} />}` ngay trước `SiteHeader`.
    - Đặt trong landmark riêng, không nằm trong `header`/`main`.
  - **Style `PreviewBar`:**
    - `bg-bg-ink text-text-on-dark`, chữ cỡ `text-caption` hoặc `text-meta` có sẵn trong `@theme` (không viết cứng `text-[13px]`), padding theo lưới;
    - link gạch chân, vùng chạm ≥ 44px trên mobile;
    - focus vàng trên nền tối.
  - **Styleguide:** thêm mẫu `PreviewBar` vào `/styleguide` (mục layout).

- [ ] **Step 4: Chạy test unit, int và e2e của task**

  Run:
  - `fnm exec --using=22.23.4 -- npx vitest run tests/unit/layout/preview-bar.test.tsx --config ./vitest.config.mts`
  - `fnm exec --using=22.23.4 -- npm run test:int -- tests/int/preview.int.spec.ts`
  - `fnm exec --using=22.23.4 -- npm run test:e2e -- --project=chromium tests/e2e/preview.e2e.spec.ts tests/e2e/styleguide.e2e.spec.ts`

  Expected: PASS.

- [ ] **Step 5: Chạy lint và build**

  Run: `bash -c "fnm exec --using=22.23.4 -- npm run lint && fnm exec --using=22.23.4 -- npm run build"`

  Expected: build thành công.
  - Các route `/`, `/san-pham`, `/ket-noi`… vẫn ở dạng tĩnh (`○`/`●`), không bị đẩy thành động chỉ vì layout gọi `draftMode()`.
  - Nếu Next 16 đẩy chúng thành động, ghi vào report và giữ nguyên. Controller sẽ ra ruling.

- [ ] **Step 6: Commit** `feat(phase-6): xem trước bằng Draft Mode và thanh báo xem trước`

---

### Task 5: Revalidate khi lưu và xoá

**Files:**
- Create: `src/hooks/revalidate.ts`, `tests/unit/revalidate.test.ts`, `tests/int/revalidate.int.spec.ts`
- Modify:
  - `src/access/publishing.ts` (`contentCollectionDefaults.hooks.afterChange/afterDelete`);
  - `src/collections/ArchiveAssets.ts`, `src/collections/Sources.ts`, `src/globals/{SiteSettings,PageIntros}.ts`;
  - `eslint.config.mjs` (thêm `src/hooks/**` vào khối tầng dữ liệu);
  - `tests/unit/architecture.test.ts` (một ca cho `src/hooks`);
  - `tests/unit/admin-config.test.ts`.

**Interfaces:**
- Produces:
  - `type Revalidator = (path: string, type: 'layout') => void`.
  - `revalidateSite(req: PayloadRequest, revalidate: Revalidator = revalidatePath): void`:
    - bỏ qua khi `req.context?.disableRevalidate === true`;
    - gọi `revalidate('/', 'layout')` trong try/catch, lỗi thì `req.payload.logger.debug(...)`.
  - `revalidateAfterChange: CollectionAfterChangeHook` trả `doc`.
  - `revalidateAfterDelete: CollectionAfterDeleteHook` trả `doc`.
  - `revalidateGlobalAfterChange: GlobalAfterChangeHook` trả `doc`.

- [ ] **Step 1: Viết test**

  - **Unit `revalidate.test.ts`** (dùng `vi.fn()` làm revalidator):
    - `gọi revalidate('/', 'layout') một lần`;
    - `bỏ qua khi context.disableRevalidate`;
    - `nuốt lỗi và ghi debug`: revalidator ném lỗi → không ném ra ngoài, `logger.debug` được gọi.
    - Để test được ba hook mà không gọi `revalidatePath` thật, mock `next/cache` bằng `vi.mock`. Kiểm mỗi hook gọi `revalidatePath` và trả đúng `doc`.
  - **`admin-config.test.ts`**, thêm `describe('revalidate')`:
    - 7 collection nội dung, `archive-assets` và `sources` có `revalidateAfterChange` trong `hooks.afterChange` và `revalidateAfterDelete` trong `hooks.afterDelete`;
    - 2 global có `revalidateGlobalAfterChange`;
    - `users` không có.
  - **`architecture.test.ts`:** `src/hooks/x.ts` import `@/components/ui/Button` → có lỗi `RULE`.
  - **Int `revalidate.int.spec.ts`:** chạy ngoài request Next.
    - Tạo, đăng, sửa, xoá một story; `updateGlobal('site-settings')`; tạo một nguồn. Mọi thao tác resolve, không ném lỗi.

- [ ] **Step 2: Chạy và thấy test fail**

  Run: `fnm exec --using=22.23.4 -- npx vitest run tests/unit/revalidate.test.ts tests/unit/admin-config.test.ts tests/unit/architecture.test.ts --config ./vitest.config.mts`

- [ ] **Step 3: Cài đặt và gắn hook**

  - ArchiveAssets đã có `hooks` riêng: thêm `afterChange`/`afterDelete` vào object đó, giữ các hook cũ.
  - Global giữ `beforeOperation`/`beforeChange` đang có.

- [ ] **Step 4: Chạy test unit, int và lint**

  Run:
  - `fnm exec --using=22.23.4 -- npm run test:unit`
  - `fnm exec --using=22.23.4 -- npm run test:int -- tests/int/revalidate.int.spec.ts tests/int/publishing.int.spec.ts tests/int/globals.int.spec.ts`
  - `fnm exec --using=22.23.4 -- npm run lint`

  Expected: PASS.

- [ ] **Step 5: Commit** `feat(phase-6): revalidate trang công khai khi lưu, gỡ đăng và xoá`

---

### Task 6: E2E quy trình hai vai trò trên bản build production

**Files:**
- Create: `tests/e2e/workflow.e2e.spec.ts`
- Modify: `playwright.config.ts`
  - thêm project `workflow`: `testMatch: /workflow\.e2e/`, `baseURL: 'http://localhost:3100'`, `dependencies: ['public']`;
  - project `chromium` thêm `workflow\.e2e` vào `testIgnore`.

**Interfaces:**
- Consumes:
  - `loginReviewer` từ `tests/e2e/helpers`: cookie người duyệt seed, dùng được ở 3100 vì cùng `localhost`, cùng DB, cùng `PAYLOAD_SECRET`;
  - nút "Xem trước" (Task 3), `/preview` và `PreviewBar` (Task 4), revalidate (Task 5).

- [ ] **Step 1: Viết spec `test.describe.configure({ mode: 'serial' })`**

  Dùng hai context: `reviewer` (cookie người duyệt) và `editor` (đăng nhập bằng tài khoản tạm). Kiểm trang công khai bằng `browser.newContext()` sạch, không cookie.
  - **`beforeAll`:** người duyệt tạo user tạm qua REST `POST /api/users`, `role: 'editor'`, email `editor-e2e-<rand>@example.com`. Context editor đăng nhập qua `POST /api/users/login`.
  - **`afterAll`:** người duyệt xoá story tạm (nếu còn) và user tạm qua REST. Bọc `try/finally` để luôn dọn.
  - **Test 1 — `biên tập viên tạo nháp, gửi duyệt, không đăng được`:**
    - Editor mở `/admin/collections/stories/create`, nhập `Tiêu đề` và `Đường dẫn` (`e2e-quy-trinh-<rand>`), chọn `Quy trình` = `Chờ duyệt`, bấm nút lưu nháp.
    - Tên nút lấy từ bản dịch vi của Payload 3.92. Tra `node_modules/@payloadcms/translations/dist/languages/vi.js` (`saveDraft`, `publishChanges`), không đoán.
    - Editor gửi `PATCH /api/stories/:id` với `{ _status: 'published' }` → status 403.
    - Context sạch `GET /cau-chuyen/e2e-quy-trinh-<rand>` → 404.
  - **Test 2 — `người duyệt xem trước bản nháp từ admin`:**
    - Reviewer mở trang sửa của story, bấm nút `Xem trước` (tên lấy từ bản dịch vi), bắt tab mới bằng `context.waitForEvent('page')`.
    - Tab mới ở `/cau-chuyen/e2e-quy-trinh-<rand>`, có `heading` level 1 chứa tiêu đề, có `complementary` "Chế độ xem trước".
  - **Test 3 — `người duyệt đăng → công khai hiện ngay; biên tập viên lưu nháp không lộ; người duyệt đăng bản sửa → công khai đổi`:**
    - Reviewer bấm nút đăng trong admin. Context sạch thấy `heading` tiêu đề ở `/cau-chuyen/<slug>`, và thẻ có tiêu đề đó ở `/cau-chuyen`.
    - Editor sửa tiêu đề thành `… (nháp)` rồi lưu nháp. Context sạch vẫn thấy tiêu đề cũ ở `/cau-chuyen/<slug>`.
    - Reviewer đăng bản sửa. Context sạch thấy tiêu đề mới. Dùng `expect.poll` với timeout 15s, vì sau revalidate lượt xem đầu có thể còn trả bản cũ trong lúc dựng lại.
  - **Test 4 — `gỡ đăng và xoá biến khỏi công khai`:**
    - Reviewer gỡ đăng qua admin (thao tác "Gỡ đăng" trong menu của nút đăng). Context sạch: `/cau-chuyen/<slug>` → 404 và `/cau-chuyen` không còn thẻ, dùng `expect.poll`.
    - Reviewer đăng lại qua REST rồi xoá qua REST. Context sạch → 404.
  - **Test 5 — `sửa Thông tin site hiện ở /ket-noi`:**
    - Reviewer đọc email hiện tại của `site-settings` qua REST.
    - Đặt `email: 'e2e-<rand>@example.com'` và đăng qua REST (`POST /api/globals/site-settings?draft=false` với `_status: 'published'`).
    - Context sạch thấy email đó ở `/ket-noi`.
    - `finally` trả lại giá trị cũ và đăng lại.

- [ ] **Step 2: Chạy**

  Bản build ở 3100 phải có code của Phase 6. `reuseExistingServer` sẽ dùng lại server cũ nếu đang chạy (backlog Phase 3), nên trước khi chạy phải tắt mọi tiến trình đang nghe 3100.

  Run:
  - `bash -c "lsof -ti tcp:3100 | xargs -r kill"`
  - `fnm exec --using=22.23.4 -- npm run test:e2e -- --project=public --project=workflow`

  Expected: PASS cả hai project. `public-pages` không bị ảnh hưởng.

- [ ] **Step 3: Chạy lại toàn bộ e2e**

  Run: `fnm exec --using=22.23.4 -- npm run test:e2e`

  Expected: số test qua bằng trước cộng thêm các test mới, không có lỗi mới. Ca lỗi chập chờn đã biết ở `stories.e2e` 1440 thì chạy lại một lần và ghi vào report.

- [ ] **Step 4: Commit** `test(phase-6): e2e quy trình biên tập viên → người duyệt trên bản production`

---

### Task 7: Rà soát cuối phase

**Files:**
- Modify: `docs/superpowers/backlog.md`

- [ ] **Step 1: Seed trên DB trống chạy hết**, không lỗi và không lặp cảnh báo revalidate ở mức `warn`/`error`.

  Run: `bash -c "docker compose exec -T postgres psql -U postgres -c 'DROP DATABASE IF EXISTS chieuhoi_p6' -c 'CREATE DATABASE chieuhoi_p6' && DATABASE_URI=postgres://postgres:postgres@localhost:5433/chieuhoi_p6 APP_ENV=development fnm exec --using=22.23.4 -- npm run seed"`, rồi xoá DB `chieuhoi_p6`.

  Tên service postgres lấy từ `docker-compose.yml`.

- [ ] **Step 2: Cập nhật backlog**

  - **Đánh dấu `[x]` các mục đã xong**, kèm "(Phase 6)":
    - `Sources.url`;
    - `Sources.date`;
    - "reviewer cuối cùng tự xoá được mình" (tách khỏi mục race bootstrap, phần race vẫn mở);
    - `/ket-noi` đọc SiteSettings lúc build: phần "sửa trong admin không thấy ngay" đã xong nhờ revalidate.
  - **Mục mode chốt lúc build:** ghi rõ phần đã giải (preview qua Draft Mode, cập nhật qua revalidate) và phần còn lại cho Phase 7 (chặn build bằng `.env` dev).
  - **Đối chiếu các mục C Phase 5b với code hiện tại**, đánh dấu những mục đã sửa ở commit `fd68826` và `8ca48f7`:
    - focus `PatternExplorer`, `aria-hidden` của điểm ẩn;
    - nhãn "n · tiêu đề" vào lib;
    - `archive.ts` Xưa/Nay và `_payload`;
    - `docNumber ?? code` lặp trong `ArchiveGallery`;
    - cơ sở dệt đã đăng mà không có liên hệ.
    Mỗi mục phải mở file kiểm trước khi đánh dấu.
  - **Thêm vào A** (R12): cache ảnh `next/image` sau khi thu hồi quyền ảnh.
  - **Thêm vào D:** ruling R1–R12 của Phase 6, và mọi ruling phát sinh khi chạy.
  - **Đổi dòng đầu** thành "sau Phase 1–6".

- [ ] **Step 3: Chạy toàn bộ kiểm tra**

  Run: `bash -c "fnm exec --using=22.23.4 -- npm run lint && fnm exec --using=22.23.4 -- npx tsc --noEmit && fnm exec --using=22.23.4 -- npm run test:unit && fnm exec --using=22.23.4 -- npm run test:int && fnm exec --using=22.23.4 -- npm run build"`

  Expected: tất cả qua.

- [ ] **Step 4: Chụp màn hình** vào `$SHOTS_DIR/phase6/`, ở 1440 và 390:
  - trang danh sách `/admin/collections/stories` (menu nhóm tiếng Việt);
  - trang sửa một story có nút Xem trước;
  - trang sửa một Person đăng nhập bằng biên tập viên (trường kiểm soát chỉ đọc, có mô tả);
  - `/cau-chuyen` sau khi bật xem trước (có `PreviewBar`).

  Viết bằng một spec tạm hoặc script Playwright trong scratchpad, không commit.

- [ ] **Step 5: Commit** `docs(phase-6): cập nhật backlog sau Phase 6`
