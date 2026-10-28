# Chiếu Hới — Phase 7: Deploy staging và kiểm tra — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Làm theo spec mục 9 bước 7:
- dựng staging trên Vercel/Neon/R2, có mật khẩu và `noindex`;
- chạy axe/Lighthouse, kiểm bàn phím, giảm chuyển động;
- so ảnh chụp với `design/screens`, liệt kê điểm lệch.

Hết Phase 7 thì dừng để người dùng xem.

**Architecture:**
- **Môi trường:** module thuần `src/lib/env.ts` (không import gì) đọc và kiểm biến môi trường. `next.config.ts` gọi nó lúc khởi động nên build sai môi trường sẽ dừng ngay.
- **Cổng staging:** `src/proxy.ts` (Next 16 đổi `middleware` thành `proxy`) chặn mọi request ở `APP_ENV=staging` bằng HTTP Basic Auth, và gắn `X-Robots-Tag: noindex, nofollow` ở mọi môi trường không phải production. Logic so mật khẩu nằm ở `src/lib/basicAuth.ts` (thuần).
- **Ảnh:** Payload lưu file lên S3/R2 bằng `@payloadcms/storage-s3` khi có `S3_BUCKET`, nếu không thì vẫn lưu đĩa như dev. File vẫn đi qua endpoint của Payload (`/api/archive-assets/file/…`) để quy tắc `rights` áp ở một chỗ. Tắt bộ tối ưu của `next/image` (`images.unoptimized`), dùng các cỡ ảnh Payload tạo sẵn.
- **Kiểm tra:** thêm các bộ e2e Playwright quét toàn bộ route (axe, bàn phím, giảm chuyển động, CLS), một script Lighthouse và một bộ chụp ảnh so sánh. Không đổi lớp `lib/content`, không đổi schema DB.

**Tech Stack:** Node 22.23.4, Next 16.4.3, React 19, Payload 3.92.0 (Postgres), Vitest, Playwright 1.64.1, `@axe-core/playwright` (đã có).
- Gói mới: `@payloadcms/storage-s3@3.92.0` (khớp đúng bản Payload) và devDependency `lighthouse@13.5.0`. Không dùng 13.6.0 vì ra mới một ngày.
- Đọc lại API trong `node_modules` trước khi dùng, không đoán:
  - `proxy` của Next 16: tên file, tên hàm export, `config.matcher`, runtime;
  - các tuỳ chọn `s3Storage` (`clientUploads`, `disablePayloadAccessControl`, `config`);
  - lệnh `payload migrate:create` có cờ bỏ qua khi không có thay đổi hay không.

**Spec:** `docs/superpowers/specs/2026-10-26-chieu-hoi-web-design.md`. Đọc kèm:
- mục 3: Lighthouse Accessibility ≥ 95, CLS < 0.1, WCAG 2.2 AA;
- mục 4 "Hạ tầng": gói free, giữ khả năng chạy bằng `next start` trên VPS, staging có DB và bucket riêng, có mật khẩu và `noindex`;
- mục 8: seed ảnh tham khảo chỉ ở dev/staging;
- mục 9 bước 7.

Đọc thêm:
- `docs/HANDOFF.md` mục "Khả năng truy cập";
- `CLAUDE.md` ("Kiến trúc", "Component dùng chung", "Quy tắc giao diện");
- `docs/superpowers/backlog.md` mục A.

## Global Constraints

- **Mọi quy tắc trong `CLAUDE.md` áp dụng.**
  - Phụ thuộc một chiều: `app` → `components` → `lib/content` → Payload.
  - Component chỉ `import type` từ `@/lib/content`.
  - Sửa lỗi a11y trong component chung (`ui`/`content`/`layout`) chứ không vá ở từng trang.
- **`src/lib/env.ts` và `src/lib/basicAuth.ts` không import gì** ngoài kiểu và API chuẩn (`crypto`/Web API). Lý do: `next.config.ts`, `payload.config.ts`, `proxy.ts` và `access` đều dùng chúng.
- **Không dùng tính năng chỉ Vercel mới có.**
  - Mật khẩu staging làm bằng `proxy` của app, không dùng Vercel Deployment Protection (gói trả phí).
  - App phải chạy được bằng `next start` với cùng biến môi trường.
- **Ảnh tham khảo** (`design/reference-images`, `public/images/reference`) và mọi ảnh chụp màn hình có chứa chúng **không được commit**.
  - Ảnh so sánh ghi vào `.superpowers/` (gitignore) hoặc `test-results/`.
  - Chỉ commit danh sách điểm lệch dạng chữ.
- **Không tự đăng nhập, tạo tài khoản hay deploy lên dịch vụ ngoài** (Vercel, Neon, Cloudflare). Task 11 dừng hỏi người dùng trước.
- **Không in mật khẩu, secret hay token** ra log, báo cáo hay commit. File `.env.staging*` nằm trong `.gitignore` (mẫu `.env*` đã có).
- **Copy mới do Claude viết** (không có trên artboard). Chép đúng chuỗi trong plan.
- **Chạy lệnh:** `fnm exec --using=22.23.4 -- npm run …`. Shell là fish, lệnh ghép bọc trong `bash -c`. Trước khi chạy e2e, tắt server cũ ở cổng 3100: `lsof -ti tcp:3100 | xargs kill`.

## Review Focus

1. **Staging thiếu hoặc sai `STAGING_AUTH`:**
   - Mong đợi: site đóng, không bao giờ mở toang. `assertDeployEnv` làm build dừng; nếu chạy được tới đây thì proxy trả 503.
   - Test: unit `env.test.ts`, `proxy.test.ts` (Task 1, 2).
2. **Header `Authorization` dị dạng** (không phải Basic, base64 hỏng, thiếu `:`, mật khẩu có `:`, chữ Unicode):
   - Mong đợi: 401, không ném lỗi.
   - Mật khẩu chứa `:` vẫn khớp, vì tách ở dấu `:` đầu tiên.
   - Test: unit `basicAuth.test.ts` (Task 2).
3. **Người lạ tải thẳng URL file của ảnh chưa được phép ở production/dev** sau khi chuyển sang S3:
   - Mong đợi: vẫn 403. Chỉ staging (đã có mật khẩu) mới mở cho khách xem file.
   - Test: e2e `images.e2e.spec.ts` trên :3100 (Task 3), e2e `staging.e2e.spec.ts` (Task 9).
4. **Build bằng `.env` dev rồi đem đi deploy production:**
   - Mong đợi: `APP_ENV=production` mà có `PREVIEW_ALL=true` hoặc `ALLOW_FIRST_USER=true` thì build dừng với thông báo rõ.
   - Thiếu `APP_ENV` cũng dừng.
   - Test: unit `env.test.ts` (Task 1).
5. **Người chỉ dùng bàn phím mở menu mobile, lightbox hay PatternExplorer:**
   - Mong đợi: vào được, thoát được bằng Escape, focus quay về nút đã mở, không bao giờ focus vào phần tử bị ẩn.
   - Test: `keyboard.e2e.spec.ts` (Task 5).

## Ruling của Claude trong plan (báo người dùng khi hết phase)

- **R1 Nhà cung cấp:** Vercel Hobby + Neon free + Cloudflare R2 free, đúng spec mục 4.
  - Staging dùng tên miền `*.vercel.app`.
  - Neon dùng region gần Việt Nam nhất có trong gói free (Singapore), Vercel function đặt cùng region (`sin1`).
  - Nếu sai: đổi region chỉ cần cấu hình, không đổi code.
- **R2 Mật khẩu staging bằng HTTP Basic Auth trong `src/proxy.ts`**, đọc `STAGING_AUTH` dạng `user:password`.
  - Chặn mọi đường dẫn, kể cả `/admin`, `/api` và ảnh, trừ `/_next/static/*` (JS/CSS/font của build, không chứa dữ liệu).
  - Thiếu `STAGING_AUTH` ở staging thì trả 503 với `Staging chưa đặt mật khẩu.`, không mở site.
  - Lời nhắc 401: realm `Chieu Hoi staging`, thân trả về `Cần mật khẩu để xem bản thử nghiệm.`
  - Nếu sai: người xem phải gõ mật khẩu ở hộp thoại của trình duyệt (xấu nhưng đủ dùng); muốn trang đăng nhập đẹp thì làm sau.
- **R3 `noindex` ba lớp ở mọi môi trường không phải production:**
  - header `X-Robots-Tag: noindex, nofollow` từ proxy;
  - `robots.txt` (`src/app/robots.ts`) chặn tất cả;
  - `metadata.robots = { index: false, follow: false }` ở layout.
  - Production: `robots.txt` cho phép tất cả trừ `/admin`, `/api`, `/preview`, `/styleguide`, không có sitemap (để sau).
- **R4 Staging bật `PREVIEW_ALL=true`**, để người xem thấy site giống ảnh thiết kế (ảnh tham khảo, nhãn `[cần xác minh]`).
  - Hệ quả: bản public thật không xem được trên staging. Nó vẫn được kiểm bằng e2e ở :3100 (`PREVIEW_ALL=false`).
  - Nếu sai: tắt bằng một biến môi trường trên Vercel, không đổi code.
- **R5 Ở staging, khách (đã qua mật khẩu) đọc được file ảnh chưa được phép.**
  - Lý do: `ContentImage` tải ảnh có cờ trực tiếp từ trình duyệt, khách không có phiên Payload nên sẽ bị 403 và ảnh vỡ.
  - Chỉ mở **file**: REST liệt kê/đọc metadata vẫn đóng như R19 Phase 5b.
  - Áp trong `readAccess` của ArchiveAssets bằng `isStaging(process.env)`. Spec cho phép ảnh tham khảo trên staging có mật khẩu.
  - Nếu sai: lộ ảnh chưa có quyền cho người có mật khẩu staging. Đây là đúng nhóm người spec định cho xem.
- **R6 Tắt bộ tối ưu ảnh của Next** (`images.unoptimized: true`), dùng cỡ `thumb`/`card`/`wide` Payload tạo sẵn (webp).
  - Lý do:
    - Vercel Hobby giới hạn lượt biến đổi ảnh;
    - spec gợi ý chính cách này;
    - đóng luôn mục backlog "ảnh tối ưu còn trong cache sau khi thu hồi quyền" (R12 Phase 6), vì không còn cache của bộ tối ưu.
  - Nếu sai: ảnh trên mobile nặng hơn một chút vì không có `srcset` theo màn hình, ảnh hưởng điểm Performance (không phải mục tiêu bắt buộc). CLS không đổi vì vẫn có `width`/`height`.
- **R7 File vẫn đi qua Payload** (`disablePayloadAccessControl` không bật), không trỏ thẳng URL R2 công khai. Bucket để private.
  - Nếu sai: mỗi ảnh tốn một lượt chạy function trên Vercel; lưu lượng thấp nên còn trong gói free.
- **R8 `clientUploads: true`** để ảnh tải lên đi thẳng từ trình duyệt vào R2. Vercel giới hạn thân request 4,5 MB, ảnh chụp điện thoại thường lớn hơn. Cần cấu hình CORS cho bucket (ghi trong `docs/DEPLOY.md`).
  - Task 9 phải xác nhận ảnh tải lên theo đường này vẫn sinh đủ 3 cỡ.
  - Nếu không sinh đủ: tắt `clientUploads`, thêm mô tả trường file `Ảnh tối đa 4 MB khi tải lên ở bản online.` và ghi backlog.
- **R9 Seed staging chạy từ máy dev** với file `.env.staging` (không commit), trỏ tới DB Neon và bucket R2 của staging.
  - Ảnh tham khảo không bao giờ nằm trong repo hay bản build.
  - `assertSeedAllowed` đã chặn production.
- **R10 Lệnh build trên Vercel là `npm run ci`** (`payload migrate && npm run build`): schema luôn khớp code trước khi dựng trang tĩnh (trang tĩnh đọc DB lúc build).
  - Nếu sai: migration lỗi làm deploy thất bại. Đây là hành vi mong muốn, vì bản đang chạy vẫn giữ nguyên.
- **R11 Diễn tập staging ở máy trước khi deploy thật:**
  - DB riêng `chieuhoi_staging` trong Docker hiện có, MinIO (giả lập S3) chạy dưới profile `s3` của `docker-compose.yml`;
  - chạy đúng chuỗi lệnh sẽ dùng trên Vercel.
  - Nếu sai: tốn thêm một container cục bộ, không ảnh hưởng dev thường ngày (profile tắt mặc định).
- **R12 Kiểm a11y bằng axe (thẻ `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`)** trên mọi route ở 1440 và 390, cả bản preview (:3000) lẫn public (:3100).
  - Vi phạm thì sửa trong task. Chỉ được để lại vi phạm cần đổi thiết kế, ghi rõ trong báo cáo kèm lý do.
  - Lighthouse chạy bằng script riêng, không nằm trong `npm run test:e2e` vì chậm.
- **R13 Phóng chữ 200%** kiểm bằng khung nhìn 640 px (1280 px phóng 200%) và 320 px (reflow WCAG 1.4.10): không cuộn ngang.
- **R14 So ảnh chụp là so bằng mắt, không so pixel.**
  - Ảnh thiết kế có nội dung minh hoạ khác CMS, chiều cao trang cũng khác, nên diff pixel chỉ ra nhiễu.
  - Ghép ảnh thiết kế và ảnh chụp cạnh nhau, rồi viết danh sách điểm lệch.
  - Phase 7 **chỉ liệt kê**, không sửa giao diện (đúng chữ "liệt kê điểm lệch" của spec). Ngoại lệ: lỗi a11y.
  - Nếu sai: người dùng chọn mục nào sửa ở phase sau.
- **R15 `npm audit`:** chỉ nâng bản vá (patch/minor) không phá build và test. Còn lại ghi backlog kèm lý do. Không bỏ `legacy-peer-deps` trong phase này.
- **R16 Không đóng race tạo người dùng đầu tiên** (`ALLOW_FIRST_USER`, R12 Phase 6).
  - `assertDeployEnv` cấm `ALLOW_FIRST_USER=true` ở staging và production; ở đó người duyệt đầu tiên được tạo bằng `npm run create-reviewer`.
  - Race chỉ còn ở dev, không đáng sửa.

---

## File Structure

| File | Vai trò |
|---|---|
| `src/lib/env.ts` (mới) | `readAppEnv`, `assertDeployEnv`, `isStaging`, `isIndexable`, `siteUrl` |
| `src/lib/basicAuth.ts` (mới) | `checkBasicAuth` |
| `src/proxy.ts` (mới) | Cổng staging và `X-Robots-Tag` |
| `src/app/robots.ts` (mới) | `robots.txt` theo môi trường |
| `src/app/(frontend)/layout.tsx` | `metadataBase`, `robots` |
| `src/storage.ts` (mới) | `storagePlugins(env)` trả mảng plugin Payload |
| `src/payload.config.ts` | `plugins: storagePlugins(process.env)` |
| `src/collections/ArchiveAssets.ts` | R5 trong `readAccess` |
| `next.config.ts` | gọi `assertDeployEnv`, `images.unoptimized` |
| `docker-compose.yml`, `docker/minio/` | profile `s3` (MinIO và tạo bucket) |
| `.env.example` | biến mới |
| `tests/e2e/helpers/routes.ts` (mới) | danh sách route dùng chung cho các bộ quét |
| `tests/e2e/a11y.e2e.spec.ts`, `keyboard.e2e.spec.ts`, `motion.e2e.spec.ts`, `images.e2e.spec.ts`, `screens.e2e.spec.ts`, `staging.e2e.spec.ts` (mới) | các bộ kiểm |
| `tools/lighthouse.mjs`, `tools/screens-sheet.mjs` (mới) | Lighthouse, ghép ảnh so sánh |
| `docs/DEPLOY.md` (mới) | hướng dẫn dựng staging (tiếng Việt) |
| `docs/superpowers/reports/2026-10-28-phase-7-kiem-tra.md` (mới) | kết quả kiểm tra và danh sách điểm lệch |

---

### Task 1: Biến môi trường, build guard, `noindex` và `metadataBase`

**Files:**
- Create: `src/lib/env.ts`, `src/app/robots.ts`, `tests/unit/env.test.ts`, `tests/unit/robots.test.ts`
- Modify: `next.config.ts`, `src/app/(frontend)/layout.tsx`, `.env.example` (không đổi `mode.ts`)

**Interfaces:**
- Produces:
  ```ts
  export type AppEnv = 'development' | 'staging' | 'production'
  type Env = Record<string, string | undefined>
  export function readAppEnv(env: Env): AppEnv            // ném Error khi thiếu/sai
  export function assertDeployEnv(env: Env): void          // ném Error liệt kê MỌI lỗi, mỗi lỗi một dòng
  export function isStaging(env: Env): boolean             // readAppEnv an toàn: sai → false
  export function isIndexable(env: Env): boolean           // chỉ production
  export function siteUrl(env: Env): URL                   // SITE_URL, mặc định http://localhost:3000
  ```

- [ ] **Step 1: Viết test `tests/unit/env.test.ts`**

  `readAppEnv`:
  - nhận đúng 3 giá trị;
  - `undefined`, `''`, `'prod'` → ném lỗi chứa `APP_ENV phải là development, staging hoặc production (hiện là "…").`

  `assertDeployEnv`:
  - `{APP_ENV:'development'}` → không ném.
  - `staging`/`production` thiếu `SITE_URL` → lỗi chứa `SITE_URL`. `SITE_URL='ftp://x'` → lỗi.
  - `PAYLOAD_SECRET` ngắn hơn 32 ký tự → lỗi chứa `PAYLOAD_SECRET`. Thông báo không được chứa giá trị secret (test: `expect(msg).not.toContain(secret)`).
  - Thiếu `DATABASE_URI`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` → mỗi tên biến có trong thông báo.
  - Staging thiếu `STAGING_AUTH` hoặc thiếu `:` → lỗi chứa `STAGING_AUTH`.
  - `production` + `PREVIEW_ALL=true` → lỗi chứa `PREVIEW_ALL`.
  - `ALLOW_FIRST_USER=true` ở staging hoặc production → lỗi chứa `ALLOW_FIRST_USER`.
  - Đủ biến → không ném. Nhiều lỗi cùng lúc → mọi tên biến đều có trong thông báo.

  `isIndexable`: chỉ `true` ở production. `isStaging({})` → `false`.
  `siteUrl({})` → `http://localhost:3000/`.

- [ ] **Step 2: Chạy, xác nhận FAIL** — `fnm exec --using=22.23.4 -- npm run test:unit -- tests/unit/env.test.ts`.

- [ ] **Step 3: Viết `src/lib/env.ts`** cho test qua.
  - Thông báo gộp mở đầu bằng `Cấu hình môi trường chưa đúng:` rồi mỗi lỗi một dòng `- …`.

- [ ] **Step 4: Nối vào `next.config.ts`**
  - Gọi `assertDeployEnv(process.env)` ở đầu file.
  - Đặt `images: { unoptimized: true, … }` (R6), giữ `localPatterns` hiện có.
  - E2E :3100 build với `.env` dev (`APP_ENV=development`) nên không bị chặn.

- [ ] **Step 5: `src/app/robots.ts` và test `tests/unit/robots.test.ts`**
  - Viết hàm thuần `robotsFor(env)` trong `src/app/robots.ts`; default export gọi nó với `process.env`.
  - Không phải production → `{ rules: { userAgent: '*', disallow: '/' } }`.
  - Production → `{ rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/preview', '/styleguide'] } }`.

- [ ] **Step 6: Layout**
  - Thêm `metadataBase: siteUrl(process.env)` và `robots: isIndexable(process.env) ? undefined : { index: false, follow: false }` vào `metadata`.
  - Đóng mục backlog `metadataBase`: URL OG thành tuyệt đối.

- [ ] **Step 7: `.env.example`**
  - Thêm `SITE_URL=http://localhost:3000`, `STAGING_AUTH=`, `S3_BUCKET=`, `S3_ENDPOINT=`, `S3_REGION=auto`, `S3_ACCESS_KEY_ID=`, `S3_SECRET_ACCESS_KEY=`.
  - Mỗi nhóm một dòng chú thích tiếng Việt: chỉ bắt buộc ở staging/production; trống thì lưu ảnh vào đĩa.

- [ ] **Step 8: Chạy lint, unit, build**
  - Lệnh: `fnm exec --using=22.23.4 -- npm run lint`, `npm run test:unit`, `npm run build`.
  - Kỳ vọng: xanh, và `.next/server/app/index.html` vẫn còn (trang chủ vẫn tĩnh).

- [ ] **Step 9: Commit** — `feat(phase-7): kiểm biến môi trường khi build, noindex và metadataBase`.

---

### Task 2: Cổng mật khẩu staging (`proxy`)

**Files:**
- Create: `src/lib/basicAuth.ts`, `src/proxy.ts`, `tests/unit/basicAuth.test.ts`, `tests/unit/proxy.test.ts`

**Interfaces:**
- Consumes: `readAppEnv`, `isIndexable` (Task 1).
- Produces:
  ```ts
  export function checkBasicAuth(header: string | null, expected: string): boolean
  export function gate(req: Request | NextRequest, env: Env): NextResponse  // thuần, để test được
  export function proxy(req: NextRequest): NextResponse                      // gọi gate(req, process.env)
  ```

- [ ] **Step 1: Đọc API `proxy` của Next 16 trong `node_modules/next`**
  - Xác nhận tên file (`src/proxy.ts` hay gốc repo khi dùng `src/`), tên hàm export, `config.matcher` và runtime mặc định.
  - Ghi kết luận một dòng vào báo cáo task.

- [ ] **Step 2: Viết test `tests/unit/basicAuth.test.ts`**
  - Khớp: `'Basic ' + btoa('u:p')` với `'u:p'` → `true`.
  - Mật khẩu có `:`: `btoa('u:a:b')` với `'u:a:b'` → `true`.
  - Chữ Unicode: mã UTF-8 của `'u:mậtkhẩu'` → `true`.
  - Trả `false` cho: `null`, `''`, `'Bearer x'`, `'Basic !!!'` (base64 hỏng, không ném), sai mật khẩu, sai user, `expected` rỗng.
  - So sánh dùng `timingSafeEqual` trên hai bản băm SHA-256, để độ dài khác nhau không lộ qua thời gian.

- [ ] **Step 3: Viết test `tests/unit/proxy.test.ts`** gọi `gate(new Request(url, { headers }), env)`.
  - Staging, không header → 401, `WWW-Authenticate` = `Basic realm="Chieu Hoi staging", charset="UTF-8"`, thân `Cần mật khẩu để xem bản thử nghiệm.`, `Cache-Control: no-store`.
  - Staging, đúng mật khẩu → đi tiếp (`x-middleware-next`), có `X-Robots-Tag: noindex, nofollow`.
  - Staging, thiếu `STAGING_AUTH` → 503, thân `Staging chưa đặt mật khẩu.`
  - Development → đi tiếp, có `X-Robots-Tag`.
  - Production → đi tiếp, **không** có `X-Robots-Tag`.
  - Đường dẫn `/admin`, `/api/archive-assets/file/a.webp`, `/preview` ở staging không có header → 401.

- [ ] **Step 4: Chạy, xác nhận FAIL.**

- [ ] **Step 5: Viết `src/lib/basicAuth.ts` và `src/proxy.ts`** cho test qua.
  - `config.matcher` loại `/_next/static/:path*` (R2), giữ mọi đường dẫn khác.

- [ ] **Step 6: Mở rộng rule lint kiến trúc**
  - `src/proxy.ts` chỉ được import `next/server`, `@/lib/env`, `@/lib/basicAuth`.
  - Thêm ca vào `tests/unit/architecture.test.ts` theo mẫu có sẵn.

- [ ] **Step 7: Chạy lint, unit, build và toàn bộ e2e**
  - Kỳ vọng: e2e vẫn xanh. Dev và :3100 không phải staging nên proxy chỉ gắn header.

- [ ] **Step 8: Commit** — `feat(phase-7): mật khẩu staging bằng proxy`.

---

### Task 3: Lưu ảnh trên S3/R2, khách đọc file ở staging, e2e ảnh

**Files:**
- Create: `src/storage.ts`, `tests/unit/storage.test.ts`, `tests/e2e/images.e2e.spec.ts`, `docker/minio/create-bucket.sh`
- Modify: `package.json` (`@payloadcms/storage-s3@3.92.0`, đúng phiên bản, không `^`), `src/payload.config.ts`, `src/collections/ArchiveAssets.ts` (`readAccess`), `docker-compose.yml`, `playwright.config.ts` (thêm `images.e2e` vào project `public`)

**Interfaces:**
- Consumes: `isStaging` (Task 1).
- Produces: `storagePlugins(env: Env): Plugin[]`, rỗng khi thiếu `S3_BUCKET`.

- [ ] **Step 1: Cài gói**
  - Lệnh: `npm install @payloadcms/storage-s3@3.92.0 --save-exact`.
  - Đọc `node_modules/@payloadcms/storage-s3` (README và `.d.ts`) để xác nhận tên tuỳ chọn.

- [ ] **Step 2: Viết test `tests/unit/storage.test.ts`**
  - `storagePlugins({})` → `[]`.
  - Đủ biến → mảng 1 phần tử.
  - Kiểm cấu hình bằng cách bọc factory: `storagePlugins(env, factory = s3Storage)`, test truyền factory giả và kiểm đối số:
    - `collections: { 'archive-assets': true }`;
    - `bucket` = `S3_BUCKET`;
    - `config.endpoint` = `S3_ENDPOINT`;
    - `config.region` = `S3_REGION ?? 'auto'`;
    - `config.forcePathStyle === true`;
    - `clientUploads === true` (R8);
    - **không** có `disablePayloadAccessControl: true` (R7).

- [ ] **Step 3: Viết `src/storage.ts`** cho test qua. Trong `payload.config.ts` đổi thành `plugins: storagePlugins(process.env)`.

- [ ] **Step 4: R5 trong `readAccess` của ArchiveAssets**
  - `if (isReadingStaticFile && isStaging(process.env)) return true`, đặt trước nhánh `publicAssetQuery`.
  - Thêm comment một dòng dẫn R5.
  - Thêm ca vào int test hiện có của access ảnh: staging đọc file được, liệt kê REST vẫn bị chặn; development vẫn như cũ.

- [ ] **Step 5: MinIO cho diễn tập (R11)**
  - Thêm service `minio` và `minio-init` (chạy `docker/minio/create-bucket.sh`) dưới `profiles: ['s3']`.
  - Ghim tag image cụ thể đã kiểm bằng `docker pull`, không dùng `latest`. MinIO đã ngừng phát hành image cộng đồng mới nên chọn tag cũ còn tải được. Nếu không tải được, dùng một S3 giả lập khác có hỗ trợ CORS và presigned URL, rồi ghi ruling.
  - Cổng host 9000/9001, bucket `chieuhoi-staging`, CORS cho `http://localhost:3200`.
  - `docker compose up -d` thường không khởi động chúng.

- [ ] **Step 6: Viết `tests/e2e/images.e2e.spec.ts`** (project `public`, :3100). Đóng mục backlog "seed chưa có asset `permitted`".
  - `beforeAll`:
    - đăng nhập người duyệt seed qua REST (`/api/users/login`);
    - tạo asset `inArchive`, `rights: 'permitted'`, `subjectConsent: 'not_applicable'`, mã `TL-E2E-{rand}`, đủ metadata, file `tests/fixtures/tiny.webp`;
    - đăng bản ghi.
  - `afterAll`: xoá asset.
  - Test 1: `/thu-vien` (khách) có ảnh với `src` chứa `/api/archive-assets/file/`; tải `src` → 200, `content-type` bắt đầu `image/`.
  - Test 2: lấy URL file của một asset seed (`rights: unknown`) qua REST khi đã đăng nhập; tải lại không cookie → 403.
  - Test 3: HTML của 7 route public không chứa `/_next/image` (R6).

- [ ] **Step 7: Chạy lint, unit, int, build và e2e đầy đủ.** Kỳ vọng: xanh. Dev không có `S3_BUCKET` nên vẫn lưu ảnh vào `media/`.

- [ ] **Step 8: Commit** — `feat(phase-7): lưu ảnh trên S3/R2, tắt bộ tối ưu ảnh, e2e ảnh được phép`.

---

### Task 4: Quét a11y (axe, phóng chữ, cỡ chữ, vùng chạm)

**Files:**
- Create: `tests/e2e/helpers/routes.ts`, `tests/e2e/a11y.e2e.spec.ts`
- Modify: `playwright.config.ts`; component có lỗi (sửa ở `ui`/`content`/`layout`)

**Interfaces:**
- Produces:
  ```ts
  export type AuditRoute = { path: string; name: string; screen?: { desktop: string; mobile: string } }
  export const AUDIT_ROUTES: AuditRoute[]
  export const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } }
  ```
  `AUDIT_ROUTES` dùng chung cho Task 5–8.

- [ ] **Step 1: Viết `tests/e2e/helpers/routes.ts`**
  - 11 route chính: `/`, `/nghe-det-chieu`, `/lang-hoi`, `/cau-chuyen`, `/con-nguoi`, `/san-pham`, `/thu-vien`, `/ket-noi`, cộng các trang chi tiết.
  - Trang chi tiết lấy slug thật từ seed (`content/seed/*.json`), không viết cứng:
    - bài "Chuyện về Trạng Chiếu";
    - người đầu tiên;
    - sản phẩm đầu tiên có điểm hoa văn.
  - `screen` ghép tên ảnh `design/screens`: Home/HomeMobile, CraftPage/CraftMobile, VillagePage/VillageMobile, StoriesIndex/StoriesMobile, StoryDetail/StoryMobile, PeopleIndex/PeopleMobile, PersonDetail/PersonMobile, ProductsIndex/ProductsMobile, ProductDetail/ProductMobile, ArchivePage/ArchiveMobile, ConnectPage/ConnectMobile.

- [ ] **Step 2: Viết `tests/e2e/a11y.e2e.spec.ts`.** Mỗi route × mỗi viewport là một test riêng, tên `a11y {name} {viewport}`.
  - axe với các thẻ R12 → `violations` rỗng. Khi lỗi, in `id`, `target` và `help` của từng vi phạm.
  - Cỡ chữ: mọi nút text hiển thị có `font-size` ≥ 12px.
  - Vùng chạm (chỉ 390):
    - Mọi `a`, `button`, `input`, `select`, `textarea`, `[role=tab]` hiển thị có hộp ≥ 44×44.
    - Ngoại lệ (WCAG 2.5.8 "inline"): `a` nằm trong đoạn chữ, tức tổ tiên gần nhất là `p`, `li`, `dd` hoặc `figcaption`. Ngoại lệ phải có comment.
  - Reflow: ở 320 và 640 px, `document.documentElement.scrollWidth <= innerWidth`.
  - Chạy ở cả hai server:
    - project `chromium` (preview, :3000);
    - project mới `a11y-public` (:3100, `testMatch: /a11y\.e2e/`, `dependencies: ['public']`).
    - Project `chromium` bỏ qua file này khi chạy cho `public`.

- [ ] **Step 3: Chạy và ghi danh sách vi phạm.**
  - Lệnh: `npm run test:e2e -- --project=chromium --project=a11y-public tests/e2e/a11y.e2e.spec.ts`.

- [ ] **Step 4: Sửa từng vi phạm ở component gốc**
  - Mỗi lần sửa kèm test unit ở component đó, nếu kiểm được bằng jsdom.
  - Vi phạm cần đổi thiết kế (ví dụ màu artboard không đạt tương phản): chỉ được bỏ qua bằng `disableRules` cho đúng selector đó, kèm comment dẫn mục trong báo cáo Task 10.

- [ ] **Step 5: Chạy lại cho tới khi xanh, rồi chạy toàn bộ e2e.**

- [ ] **Step 6: Commit**
  - Test và sửa lỗi có thể tách thành nhiều commit.
  - Commit cuối: `test(phase-7): quét axe, cỡ chữ, vùng chạm, reflow cho mọi route`.

---

### Task 5: Bàn phím

**Files:**
- Create: `tests/e2e/keyboard.e2e.spec.ts`
- Modify: component có lỗi

**Interfaces:**
- Consumes: `AUDIT_ROUTES`, `VIEWPORTS` (Task 4).

- [ ] **Step 1: Viết test duyệt Tab cho mỗi route ở 1440 (project `chromium`)**
  - Nhấn Tab tối đa 300 lần. Ở mỗi bước:
    - `document.activeElement` khác `body`;
    - phần tử đang focus nhìn thấy được: `checkVisibility({ opacityProperty: true, visibilityProperty: true })`, không nằm trong tổ tiên có `aria-hidden="true"` hay `inert`;
    - có viền focus: `outline-style` khác `none` và `outline-width` ≥ 2px, hoặc `box-shadow` khác `none`.
  - Dừng khi focus quay về phần tử đầu tiên, hoặc rời trang (về thanh địa chỉ).
  - Khẳng định: liên kết cuối của footer đã từng được focus, tức không bị kẹt focus.
  - Trên mobile, chạy tương tự ở 390 với menu đóng.

- [ ] **Step 2: Viết test tương tác**
  - **Menu mobile (390):**
    - Tab tới nút menu, Enter → `aria-expanded="true"`, focus vào trong menu.
    - Escape → menu đóng, focus về nút menu.
    - Khi menu mở, Tab không ra khỏi menu; nếu thiết kế cho phép ra ngoài thì nền phải `inert` (mục backlog Phase 1).
  - **Lightbox `/thu-vien`:** Enter trên ô ảnh mở `role=dialog`; Tab vòng trong hộp; Escape đóng và focus về ô đã mở.
  - **CraftJourney `/nghe-det-chieu`:** dùng Tab và Enter/Space trên Trước/Tiếp đổi được công đoạn, không dùng `focus()` trực tiếp (mục backlog Phase 4).
  - **Tabs:** phím mũi tên đổi tab theo `role=tablist`, nếu component đang hỗ trợ; nếu không, ghi lệch vào báo cáo, không tự thêm.
  - **PatternExplorer** `/san-pham/{slug}`: chọn điểm hoa văn bằng bàn phím.
  - **Form `/ket-noi`:** gửi form trống bằng Enter → `ErrorSummary` nhận focus.

- [ ] **Step 3: Chạy, sửa lỗi ở component gốc** (kèm test unit nếu được), chạy lại cho tới khi xanh.

- [ ] **Step 4: Commit** — `test(phase-7): kiểm dùng được bằng bàn phím trên mọi route`.

---

### Task 6: Giảm chuyển động và CLS

**Files:**
- Create: `tests/e2e/motion.e2e.spec.ts`
- Modify: component có lỗi

**Interfaces:**
- Consumes: `AUDIT_ROUTES`, `VIEWPORTS`.

- [ ] **Step 1: Viết test giảm chuyển động** (`test.use({ reducedMotion: 'reduce' })`). Với mỗi route ở 1440 và 390:
  - Ngay sau `load`, không cuộn: mọi phần tử của `Reveal` có `opacity` = 1 và không `transform`. Đọc selector từ component `Reveal`, không đoán.
  - `document.getAnimations().filter(a => a.playState === 'running')` rỗng sau 100 ms.
  - Mọi phần tử hiển thị có `transition-duration` và `animation-duration` ≤ 0.01s, trừ các thuộc tính màu ở trạng thái hover (không chạy khi chưa hover).
  - Cuộn tới cuối trang rồi kiểm lại: không có animation đang chạy.

- [ ] **Step 2: Viết test CLS** (không giảm chuyển động, project `a11y-public` trên :3100, bản build production):
  - Gắn `PerformanceObserver({ type: 'layout-shift', buffered: true })` qua `addInitScript`.
  - Tải trang, cuộn tới cuối từng 400 px, đợi 500 ms.
  - Tổng `value` của các entry không có `hadRecentInput` < 0.1, ở cả 1440 và 390.

- [ ] **Step 3: Chạy, sửa ở component gốc, chạy lại tới khi xanh.**

- [ ] **Step 4: Commit** — `test(phase-7): giảm chuyển động và CLS`.

---

### Task 7: Lighthouse

**Files:**
- Create: `tools/lighthouse.mjs`
- Modify: `package.json` (devDependency `lighthouse@13.5.0` exact; script `"audit:lighthouse": "node tools/lighthouse.mjs"`), `eslint.config.mjs` (nếu cần cho `tools/`)

- [ ] **Step 1: Viết `tools/lighthouse.mjs`**
  - Đối số: `--base=<url>` (mặc định `http://localhost:3100`), `--auth=user:pass` (tuỳ chọn, cho staging; gửi header `Authorization`), `--out=<file.json>`.
  - Đọc danh sách route bằng cách import `tests/e2e/helpers/routes.ts` qua `tsx`; không chép lại danh sách.
  - Mỗi route chạy hai lần: cấu hình mobile mặc định và cấu hình desktop (`lighthouse/core/config/desktop-config.js`).
  - Chrome lấy từ `chromium.executablePath()` của Playwright.
  - In bảng: route, form factor, Accessibility, Performance, CLS, LCP.
  - Ghi JSON tóm tắt (không ghi báo cáo đầy đủ, vì có thể chứa ảnh chụp) ra `--out`.
  - Thoát mã 1 nếu bất kỳ Accessibility < 95 hoặc CLS ≥ 0.1.

- [ ] **Step 2: Chạy với server :3100**
  - Lệnh: `npm run build && PREVIEW_ALL=false npm run start -- -p 3100`, rồi `npm run audit:lighthouse -- --out=.superpowers/lighthouse-public.json`.
  - Chạy thêm một lượt với bản preview: dev server :3000 không đại diện hiệu năng, nên build lần hai với `PREVIEW_ALL=true` ở cổng 3101.

- [ ] **Step 3: Sửa vi phạm**
  - Accessibility < 95 hoặc CLS ≥ 0.1: sửa ở component gốc. Performance thấp chỉ ghi vào báo cáo, không phải mục tiêu bắt buộc.
  - Chạy lại tới khi script thoát 0 trên cả hai bản.

- [ ] **Step 4: Commit** — `chore(phase-7): script Lighthouse (a11y ≥ 95, CLS < 0.1)`.

---

### Task 8: Chụp ảnh so sánh với thiết kế

**Files:**
- Create: `tests/e2e/screens.e2e.spec.ts`, `tools/screens-sheet.mjs`

**Interfaces:**
- Consumes: `AUDIT_ROUTES[].screen`.

- [ ] **Step 1: Viết `tests/e2e/screens.e2e.spec.ts`**
  - Bỏ qua trừ khi có `SCREENS=1`, theo mẫu các ca chụp ảnh đang có.
  - Với mỗi route có `screen`: chụp toàn trang bản preview (:3000) ở 1440 và 390 vào `test-results/screens/{screen}.png`, dùng đúng tên ảnh thiết kế. Đợi font tải xong (`document.fonts.ready`).
  - Thêm `MenuMobile` (menu đang mở ở 390) và `Components`/`Foundations` (`/styleguide` ở 1440).

- [ ] **Step 2: Viết `tools/screens-sheet.mjs`** (dùng `sharp` đã có)
  - Với mỗi cặp `design/screens/{name}.jpg` và `test-results/screens/{name}.png`: thu về cùng chiều rộng, đặt cạnh nhau, ghi `.superpowers/screens/{name}.png`.
  - Thư mục này gitignore; ảnh có chứa ảnh tham khảo, không commit.

- [ ] **Step 3: Chạy cả hai**, rồi xem từng ảnh ghép.

- [ ] **Step 4: Ghi danh sách điểm lệch vào báo cáo** (Task 10, mục "So với thiết kế"). Mỗi mục gồm:
  - màn hình và viewport;
  - vùng;
  - lệch gì;
  - phân loại: `dữ liệu` (CMS khác chữ/ảnh minh hoạ, đúng ý), `bố cục`, `kiểu chữ`, `màu`, `thiếu`;
  - mức độ: `rõ` hoặc `nhỏ`.
  - Không sửa giao diện ở task này (R14).
  - Đối chiếu các mục lệch đã có trong backlog để không trùng.

- [ ] **Step 5: Commit** — `test(phase-7): chụp ảnh so sánh với thiết kế`. Chỉ commit test và script, không commit ảnh.

---

### Task 9: Diễn tập staging ở máy và hướng dẫn deploy

**Files:**
- Create: `tests/e2e/staging.e2e.spec.ts`, `docs/DEPLOY.md`
- Modify: `package.json` (script `"ci": "cross-env NODE_OPTIONS=--no-deprecation payload migrate && npm run build"`), `playwright.config.ts` (project `staging`)

- [ ] **Step 1: Kiểm migration khớp schema**
  - Trên DB trống `chieuhoi_staging` (tạo bằng `psql` trong container postgres): chạy `npm run migrate` với `APP_ENV=staging`.
  - Rồi chạy `npm run migrate:create kiem-tra`, dùng cờ bỏ qua khi rỗng nếu Payload có.
  - Kỳ vọng: không sinh file migration mới. Nếu sinh, commit migration đó với tên `phase7_sync` và ghi lý do.

- [ ] **Step 2: Diễn tập đúng chuỗi lệnh của Vercel** với file `.env.staging.local` (gitignore, không in nội dung):
  - `APP_ENV=staging`, `PREVIEW_ALL=true`, `DATABASE_URI` → `chieuhoi_staging`;
  - S3 trỏ MinIO (`docker compose --profile s3 up -d`);
  - `SITE_URL=http://localhost:3200`, `STAGING_AUTH` ngẫu nhiên.
  - Chuỗi lệnh:
    - `npm run seed`
    - `npm run create-reviewer`
    - `npm run ci`
    - `npm run start -- -p 3200`
  - Nạp env bằng `dotenv -e` hoặc `env $(cat …)`, chọn cách không in giá trị.

- [ ] **Step 3: Viết `tests/e2e/staging.e2e.spec.ts`** (project `staging`)
  - `baseURL` = `STAGING_URL`, `httpCredentials` lấy từ `STAGING_AUTH`; bỏ qua cả file khi thiếu `STAGING_URL`.
  - Không cookie, không mật khẩu (`request.newContext` riêng): `/`, `/admin`, `/api/archive-assets/file/x.webp` → 401.
  - Có mật khẩu:
    - `/` → 200, header `X-Robots-Tag: noindex, nofollow`, có `<meta name="robots" content="noindex, nofollow">`;
    - `/robots.txt` chứa `Disallow: /`;
    - trang chủ có nhãn `[cần xác minh]` (R4);
    - mọi `img` trên `/`, `/thu-vien`, `/nghe-det-chieu` tải xong với `naturalWidth > 0` (R5, ảnh qua S3);
    - ảnh OG là URL tuyệt đối bắt đầu bằng `SITE_URL`.
  - Admin: đăng nhập người duyệt (biến `STAGING_REVIEWER_EMAIL`/`STAGING_REVIEWER_PASSWORD`, không in ra), tải `tests/fixtures/tiny.webp` lên `archive-assets`. Bản ghi có đủ `sizes.thumb/card/wide.url` (R8). Xoá bản ghi ở `finally`.
  - Chạy với `STAGING_URL=http://localhost:3200`. Kỳ vọng: xanh.
  - Nếu ca tải ảnh không sinh đủ cỡ: áp phương án dự phòng của R8, rồi chạy lại.

- [ ] **Step 4: `npm audit`** theo R15. Chạy lại lint, unit, int, build, e2e sau khi nâng gói.

- [ ] **Step 5: Viết `docs/DEPLOY.md`** (tiếng Việt). Mỗi bước ghi màn hình hoặc lệnh, giá trị cần chép và cách kiểm:
  - **Tạo tài khoản:**
    - Vercel Hobby, đăng nhập bằng GitHub;
    - Neon free: project `chieuhoi-staging`, region Singapore;
    - Cloudflare R2: bucket `chieuhoi-staging`, private.
  - **R2:** tạo API token chỉ đọc/ghi bucket đó; dán CORS JSON cho tên miền staging (`PUT`, `GET`, `HEAD`).
  - **Vercel:**
    - import repo private;
    - Build Command `npm run ci`, Node 22;
    - Function Region `sin1`;
    - bảng mọi biến môi trường (tên, ví dụ, bắt buộc ở đâu), nhắc `SITE_URL` = tên miền `*.vercel.app`.
  - **Nạp dữ liệu từ máy:** `.env.staging`, rồi `npm run migrate`, `npm run seed`, `npm run create-reviewer`.
  - **Kiểm sau deploy:**
    - `STAGING_URL=… STAGING_AUTH=… npm run test:e2e -- --project=staging`
    - `npm run audit:lighthouse -- --base=… --auth=…`
  - **Chuyển sang VPS:** `npm ci && npm run ci && npm run start` với cùng biến; MinIO hoặc R2.
  - **Production sau này:** DB và bucket riêng; không chạy seed; `APP_ENV=production` không có `PREVIEW_ALL`/`ALLOW_FIRST_USER`; xoá cache CDN khi thu hồi quyền ảnh không cần làm, vì đã tắt bộ tối ưu (R6).

- [ ] **Step 6: Dọn**
  - Tắt server :3200, dừng MinIO (`docker compose --profile s3 stop`).
  - Giữ DB `chieuhoi_staging` cục bộ, ghi trong `DEPLOY.md` cách xoá.

- [ ] **Step 7: Commit** — `chore(phase-7): diễn tập staging, e2e staging, hướng dẫn deploy`.

---

### Task 10: Báo cáo kiểm tra và backlog

**Files:**
- Create: `docs/superpowers/reports/2026-10-28-phase-7-kiem-tra.md`
- Modify: `docs/superpowers/backlog.md`, `CLAUDE.md` (mục "Stack": biến S3/staging, `npm run ci`, `audit:lighthouse`, `SCREENS=1`, `--no-deps`)

- [ ] **Step 1: Viết báo cáo** (tiếng Việt):
  - bảng Lighthouse của hai bản, chép từ JSON tóm tắt;
  - kết quả axe, bàn phím, giảm chuyển động, CLS, kèm số test;
  - mọi ngoại lệ axe đã cho phép, kèm lý do;
  - mục "So với thiết kế" (Task 8);
  - checklist a11y của HANDOFF, đánh dấu từng dòng đạt/chưa đạt kèm test chứng minh.

- [ ] **Step 2: Backlog**
  - Đánh `[x]` các mục đã đóng ở mục A, mỗi mục kèm "(Phase 7, R…)":
    - build guard;
    - `metadataBase`;
    - asset `permitted` trong e2e;
    - cache ảnh tối ưu;
    - race người dùng đầu tiên (R16);
    - các mục bàn phím (craft `focus()`, menu `inert`), nếu đã sửa.
  - Thêm mục mở mới vào "### Phase 7".
  - Cập nhật dòng "Cập nhật lần cuối".

- [ ] **Step 3: Chạy lint, unit, int, build và e2e đầy đủ.** Kỳ vọng: xanh, project `staging` bị bỏ qua vì không có `STAGING_URL`.

- [ ] **Step 4: Commit** — `docs(phase-7): báo cáo kiểm tra và backlog`.

---

### Task 11: Deploy staging thật (cùng người dùng)

**Task này tạo tài nguyên trên dịch vụ ngoài bằng tài khoản của người dùng. Người điều phối dừng và hỏi người dùng trước khi làm bất kỳ bước nào.**

- [ ] **Step 1: Hỏi người dùng**
  - Đã có tài khoản Vercel/Neon/Cloudflare chưa.
  - Muốn tự làm theo `docs/DEPLOY.md`, hay để Claude chạy CLI (`vercel`, `neonctl`, `wrangler`) sau khi người dùng tự đăng nhập bằng `! <lệnh login>`.
  - Repo cần được đẩy lên GitHub ở dạng **private**. Hỏi trước khi push.
- [ ] **Step 2: Làm theo `docs/DEPLOY.md`** với lựa chọn của người dùng. Không in secret ra.
- [ ] **Step 3: Kiểm sau deploy:** chạy project `staging` và `audit:lighthouse` với URL staging. Ghi kết quả vào báo cáo, commit `docs(phase-7): kết quả trên staging`.
- [ ] **Step 4: Hết phase.**
  - Báo người dùng: URL staging, nơi lấy mật khẩu (người dùng tự giữ), ảnh chụp 1440/390, báo cáo, mọi ruling kèm cái giá nếu sai.
  - Dọn workspace SDD theo quy tắc backlog.
