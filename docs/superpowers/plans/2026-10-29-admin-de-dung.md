# Chiếu Hới — Admin dễ dùng cho người trong làng — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người trong làng, dùng máy tính hoặc điện thoại, tự vào admin và làm việc được nhờ bốn thay đổi:
- nhận diện Chiếu Hới;
- trang đầu có nút cho việc thường làm;
- menu gọn theo vai trò;
- trang Hướng dẫn có ảnh chụp đánh dấu chỗ cần bấm.

Hết plan thì dừng để người dùng xem.

**Architecture:**
- **Tầng mới `src/admin/`** chứa giao diện tuỳ biến của Payload admin, và chỉ phục vụ admin, không phục vụ site công khai.
  - Đây là tầng Payload, ngang hàng với `collections`/`access`. Nó được import `payload`, `@payloadcms/ui`, `@payloadcms/next`, `@/access/*`, `@/lib/env`.
  - Nó **không** import `@/components/*`, `@/app/*`, `@/lib/content`. Lint chặn điều này.
  - Spec ghi `src/components/admin/`, nhưng `src/components` bị cấm import Payload (CLAUDE.md#Kiến trúc), còn các component này bắt buộc phải gọi Payload. Vì vậy dời sang `src/admin/` (ruling A1).
- **Ẩn theo vai trò:** không dùng `admin.hidden`. Ở bản 3.92, `admin.hidden` loại collection khỏi `visibleEntities`, nên view tài liệu trả 404 (`views/Document/index.js` dòng ~208) và hộp "Thêm mới" của ô quan hệ hỏng theo (ruling A2). Thay vào đó:
  - `admin.components.Nav` là một server component bọc `DefaultNav` của `@payloadcms/next/rsc`, truyền `visibleEntities` đã lọc;
  - trang đầu dùng widget riêng lọc cùng một hàm.
- **Trang đầu:** dùng dashboard dạng widget của Payload 3.92 (`admin.dashboard.widgets` + `defaultLayout({ req })`), gồm ba widget:
  - "Việc thường làm";
  - "Đang chờ duyệt" (chỉ người duyệt);
  - "Tất cả mục" (thẻ mục đã lọc theo vai trò).
- **Hướng dẫn:** view admin tuỳ biến tại `/admin/huong-dan`.
  - Nội dung là dữ liệu có kiểu trong `src/admin/guide/sections.ts`.
  - Ảnh nằm trong `public/admin-guide/`, do một spec Playwright chụp trên bản build trỏ vào DB test, với dữ liệu mẫu do seeder riêng tạo (ảnh tự sinh bằng `sharp`).

**Tech Stack:** Node 22.23.4, Next 16.4.3, React 19, Payload 3.92.0, Tailwind 4 (chỉ cho site; admin dùng SCSS `custom.scss`), Vitest, Playwright 1.64.1, `@axe-core/playwright`.
- Không thêm gói mới.
- Đọc API trong `node_modules` trước khi dùng, không đoán:
  - kiểu `Widget`/`DashboardConfig`/`WidgetInstance` (`payload/dist/config/types.d.ts` ~606–650);
  - `DefaultNav` (`@payloadcms/next/dist/elements/Nav/index.js`);
  - widget `CollectionCards` (`@payloadcms/ui/dist/widgets/CollectionCards/index.js`);
  - `admin.components.views.<key>` với `path`;
  - `admin.components.graphics`, `afterLogin`, `afterNavLinks`, `providers`;
  - `admin.theme`.

**Spec:** `docs/superpowers/specs/2026-10-29-admin-de-dung-design.md`. Đọc kèm `CLAUDE.md` ("Kiến trúc", "Component dùng chung", "Quy tắc giao diện") và `design/tokens/tokens.css`.

## Global Constraints

- **Mọi quy tắc trong `CLAUDE.md` áp dụng.**
  - Chữ ≥ 12px.
  - Vùng chạm ≥ 44×44px trên mobile.
  - Focus nhìn thấy: viền 2px `--focus-light`.
  - Màu chữ chỉ lấy từ token, đạt WCAG AA.
  - Bo góc 0, không bóng đổ, không gradient.
  - Noto Serif Display chỉ dùng từ 20px trở lên.
- **`src/admin/**` không import** `@/components/*`, `@/app/*`, `@/lib/content*`. Thêm vào `eslint.config.mjs` và `tests/unit/architecture.test.ts` (Task 1).
- **Không đổi form nhập liệu:** không đổi trường, nhãn, mô tả, thứ tự hay quyền (`access`). Chỉ đổi giao diện vỏ: logo, màu, menu, trang đầu, trang đăng nhập, trang hướng dẫn.
- **Không đổi quyền dữ liệu.** Ẩn chỉ là ẩn khỏi menu và trang đầu. URL vẫn mở theo `access`.
- **Ảnh tham khảo không bao giờ xuất hiện trong ảnh hướng dẫn.**
  - Ảnh hướng dẫn chỉ chụp trên DB `chieuhoi_test`, với dữ liệu do `src/seed/guide.ts` tạo. Ảnh trong dữ liệu đó sinh bằng `sharp`: ô màu token, không phải ảnh thật.
  - Không bao giờ chụp trên DB dev.
- **Không in mật khẩu, secret hay token.** Tài khoản mẫu cho hướng dẫn dùng email `@example.com` và mật khẩu ngẫu nhiên sinh lúc chạy. Không email nào xuất hiện trên ảnh chụp ngoài email mẫu đó.
- **Chữ tiếng Việt cố định:**
  - Logo: `CHIẾU HỚI`, dòng phụ `Quản lý nội dung`.
  - Icon: `CH`.
  - Trang đăng nhập: `Quên mật khẩu? Nhờ người duyệt đặt lại.`
  - Widget: `Việc thường làm`, `Đang chờ duyệt`, `Tất cả mục`.
  - Nút: `Tải ảnh lên`, `Viết bài mới`, `Thêm người`, `Thêm sản phẩm`, `Xem hướng dẫn`.
  - Khi số chờ duyệt bằng 0: `Không có bài nào chờ duyệt`.
  - Link menu: `Hướng dẫn`.

## Review Focus

1. **Biên tập viên thêm nguồn từ form Bài viết** (nút "+" ở ô "Nguồn") phải vẫn mở hộp tạo mới và lưu được, dù "Nguồn" đã ẩn khỏi menu. Test ở Task 2.
2. **Người dùng đã tự sắp lại dashboard** (Payload lưu bố cục widget vào preferences): khi vai trò đổi từ người duyệt sang biên tập viên, widget "Đang chờ duyệt" không được lộ số liệu. Widget tự kiểm vai trò lúc render, không chỉ dựa vào `defaultLayout`. Test ở Task 3.
3. **Trang tài khoản `/admin/account` của biên tập viên** (đổi mật khẩu của chính mình) vẫn mở được dù "Người dùng" đã ẩn. Test ở Task 2.
4. **Trang Hướng dẫn mở trên điện thoại 390px** không cuộn ngang. Ảnh co theo bề ngang, chữ ≥ 12px. Test ở Task 5.
5. **Chữ in đậm trong hướng dẫn khớp với chữ trên màn hình.** Nếu Payload đổi nhãn ở bản sau thì phải phát hiện được. Test ở Task 5 so chữ in đậm với danh sách nhãn chụp được lúc chạy script ảnh.

---

### Task 1: Tầng `src/admin`, nhận diện Chiếu Hới và trang đăng nhập

**Files:**
- Create: `src/admin/Logo.tsx`, `src/admin/Icon.tsx`, `src/admin/AdminFonts.tsx`, `src/admin/LoginHelp.tsx`
- Modify: `src/payload.config.ts` (admin.components.graphics, providers, afterLogin; `admin.theme: 'light'`), `src/app/(payload)/custom.scss`, `src/app/(payload)/admin/importMap.js` (sinh lại bằng `npx payload generate:importmap`), `eslint.config.mjs`
- Test: `tests/unit/admin/branding.test.tsx`, `tests/unit/architecture.test.ts`, `tests/e2e/admin-ui.e2e.spec.ts` (tạo mới)

**Interfaces:**
- Produces:
  - quy tắc lint cho `src/admin/**`;
  - thư mục `tests/unit/admin/`;
  - file e2e `tests/e2e/admin-ui.e2e.spec.ts` (project `chromium`, dev :3000), các task sau thêm test vào đây;
  - biến CSS `--admin-font-body`, `--admin-font-display`.

- [ ] **Step 1: Test kiến trúc.** Trong `tests/unit/architecture.test.ts` thêm:
  - `it('admin không được import component của site')`: `rulesFor('src/admin/Bad.tsx', "import { Button } from '@/components/ui/Button'\nexport default Button\n")` chứa `RULE`;
  - tương tự cho `@/lib/content`;
  - `it('admin được import @payloadcms/ui và @/access')`: kết quả `[]`.
- [ ] **Step 2: Chạy, thấy FAIL.** `npm run test:unit -- tests/unit/architecture.test.ts`
- [ ] **Step 3: Thêm khối lint `files: ['src/admin/**']`** trong `eslint.config.mjs`.
  - Cấm `@/components/*`, `@/app/*`, `@/lib/content`, `@/lib/content/*`.
  - Thông báo: `Admin không dùng component/dữ liệu của site. Xem CLAUDE.md#Kiến trúc.`
  - Chạy lại thấy PASS.
- [ ] **Step 4: Unit test nhận diện** (`tests/unit/admin/branding.test.tsx`):
  - `Logo` render chữ `CHIẾU HỚI` và `Quản lý nội dung`;
  - `Icon` render `CH`, có `aria-hidden` hoặc nhãn ẩn `Chiếu Hới`;
  - `LoginHelp` render đúng chữ `Quên mật khẩu? Nhờ người duyệt đặt lại.` và không chứa thẻ `<a>`.
  - Chạy thấy FAIL.
- [ ] **Step 5: Viết `Logo`, `Icon`, `LoginHelp`** (server component, không state).
  - `AdminFonts` là provider dùng `next/font/google`:
    - Be Vietnam Pro 400/500/600 và Noto Serif Display 400;
    - `subsets: ['vietnamese','latin']`, `variable` đặt tên `--admin-font-body` / `--admin-font-display`;
    - bọc children trong `<div className={…} style={{ display: 'contents' }}>`.
  - Đăng ký trong `payload.config.ts`:
    - `admin.components.graphics.Logo` / `Icon`;
    - `providers: ['@/admin/AdminFonts#AdminFonts']` (hoặc đường dẫn theo `importMap.baseDir`; xem cách các path khác được viết);
    - `afterLogin: [LoginHelp]`;
    - `admin.theme: 'light'`.
  - Sinh lại importMap.
- [ ] **Step 6: `custom.scss`.**
  - Ghi đè biến Payload trong `:root` / `html[data-theme=light]`: nền `--theme-bg` = `#FBF6EE` (`--bg-raised`), chữ `--theme-text` = `#282724`, nút chính và `--theme-success-*` không đổi.
  - Ghi đè các lớp `.btn--style-primary` dùng `#344B3D` (`--bg-inverse`) nền và `#F3EBDD` chữ.
  - Focus `outline: 2px solid #344B3D`.
  - `font-family: var(--admin-font-body)` cho `body`/`.payload__app`.
  - Bo góc 0 (`--style-radius-s/m/l: 0`), bỏ `box-shadow`.
  - Ẩn link quên mật khẩu mặc định bằng selector Payload thật. Đọc DOM trang `/admin/login` để lấy selector, ghi selector vào comment.
  - Khai báo màu một lần ở đầu file dưới dạng biến SCSS lấy giá trị từ `design/tokens/tokens.css`, kèm tên token trong comment. Không rải hex.
- [ ] **Step 7: E2E** (`tests/e2e/admin-ui.e2e.spec.ts`, `describe('nhận diện')`):
  - `/admin/login` có chữ `CHIẾU HỚI`;
  - không có ảnh hay chữ `Payload` trong khối logo;
  - có `Quên mật khẩu? Nhờ người duyệt đặt lại.`;
  - không có link `Quên mật khẩu?`;
  - axe (tag `wcag2a,wcag2aa,wcag21aa,wcag22aa`) 0 vi phạm ở 1440 và 390.
  - Sau `loginReviewer`, thanh trên của `/admin` có `CH`.
- [ ] **Step 8: Chạy** `npm run lint`, `npm run test:unit`, `npm run test:e2e -- --project=chromium --no-deps tests/e2e/admin-ui.e2e.spec.ts`. Tất cả PASS.
- [ ] **Step 9: Commit** `feat(admin): nhận diện Chiếu Hới, font và màu token, trang đăng nhập`.

### Task 2: Menu theo vai trò

**Files:**
- Create: `src/admin/visibility.ts`, `src/admin/Nav.tsx`
- Modify: `src/payload.config.ts` (`admin.components.Nav`), importMap
- Test: `tests/unit/admin/visibility.test.ts`, `tests/e2e/admin-ui.e2e.spec.ts`

**Interfaces:**
- Produces (dùng ở Task 3):
  - `type VisibleEntities = { collections: string[]; globals: string[] }`;
  - `const EDITOR_HIDDEN: VisibleEntities = { collections: ['users', 'sources'], globals: ['site-settings', 'page-intros'] }`;
  - `function visibleForUser(entities: VisibleEntities, user: unknown): VisibleEntities`, trả về bản đã lọc; người duyệt (`isReviewerUser`) nhận nguyên bản.

- [ ] **Step 1: Unit test**:
  - `visibleForUser` với user `{ role: 'editor' }` bỏ đúng 4 slug và giữ thứ tự phần còn lại;
  - với `{ role: 'reviewer' }` giữ nguyên;
  - với `null` / `undefined` trả về như biên tập viên (ẩn nhiều hơn là an toàn);
  - không sửa mảng đầu vào.
  - Chạy thấy FAIL.
- [ ] **Step 2: Viết `visibility.ts`** dùng `isReviewerUser` từ `@/access/roles`. Chạy thấy PASS.
- [ ] **Step 3: Viết `Nav.tsx`**: server component nhận đúng props của `DefaultNav`, trả `<DefaultNav {...props} visibleEntities={visibleForUser(props.visibleEntities, props.user)} />`. Đăng ký `admin.components.Nav`, sinh lại importMap.
- [ ] **Step 4: E2E** (`describe('menu theo vai trò')`). Tạo biên tập viên tạm giống `workflow.e2e.spec.ts` dòng 40–52 (email ngẫu nhiên `@example.com`, xoá ở `afterAll`).
  - Biên tập viên mở `/admin`, mở menu: không thấy link `Người dùng`, `Nguồn`, `Thông tin site`, `Phần mở đầu trang`; thấy `Bài viết`.
  - Người duyệt thấy cả 4.
  - Biên tập viên mở `/admin/account` được (HTTP 200, thấy ô email).
  - Biên tập viên mở `/admin/collections/sources/create` được.
  - Review Focus 1: ở `/admin/collections/stories/create` bấm nút "+" cạnh ô `Nguồn`, hộp tạo mới mở, điền tiêu đề nguồn, lưu, hộp đóng và ô `Nguồn` có giá trị vừa tạo. Xoá nguồn đó ở `afterAll`.
- [ ] **Step 5: Chạy** lint, unit, e2e như Task 1. PASS.
- [ ] **Step 6: Commit** `feat(admin): menu ẩn mục quản trị với biên tập viên`.

### Task 3: Trang đầu bằng widget

**Files:**
- Create: `src/admin/dashboard/tasks.ts`, `src/admin/dashboard/pending.ts`, `src/admin/dashboard/TasksWidget.tsx`, `src/admin/dashboard/PendingWidget.tsx`, `src/admin/dashboard/EntitiesWidget.tsx`, `src/admin/dashboard/layout.ts`
- Modify: `src/payload.config.ts` (`admin.dashboard`), `custom.scss`, importMap
- Test: `tests/unit/admin/dashboard.test.ts`, `tests/int/admin-pending.int.spec.ts`, `tests/e2e/admin-ui.e2e.spec.ts`

**Interfaces:**
- Consumes: `visibleForUser`, `EDITOR_HIDDEN` (Task 2).
- Produces (dùng ở Task 4, 5):
  - `type TaskLink = { label: string; href: string; collection?: string }`;
  - `const TASKS: TaskLink[]`, theo đúng thứ tự:
    1. `Tải ảnh lên` → `/admin/collections/archive-assets/create`
    2. `Viết bài mới` → `/admin/collections/stories/create`
    3. `Thêm người` → `/admin/collections/people/create`
    4. `Thêm sản phẩm` → `/admin/collections/products/create`
    5. `Xem hướng dẫn` → `/admin/huong-dan` (không có `collection`)
  - `function tasksFor(permissions: { collections?: Record<string, { create?: boolean }> }): TaskLink[]`: bỏ mục có `collection` mà `permissions.collections[collection].create` không phải `true`.
  - `const PENDING_COLLECTIONS = ['stories', 'people', 'products', 'makers', 'craft-steps', 'timeline-events'] as const`
  - `async function countPending(payload: Payload, user: unknown): Promise<{ collection: string; label: string; count: number; href: string }[]>`:
    - người không phải người duyệt nhận `[]`;
    - mỗi collection gọi `payload.find({ collection, draft: true, where: { workflow: { equals: 'in_review' } }, limit: 0 hoặc 1, depth: 0, overrideAccess: false, user })` lấy `totalDocs`;
    - `label` là `labels.plural` của collection;
    - `href = /admin/collections/<slug>?where[workflow][equals]=in_review`.
  - Widget slug: `viec-thuong-lam`, `dang-cho-duyet`, `tat-ca-muc`.

- [ ] **Step 1: Unit test `tasksFor`**:
  - đủ quyền thì ra 5 mục đúng thứ tự, nhãn và href;
  - thiếu `create` của `products` thì không có `Thêm sản phẩm`;
  - `Xem hướng dẫn` luôn có.
  - Chạy thấy FAIL, viết, rồi PASS.
- [ ] **Step 2: Int test `countPending`** (DB test):
  - tạo 2 story `workflow: 'in_review'` (một ở bản nháp chưa từng đăng) và 1 story `draft`;
  - người duyệt nhận `stories.count === 2`;
  - biên tập viên nhận `[]`;
  - href đúng mẫu.
  - Chạy thấy FAIL, viết `pending.ts`, PASS.
- [ ] **Step 3: Widget.**
  - `TasksWidget`:
    - lưới nút: desktop 3 cột, ≤ 640px 1 cột;
    - mỗi nút cao ≥ 56px, là thẻ `<a>`, chữ 16px;
    - nền `--bg-inverse` cho 4 nút việc, viền cho `Xem hướng dẫn`.
  - `PendingWidget`:
    - tự gọi `countPending` với `req.user` lúc render (Review Focus 2);
    - không phải người duyệt thì render `null`;
    - tổng bằng 0 thì hiện `Không có bài nào chờ duyệt`;
    - ngược lại liệt kê `label — count` là link, chỉ những dòng có count > 0.
  - `EntitiesWidget`: như `CollectionCards` của Payload nhưng tính `visibleEntities` qua `visibleForUser`.
    - Đọc `@payloadcms/ui/dist/widgets/CollectionCards/index.js` và dựng lại bằng `getNavGroups` + `getVisibleEntities` với kết quả đã lọc.
    - Nếu `CollectionCards` nhận được `visibleEntities` từ props thì bọc nó thay vì dựng lại.
- [ ] **Step 4: `layout.ts`.** Dashboard dùng `defaultLayout({ req })`:
  - người duyệt: `viec-thuong-lam` (full), `dang-cho-duyet` (full), `tat-ca-muc` (full);
  - biên tập viên: không có `dang-cho-duyet`.
  - Đăng ký `admin.dashboard.widgets` với `label` tiếng Việt như Global Constraints.
  - Gỡ widget `collections` mặc định nếu cấu hình mới không tự thay thế nó. Kiểm bằng e2e.
- [ ] **Step 5: E2E** (`describe('trang đầu')`):
  - biên tập viên thấy `Việc thường làm` với 5 nút đúng chữ, không thấy `Đang chờ duyệt`, thấy `Tất cả mục` không có `Người dùng`;
  - bấm `Viết bài mới` ra URL `/admin/collections/stories/create`;
  - người duyệt thấy `Đang chờ duyệt`;
  - ở 390px các nút xếp một cột và mỗi nút ≥ 44px cao (dùng `smallTargets` trong `tests/e2e/helpers/index.ts`);
  - axe 0 vi phạm ở 1440 và 390 cho cả hai vai trò.
- [ ] **Step 6: Chạy** lint, unit, int, e2e. PASS.
- [ ] **Step 7: Commit** `feat(admin): trang đầu có việc thường làm và bài chờ duyệt`.

### Task 4: Dữ liệu mẫu và ảnh chụp cho hướng dẫn

**Files:**
- Create: `src/seed/guide.ts`, `tests/e2e/admin-guide-shots.e2e.spec.ts`, `tests/e2e/helpers/highlight.ts`, `public/admin-guide/*.png` (sinh ra)
- Modify: `package.json` (scripts), `playwright.config.ts` (project `guide-shots`)
- Test: chính spec chụp ảnh; `tests/unit/admin/guide-seed.test.ts`

**Interfaces:**
- Consumes: `TASKS` (Task 3), nhãn nút trong Global Constraints.
- Produces (dùng ở Task 5):
  - file `public/admin-guide/<id>.png` và `<id>-mobile.png` cho mỗi `id` trong `GUIDE_SHOTS`;
  - `tests/e2e/helpers/guideShots.ts` export `GUIDE_SHOTS: { id: string; alt: string; mobile: boolean }[]`;
  - `public/admin-guide/labels.json`: danh sách chữ của mọi phần tử được khung đỏ, `{ [id]: string }`.

- [ ] **Step 1: Seeder `src/seed/guide.ts`** (`payload run`). Dừng ngay nếu `DATABASE_URI` không chứa `chieuhoi_test`; thông báo ghi rõ lý do. Tạo:
  - 1 người duyệt và 1 biên tập viên mẫu, email `nguoi-duyet@example.com` / `bien-tap@example.com`, mật khẩu ngẫu nhiên ghi ra file gitignore `.superpowers/guide-users.json`, không in ra;
  - 3 ảnh tư liệu `rights: 'permitted'`, file sinh bằng `sharp`: ô màu `#C3A46C`, `#344B3D`, `#A04435`, cỡ 1200×800, có chữ "Ảnh mẫu" vẽ bằng SVG;
  - 2 bài viết (1 `draft`, 1 `in_review`), 1 người, 1 sản phẩm, chữ mẫu ghi rõ "(mẫu)".
  - Unit test kiểm hàm chặn DB: URI dev ném lỗi, URI test qua.
- [ ] **Step 2: Script npm**:
  - `guide:seed` = `cross-env DATABASE_URI=$DATABASE_URI_TEST payload run src/seed/guide.ts`. Kiểm `cross-env` mở rộng biến được không; không được thì làm script `.mjs` nhỏ đọc `.env`.
  - `guide:shots` = build với `DATABASE_URI` của DB test, `next start -p 3300`, rồi `GUIDE_SHOTS=1 playwright test --project=guide-shots`.
  - Project `guide-shots` trong `playwright.config.ts`: `testMatch: /admin-guide-shots\.e2e/`, `baseURL: http://localhost:3300`, chỉ chạy khi `GUIDE_SHOTS=1`, các project khác `testIgnore` file này.
- [ ] **Step 3: `highlight.ts`** export `async function highlight(page: Page, locator: Locator): Promise<string>`:
  - chèn một `div` `position:absolute`, `outline: 3px solid #A04435`, cách phần tử 4px, `pointer-events:none`, `data-guide-highlight`;
  - trả `innerText` của phần tử để ghi `labels.json`.
  - Gỡ mọi highlight cũ trước khi chèn.
- [ ] **Step 4: Spec chụp ảnh.** Mỗi mục trong `GUIDE_SHOTS` mở đúng trang, đăng nhập đúng vai trò, khung đỏ vào phần tử cần bấm, chụp viewport 1440×900. Nếu `mobile: true` thì chụp thêm 390×844. Tối thiểu các id:
  - `dang-nhap`
  - `trang-dau`
  - `tai-anh-chon-file`, `tai-anh-luu`
  - `viet-bai-mo`, `viet-bai-noi-dung`
  - `gui-duyet-quy-trinh`, `gui-duyet-luu`
  - `xem-truoc`
  - `menu-dien-thoai` (`mobile: true`)
  - `duyet-danh-sach`, `duyet-quyen-anh`, `duyet-dang`
  - `tao-tai-khoan`

  Ghi `labels.json`. Ảnh nén PNG; mỗi ảnh ≤ 400KB, nếu lớn hơn thì giảm `deviceScaleFactor` về 1.
- [ ] **Step 5: Chạy** `npm run guide:seed && npm run guide:shots`.
  - Mở vài ảnh kiểm: không có nút "N" của Next, không có ảnh thật, khung đỏ đúng chỗ.
  - Ảnh tham khảo (`/images/reference/`) không được xuất hiện. Spec phải fail nếu trang chụp có `img[src*="/images/reference/"]`.
- [ ] **Step 6: Commit** `feat(admin): dữ liệu mẫu và ảnh chụp cho trang hướng dẫn` (kèm `public/admin-guide/`).

### Task 5: Trang Hướng dẫn

**Files:**
- Create: `src/admin/guide/sections.ts`, `src/admin/guide/GuideView.tsx`, `src/admin/guide/GuideNavLink.tsx`
- Modify: `src/payload.config.ts` (`admin.components.views.huongDan = { Component, path: '/huong-dan' }`, `afterNavLinks`), `custom.scss` (kiểu trang và `@media print`), importMap
- Test: `tests/unit/admin/guide.test.ts`, `tests/e2e/admin-ui.e2e.spec.ts`

**Interfaces:**
- Consumes: `GUIDE_SHOTS` id và `labels.json` (Task 4); `TASKS` (Task 3).
- Produces:
  - `type GuideStep = { text: string; shot?: string }`. Trong `text`, chữ trên màn hình viết trong `**…**`.
  - `type GuideSection = { id: string; title: string; audience: 'all' | 'reviewer'; when: string; steps: GuideStep[] }`
  - `const GUIDE_SECTIONS: GuideSection[]`

- [ ] **Step 1: Unit test**:
  - có đúng 12 mục, `id` duy nhất;
  - 8 mục `all` theo thứ tự spec: Đăng nhập; Tải ảnh lên; Viết một bài; Thêm người hoặc sản phẩm; Xem trước bài trên trang; Gửi bài cho người duyệt; Quên mật khẩu; Khi gặp lỗi;
  - 4 mục `reviewer` theo thứ tự spec;
  - mọi `shot` có trong `GUIDE_SHOTS`;
  - mọi chuỗi `**…**` trong một bước có `shot` xuất hiện trong `labels.json[shot]` (Review Focus 5);
  - không câu nào chứa từ cấm `slug`, `collection`, `CMS`, `đường dẫn`, `field`;
  - mục "Quên mật khẩu" chứa `nhờ người duyệt`.
  - Chạy thấy FAIL.
- [ ] **Step 2: Viết `sections.ts`.**
  - Câu ngắn, một việc mỗi bước, xưng "bạn".
  - Mở đầu mỗi mục bằng `when`, một câu "Dùng khi…".
  - Mục "Viết một bài" có một bước nói những ô có thể bỏ trống.
  - Chữ in đậm chép đúng chữ trên màn hình, lấy từ `labels.json`.
  - Chạy unit thấy PASS.
- [ ] **Step 3: `GuideView.tsx`.**
  - Dùng `DefaultTemplate` của `@payloadcms/next/templates` để có menu và thanh trên giống trang admin khác (đọc ví dụ custom view trong `node_modules/@payloadcms/next/dist/views`).
  - Mục lục ở đầu là danh sách link neo, chia "Dành cho mọi người" / "Dành cho người duyệt".
  - Biên tập viên chỉ thấy phần `all`; người duyệt thấy cả hai.
  - Mỗi bước là `<li>` trong `<ol>`; ảnh `<img src="/admin-guide/<shot>.png" alt=…>` rộng tối đa 100%.
  - Ảnh mobile dùng `<picture><source media="(max-width: 640px)" srcset="…-mobile.png">`.
  - Chữ thân 16px, tiêu đề mục ≥ 20px.
  - `@media print`: ẩn menu và thanh trên, mỗi mục bắt đầu trang mới (`break-before: page`).
- [ ] **Step 4: `GuideNavLink.tsx`** là link `Hướng dẫn` tới `/admin/huong-dan`, đăng ký `afterNavLinks`. Sinh lại importMap.
- [ ] **Step 5: E2E** (`describe('hướng dẫn')`):
  - đăng nhập biên tập viên, mở `Hướng dẫn` từ menu: có 8 tiêu đề mục, không có `Dành cho người duyệt`;
  - người duyệt thấy 12;
  - mọi ảnh trên trang tải được (`naturalWidth > 0`);
  - ở 390px `document.documentElement.scrollWidth <= 390` (Review Focus 4);
  - axe 0 vi phạm ở 1440 và 390;
  - chưa đăng nhập mà mở `/admin/huong-dan` thì về trang đăng nhập.
- [ ] **Step 6: Chạy** lint, unit, e2e. PASS.
- [ ] **Step 7: Commit** `feat(admin): trang Hướng dẫn trong admin`.

### Task 6: Kiểm toàn bộ, tài liệu, ảnh cho người dùng xem

**Files:**
- Modify: `CLAUDE.md` (Stack: `src/admin`, `guide:seed`, `guide:shots`), `docs/superpowers/backlog.md`
- Create: không

- [ ] **Step 1: Chạy đủ bộ** `npm run lint`, `npm run test:unit`, `npm run test:int`, `npm run build`, `npm run test:e2e`. Ghi số test.
- [ ] **Step 2: Chụp cho người dùng xem.** Chụp trang đăng nhập, trang đầu (biên tập viên và người duyệt), menu, trang hướng dẫn ở 1440 và 390 trên dữ liệu mẫu (DB test). Ảnh vào `.superpowers/admin-screens/` (gitignore).
- [ ] **Step 3: CLAUDE.md** thêm vào Stack:
  - `src/admin/`: giao diện tuỳ biến của admin, không import component, dữ liệu hay trang của site;
  - cách chạy lại ảnh hướng dẫn `npm run guide:seed && npm run guide:shots`, và chạy lại khi đổi giao diện admin.
- [ ] **Step 4: Backlog** thêm mục mới:
  - "Thêm: Review Checklist" còn tiếng Anh;
  - ô "Ngôn ngữ" ở thanh trên;
  - đếm ảnh chưa xác nhận quyền dùng trên trang đầu;
  - dịch vụ email cho quên mật khẩu.
  - Cộng các mục review còn mở.
- [ ] **Step 5: Commit** `docs: admin dễ dùng — CLAUDE.md và backlog`.

## Rulings đã quyết khi viết plan

- **A1:** component admin nằm ở `src/admin/`, không ở `src/components/admin/` như spec ghi. `src/components` bị cấm import Payload; các component này bắt buộc phải gọi Payload. Nếu sai: đổi tên thư mục.
- **A2:** không dùng `admin.hidden`. Ở bản 3.92 nó làm view tài liệu trả 404 và hỏng hộp "Thêm mới" của ô quan hệ (đã đọc `views/Document/index.js`). Thay bằng `Nav` bọc `DefaultNav` và widget lọc. Nếu sai: thêm một component Nav.
- **A3:** trang đầu dùng dashboard widget của 3.92 thay vì `beforeDashboard`, vì cần thay lưới thẻ mặc định bằng bản đã lọc. Nếu sai: người dùng có thể tự sắp widget (tính năng sẵn của Payload).
- **A4:** ảnh hướng dẫn được commit vào `public/admin-guide/` vì chỉ chứa dữ liệu mẫu và ảnh tự sinh. Nếu sai: repo nặng thêm vài MB.

---

## Bổ sung sau khi người dùng xem (2026-10-29): về admin gốc

Người dùng chọn "Về hẳn admin gốc". Task 6 dừng giữa chừng, chưa có commit. Thay bằng Task 7 → Task 8 → Task 6 (chạy lại).

### Task 7: Gỡ giao diện tuỳ biến

**Files:**
- Delete:
  - `src/admin/Logo.tsx`, `Icon.tsx`, `AdminFonts.tsx`, `LoginHelp.tsx`, `Nav.tsx`, `visibility.ts`, `src/admin/dashboard/`;
  - `tests/unit/admin/branding.test.tsx`, `visibility.test.ts`, `dashboard.test.ts`;
  - `tests/int/admin-pending.int.spec.ts`.
- Modify: `src/payload.config.ts`, `src/app/(payload)/custom.scss`, `importMap.js`, `src/payload-types.ts` (sinh lại), `tests/e2e/admin-ui.e2e.spec.ts`.
- Keep:
  - tầng `src/admin/` cùng lint và test kiến trúc;
  - `src/admin/guide/*` và `GuideNavLink`;
  - `views.huongDan`, `afterNavLinks`;
  - seeder và pipeline chụp ảnh;
  - `smallTargets(page, scope)`.

- [ ] **Step 1:** Trong `payload.config.ts`:
  - bỏ `graphics`, `providers`, `afterLogin`, `Nav`, `admin.dashboard`, `admin.theme`;
  - bỏ bộ lọc `config.then(...)` widget `collections`, để default export lại đúng là `buildConfig(...)`;
  - giữ `views.huongDan` và `afterNavLinks: [GuideNavLink]`.
- [ ] **Step 2:** `custom.scss` chỉ còn kiểu của trang hướng dẫn (`.ch-guide…` và `@media print`).
  - Màu lấy từ biến của Payload (`--theme-text`, `--theme-elevation-*`, `--theme-bg`); bỏ biến SCSS màu token.
  - Không đổi gì ngoài `.ch-guide`.
- [ ] **Step 3:** Xoá file, sinh lại importMap (`npx payload generate:importmap`) và types (`npx payload generate:types`).
  - Trong `admin-ui.e2e.spec.ts` bỏ các `describe` của nhận diện, menu theo vai trò và trang đầu. Giữ `describe('hướng dẫn')`.
  - Thêm một test: `/admin/login` hiện logo Payload gốc. Test này chứng minh không còn ghi đè.
- [ ] **Step 4:** Chạy `npm run lint`, `npm run test:unit`, `npm run test:int`, e2e `admin-ui`. Lúc này mục hướng dẫn có thể còn sai nhãn: test unit nhãn hướng dẫn được phép fail **chỉ** vì `labels.json` cũ; ghi rõ trong report. Task 8 sửa.
- [ ] **Step 5:** Commit `revert(admin): về giao diện admin gốc của Payload, giữ trang Hướng dẫn`.

### Task 8: Viết lại hướng dẫn theo admin gốc

**Files:** `src/admin/guide/shots.ts`, `src/admin/guide/sections.ts`, `tests/e2e/admin-guide-shots.e2e.spec.ts`, `public/admin-guide/*`, `tests/unit/admin/guide.test.ts`, `tests/e2e/admin-ui.e2e.spec.ts`

- [ ] **Step 1:** Cập nhật `GUIDE_SHOTS` và spec chụp cho giao diện gốc. Bỏ `trang-dau` kiểu nút việc. Các id mới là gợi ý; người làm chọn theo màn hình thật:
  - `trang-dau`: lưới thẻ gốc, khung đỏ vào nút "+" của thẻ **Bài viết**, hoặc vào thẻ;
  - `menu-may-tinh`: nút mở menu và link **Hướng dẫn**;
  - `duyet-danh-sach`: danh sách Bài viết có cột **Quy trình** = **Chờ duyệt**, hoặc bộ lọc.

  Mỗi mục trong 12 mục vẫn có ít nhất một ảnh ở bước quan trọng nhất. Chạy `npm run guide:seed && npm run guide:shots`; `labels.json` sinh lại.
- [ ] **Step 2:** Viết lại `sections.ts` cho đúng giao diện gốc. Giữ các quy tắc của Task 5:
  - 12 mục, thứ tự theo spec;
  - một việc mỗi bước, xưng "bạn";
  - không có từ cấm;
  - "Quên mật khẩu" bảo nhờ người duyệt, vì link gốc không gửi được thư;
  - chữ in đậm khớp nguyên dòng trong `labels.json` (bước có ảnh) hoặc khớp bản dịch tiếng Việt của Payload (bước không ảnh).

  Mở đầu trang có một câu: menu nằm sau nút ba gạch ở góc trên bên trái.
- [ ] **Step 3:** Cập nhật test unit và e2e `hướng dẫn` theo id mới. Chạy unit, e2e `admin-ui`, lint.
- [ ] **Step 4:** Commit `feat(admin): viết lại hướng dẫn theo giao diện admin gốc`.

### Task 6 (chạy lại)
Như Task 6 ở trên, nhưng bỏ các phần đã gỡ:
- backlog không cần các mục đếm ảnh chưa xác nhận quyền dùng và ô "Ngôn ngữ";
- vẫn ghi "Thêm: Review Checklist", dịch vụ email, ô "Đường dẫn";
- vẫn ghi thứ tự `test:int` → `guide:seed`.

Ảnh cho người dùng xem: trang đăng nhập, trang đầu, menu và trang Hướng dẫn ở 1440 và 390.
