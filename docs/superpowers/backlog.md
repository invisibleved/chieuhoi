# Việc tồn đọng (backlog)

Gom các mục review để lại sau Phase 1–7. Cập nhật lần cuối khi kết thúc Phase 7 (nhánh phase-7-staging-kiem-tra).
Quy ước: mỗi phase kết thúc phải chép các mục còn mở vào đây **trước** khi xoá thư mục `.superpowers/sdd/<plan>/`.

## A. Phải xong trước khi deploy staging/production (Phase 6–7)

- [x] (Phase 7, R10, R16: `assertDeployEnv` trong `src/lib/env.ts` làm build dừng khi `APP_ENV` thiếu/sai, hoặc production có `PREVIEW_ALL=true`/`ALLOW_FIRST_USER=true`; deploy chạy `npm run ci` = migrate + build; test `tests/unit/env.test.ts`. Staging chủ ý bật `PREVIEW_ALL=true` (R4). Phần "mode chốt lúc build" của các trang tĩnh vẫn còn ở các mục `generateStaticParams`, `/san-pham`, `/thu-vien` bên dưới.) (Phase 6 đã giải: bản preview qua Draft Mode + `/preview`, nội dung mới cập nhật qua revalidate.) `/` đang prerender tĩnh: `getMode()` chốt lúc build → build bằng `.env` dev sẽ đóng băng bản preview (placeholder, ảnh chưa duyệt) vào HTML. Cần render động hoặc revalidate + draft mode, và chặn build production khi `PREVIEW_ALL=true`. Cùng vấn đề cho mọi trang dùng `getMode` (Phase 1 T11: settings/mode chốt lúc build).
- [x] Link 404 cho tới khi có trang: `/san-pham`, `/san-pham/*`, `/thu-vien`, `/ket-noi` và chú thích nguồn hoa văn → trang hiện vật đã có (Phase 5b); `tests/e2e/links.e2e.spec.ts` duyệt link từ header, footer và 5 trang chính.
- [x] `Sources.url` chỉ nhận `http(s)://` ở admin và lib bỏ url khác giao thức khỏi view model (Phase 6, R10).
- [ ] `.npmrc` `legacy-peer-deps=true` che xung đột peer; `npm audit` còn 10 cảnh báo (2 thấp, 5 vừa, 3 cao) sau khi nâng `sharp` 0.35.5. Giữ `legacy-peer-deps` trong Phase 7 (R15). Chi tiết ở mục Phase 7 bên dưới.
- [x] (đã đóng Phase 7 T1) `metadataBase` chưa đặt → URL ảnh OG của bài viết/chân dung là đường dẫn tương đối (Next cảnh báo). Đặt theo tên miền khi deploy (Phase 5a T6).
- [ ] `/cau-chuyen/[slug]`, `/con-nguoi/[slug]`: `generateStaticParams` chỉ gồm bản ghi public, nhưng mode vẫn chốt lúc build như mục đầu tiên (Phase 5a R20).
- [x] E2E public: regex `page.content()` không bắt được URL `next/image` đã mã hoá (`%2Fimages%2Freference`) → `public-pages.e2e.spec.ts` dùng `REFERENCE_IMAGE` nhận cả dạng mã hoá, chạy trên 7 route (gồm 4 route Phase 5b) (Phase 5b T11).
- [x] E2E public: seed chưa có asset `permitted` nên vòng kiểm ảnh qua vì không có ảnh nào để kiểm → `tests/e2e/images.e2e.spec.ts` (project `public`, :3100) tạo asset `permitted` cô lập, kiểm file phục vụ qua Payload và URL file chưa được phép vẫn 403 (Phase 7, R5, R6). Còn sót: `afterAll` bỏ qua kết quả DELETE (xem mục Phase 7).
- [ ] `/thu-vien` đọc `searchParams` nên là route động (R11 Phase 5b): render theo từng request, ngược với mục đầu tiên (mode chốt lúc build). Cân nhắc cache theo mode khi deploy.
- [ ] `/san-pham`, `/san-pham/[slug]`, `/ket-noi` prerender tĩnh như trang chủ: mode chốt lúc build, build bằng `.env` dev sẽ đóng băng bản preview (mục đầu tiên). `/ket-noi` còn đọc `SiteSettings` lúc build; phần "sửa trong admin không thấy ngay" đã xong nhờ revalidate (Phase 6, R2).
- [x] Ảnh `next/image` đã tối ưu còn trong cache sau khi thu hồi quyền ảnh (R12 Phase 6) → đã đóng bằng `images.unoptimized: true`, không còn cache của bộ tối ưu; ảnh đi qua file `thumb`/`card`/`wide` do Payload tạo (Phase 7, R6). Hệ quả: `localPatterns` của `next.config` không còn tác dụng; ảnh mobile nặng hơn một chút.
- [x] Race bootstrap user đầu tiên (`ALLOW_FIRST_USER`, chỉ dev; R12 Phase 6) → ngoài dev bị cấm: `assertDeployEnv` không cho `ALLOW_FIRST_USER=true` ở staging và production; người duyệt đầu tiên tạo bằng `npm run create-reviewer`. Race còn ở dev, không đáng sửa (Phase 7, R16).

## B. Phải làm trong Phase 4–5

- [x] Nhãn tiếng Việt cho `Products.group` và `ArchiveAssets.era` (`groupLabel`, `eraLabel` trong view model — Phase 4).
- [x] `ArchiveTeaser` tự chép `LABELS` → nhãn chip lấy từ `categories.ts` qua props (Phase 4).
- [x] Trang hiện vật đánh số nguồn theo đúng thứ tự trang chủ đang dùng cho chú thích hoa văn (`ProductView.sources`, `sourceN`, khối "Nguồn" với neo `#nguon-{n}` — Phase 5b R2).
- [x] Renderer rich text bỏ `cite` trỏ tới nguồn đã xoá (Phase 1 final).
- [x] Timeline: mục "+ Mốc của bạn" là phần tử tĩnh, không phải dữ liệu (Phase 1 R18) — làm ở Phase 4 (R6).
- [x] Rich text chưa có khối ảnh; nếu cần thì thêm khối ảnh đã kiểm soát quyền (Phase 1 R16).

## B2. Vi phạm kiến trúc / component chung (quy tắc trong `CLAUDE.md`) — đã sửa ở Phase 4 (Task 1–2)

- [x] `SiteHeader.tsx:3`, `SiteFooter.tsx:3` gọi `getMode`/`getSiteSettings` trong component → chuyển việc lấy dữ liệu lên `app/(frontend)/layout.tsx`, truyền view model qua props.
- [x] `components/home/hasPattern.ts`, `components/home/tlCode.ts` là luật nghiệp vụ → chuyển vào `lib/content` (trả sẵn trong view model, ví dụ `ProductView.hasPattern`, `ArchiveItemView.docNumber`).
- [x] `ArchiveTeaser.tsx:24` tự chép nhãn option → dùng `categories.ts`.
- [x] Eyebrow `tracking-[.22em] text-accent md:tracking-[.24em]` viết lặp ở 6 file `home/*` (Hero, VillageIntro, PeopleTeaser, StoriesTeaser, ProductsTeaser, ArchiveTeaser) → token eyebrow + component `ui/Eyebrow` (hoặc dùng `SectionHeading`).
- [x] Dải cuộn ngang mobile viết lại ở `CraftTeaser.tsx:100` và `PeopleTeaser.tsx:33` → `ui/ScrollStrip`.
- [x] `CraftTeaser` `Progress` sẽ cần ở trang Nghề dệt chiếu → chuyển lên `ui` khi Phase 4 dùng lại.
- [x] `rgba(40,39,36,.2)` viết cứng (Phase 2) → token.

## B3. Phase 4

- [x] `getSources` không nhận mode (đã sửa ở Phase 4).
- [ ] `home` chuyển sang `media` slot (R2): hiện trang chủ vẫn lấy ảnh từ ô cũ, chưa dùng slot media như hai trang Phase 4.

## C. Lỗi nhỏ còn mở

### Admin dễ dùng
Plan `docs/superpowers/plans/2026-10-29-admin-de-dung.md`. Admin về giao diện gốc của Payload, chỉ giữ trang Hướng dẫn (`src/admin/`).
- [ ] Nút "Thêm: Review Checklist" trong form còn tiếng Anh.
- [ ] Chưa có dịch vụ email nên "Quên mật khẩu" không gửi thư; hiện phải nhờ người duyệt đặt lại. Cần một email adapter cho Payload.
- [ ] Ô "Đường dẫn" (tên ngắn không dấu, nối gạch ngang) là chỗ khó với người trong làng; cân nhắc tự sinh từ tiêu đề.
- [ ] Thứ tự chạy: `test:int` rồi mới `guide:seed` (cả hai xoá sạch `chieuhoi_test`), không chạy song song.
- [ ] Toast lỗi của Payload còn chữ tiếng Anh "Field" (khoá `followingFieldsInvalid`); sửa được bằng ghi đè bản dịch `vi` trong `i18n.translations`.
- [ ] `guide:shots` để lại `.next` build trên DB test; chạy `npm run build` lại trước `test:e2e`/`start`. Nên dùng thư mục build riêng hoặc in cảnh báo.
- [ ] `.superpowers/guide-media` phình dần: seeder xoá hàng trong DB nhưng không xoá file ảnh.
- [ ] Bộ chọn ngôn ngữ gốc của Payload không đạt tương phản màu; axe của trang Hướng dẫn chỉ quét trong `.ch-guide`.
- [ ] `GuideNavLink` viết cứng `/admin` (`GUIDE_HREF`), không theo `routes.admin` của config.
- [ ] Ảnh hướng dẫn chụp desktop chỉ còn ~360px trên điện thoại, người đọc phải phóng to.
- [ ] Nếu `GUIDE_SHOTS=1` lọt vào môi trường (vd. `.env`), `playwright.config.ts` tắt `webServer` và `globalSetup` của `test:e2e`.
- [ ] Chốt `MEDIA_DIR` của seeder hướng dẫn tính theo cwd và không theo symlink.
- [ ] Ảnh chụp desktop luôn DPR 1 (mờ trên màn hình độ phân giải cao).
- [ ] Chú thích đầu `custom.scss` bị lặp hai dòng.
- [ ] E2E logo trang đăng nhập dựa vào lớp nội bộ `.graphic-logo` của Payload.
- [ ] Hướng dẫn "Viết một bài": bước "bản nháp và đăng" đọc như ghi chú, không phải một việc cần làm.
- [ ] Hướng dẫn "Đăng bài": bước 1 ("Trong menu, bấm Bài viết") ngầm cho rằng menu đã mở trên điện thoại.
- [ ] Kiểm Task 6: nút xem trước gốc của Payload ở 390 chỉ ~17×30px (dưới 44×44), nằm sát trái nút "Lưu bản nháp" đúng như hướng dẫn tả.
- [ ] Kiểm Task 6: ở 390, mở menu thì trang rộng ~570px (khối nội dung bị đẩy sang phải, cuộn ngang), là hành vi gốc của Payload.
- [ ] Kiểm Task 6: biên tập viên thấy cả nhóm Quản trị (Người dùng), Nguồn và Trang trong menu và trang đầu (admin gốc, không ẩn); hướng dẫn chỉ đúng nhóm Tư liệu/Nội dung nên không sai, nhưng menu dài hơn cần.
- [ ] Bộ chọn "Ngôn ngữ" gốc trên thanh trên cùng chỉ có một lựa chọn (Tiếng Việt), dễ làm người trong làng bối rối; ẩn hoặc giải thích khi chỉ có một ngôn ngữ.
- [ ] `GuideView` và `GuideNavLink` chưa có test unit, chỉ có e2e (`admin-ui.e2e.spec.ts`); một test RTL cho `aria-current` của `GuideNavLink` là đủ rẻ.
- [ ] `public/admin-guide` (ảnh và `labels.json`) được phục vụ công khai, không cần đăng nhập; chỉ chứa dữ liệu mẫu, chấp nhận có chủ ý (ruling A4).

### Phase 7 (Staging, kiểm tra)
Mã `Task N` là task trong plan Phase 7.
- [ ] Phase 7: chạy `npm run dev` một lần trên DB dev cũ trước `npm run build` (2 cột mới `prefix`, `_objectkey` của migration `phase7_sync` được đẩy bằng `push`; nếu không, build lỗi `column archive_assets.prefix does not exist`). Chưa ghi vào README/HANDOFF.
- [x] Task 1: (đã sửa: `isValidStagingAuth` dùng chung cho build và proxy) kiểm `STAGING_AUTH` trong `assertDeployEnv` chỉ yêu cầu có `:` (`":"`, `"user:"`, `":pw"` qua build nhưng proxy trả 503 lúc chạy) → dùng một vị từ chung trong `env.ts` cho cả build và proxy (Task 2 ghi lại cùng lỗi).
- [ ] Task 1: `siteUrl` ném `TypeError` trần khi `SITE_URL` sai định dạng ở dev.
- [ ] Task 1: thiếu test staging cho phép `PREVIEW_ALL=true`; test robots thiếu ca `APP_ENV` không hợp lệ.
- [ ] Task 1: `images.localPatterns` vô hiệu khi `unoptimized: true` (giữ theo brief); dọn khi chắc không quay lại bộ tối ưu.
- [ ] Task 2: test `basicAuth` thiếu ca scheme chữ thường, nhiều dấu cách, khoảng trắng cuối; test matcher chỉ xấp xỉ path-to-regexp.
- [ ] Task 3: `images.e2e` có `expect(assetFileUrl)` đệm trong test 403; `afterAll` bỏ qua kết quả DELETE (có thể để lại asset `permitted` mồ côi); test R6 "không có /_next/image" vô nghĩa ở route không có ảnh.
- [x] Task 3: (đã sửa lời ở Task 9, comment không còn nói kéo được) comment trong `docker-compose.yml` về tag MinIO: chỉ xác minh với image có sẵn ở máy, chưa kéo được từ quay.io (đã sửa lời ở Task 9; vẫn chưa xác minh trên máy khác).
- [ ] Task 3: e2e `stories` "sao chép đường dẫn" ở 390 chập chờn (không liên quan tới Phase 7).
- [x] Task 4: `products.e2e` PatternTeaser (bấm điểm 2 rồi link nguồn) chập chờn khi tải nặng → đã ổn định ở commit 22a11c3 (chờ `toBeInViewport()` + `expect.poll`), 12/12 qua với `--repeat-each=12 --workers=8` (Phase 7 T6).
- [ ] Task 4: quy tắc vùng chạm pseudo-element trong `a11y.e2e` rộng hơn cần thiết (nên đòi mỗi pseudo ≥ 44 ở cả hai trục, chứa tâm phần tử, `pointer-events` ≠ none); kiểm reflow chỉ đọc `documentElement.scrollWidth`.
- [x] Task 4: (đã phủ: `keyboard.e2e` `axeClean` quét các trạng thái mở) trạng thái mở (chip `aria-pressed`, v.v.) ngoài menu và lightbox chưa quét axe.
- [ ] Task 4: hai chú thích sát nhau (`[1][2]`) có vùng chạm 44px chồng nhau (mỗi số còn ≥ 24px); tách hẳn cần đổi khoảng cách trên artboard.
- [ ] Task 5: test CraftJourney `.focus()` bước hiện tại trước khi Tab; locator `next`/`nextName` rối; test menu mở nút bằng `.focus()`; viền focus chấp nhận `box-shadow` (CLAUDE.md cấm bóng đổ); selector điểm hoa văn `.rounded-full` mong manh; đường danh sách nút của PatternExplorer chưa có test bàn phím.
- [ ] Task 6: CLS chỉ đo `scrollHeight` một lần; unit test `craft-teaser` chỉ kiểm chuỗi class; báo cáo sửa lỗi thiếu lệnh chạy chính xác.
- [ ] Task 7: `lighthouse.mjs` coi mọi non-200 kể cả 3xx là lỗi (chưa đặt `redirect: 'manual'`); fetch timeout in stack thô thay vì dòng `FAIL`; so sánh `a11yRaw*100` là số thực; JSON ghi CLS chưa làm tròn; `--auth` lộ trong argv.
- [ ] Task 7: Performance mobile ở bản public chỉ 76–85 (LCP ~4–5 giây), không phải mục tiêu bắt buộc. Xem lại sau khi quyết định R6 (tắt bộ tối ưu ảnh, không có `srcset`) và kích thước ảnh `card`.
- [x] Task 8 (mũi tên đã sửa lời trong báo cáo; các ý còn lại vẫn mở): báo cáo ghi mũi tên là "⟶" nhưng `LinkArrow` vẽ "→" (khoảng cách và gạch chân mới là chỗ lệch thật); mục Components và Foundations chụp `/styleguide` hai lần; vài dòng gộp nhiều điểm lệch.
- [ ] Task 9: e2e staging `expect(del.ok())` trong `finally` có thể che lỗi đầu tiên hoặc để lại asset; kiểm OG so với `STAGING_URL` thay vì `SITE_URL`; guard R5 trong int test (`typeof result === 'object'`) yếu, đường phục vụ S3 chỉ được e2e staging phủ; project `staging` nhận diện bằng argv (hỏng thì chạy thừa/chặn nhầm, không mở site).
- [ ] Task 9: mỗi lần admin tải ảnh qua `clientUploads` + đổi tên R24 để lại một object gốc mồ côi `<_objectKey>/<tên gốc>` trong bucket (private, không phục vụ, nhưng tốn chỗ và giữ tên file gốc của người tải). Sửa: xoá object gốc trong `afterChange` khi tên đổi, hoặc đổi tên phía client trước khi xin signed URL.
- [ ] Task 9: e2e staging `admin-upload` tạo/xoá một asset thật trên staging đã deploy và để một object mồ côi ở R2 mỗi lần chạy.
- [ ] Task 9 / `npm audit` (R15), 10 cảnh báo còn lại: `happy-dom` 20.14.6 (cao; qua `@payloadcms/richtext-lexical` → `@lexical/headless`, sửa cần happy-dom 21 là bản major, npm gợi ý hạ richtext-lexical 3.78.0 là phá vỡ; chờ Payload/Lexical); `@lexical/headless` và `@payloadcms/richtext-lexical` (cao, cùng chuỗi); `deepmerge` qua payload (thấp, chưa có bản sửa); `esbuild` ≤ 0.24.2 qua `@esbuild-kit` → `drizzle-kit` → `@payloadcms/db-postgres` (vừa, chỉ ảnh hưởng dev server, chưa có bản sửa); `payload`, `@payloadcms/db-postgres`, `drizzle-kit`, `@esbuild-kit/*` (thấp/vừa, là cha của các mục trên).
- [ ] Cuối Phase 7 (a): mỗi lần admin tải ảnh, object gốc mồ côi giữ tên file gốc của người tải trong bucket. PHẢI sửa trước khi production nhận ảnh tải lên thật.
- [ ] Cuối Phase 7 (b): e2e 401 của staging nên thử thêm `/_next/image?url=…`, một request `_rsc`, `/api/graphql`, `/robots.txt`.
- [ ] Cuối Phase 7 (c): Lighthouse `--auth` lộ trong argv; cân nhắc đọc từ biến môi trường.
- [x] Cuối Phase 7: đã sửa ở fix wave cuối: `APP_ENV=development` + `next start` không còn mở preview, `assertDeployEnv` từ chối development khi có `VERCEL`; `isValidStagingAuth` dùng chung; helper `openAuditRoute` kiểm HTTP status; `tools/check-env.mjs` chạy trước migrate trong `npm run ci`; eslint ép `env.ts`/`basicAuth.ts`; `chrome-launcher` vào devDependencies.
- [ ] Việc cần người dùng: chưa deploy staging thật. Cần tài khoản Vercel, Neon, Cloudflare R2 theo `docs/DEPLOY.md` (Task 11 dừng chờ người dùng).
- [ ] Điểm lệch so với thiết kế (Task 8; xem `docs/superpowers/reports/2026-10-28-phase-7-kiem-tra.md`, mục "So với thiết kế"; 66 dòng: 7 `rõ`, 59 `nhỏ`; Phase 7 chỉ liệt kê, không sửa giao diện — R14). Mỗi mục dưới đây trỏ tới một phần của báo cáo:
  - Toàn site (header, footer, link): 15 dòng, trong đó 1 `rõ`.
  - Trang chủ — Home / HomeMobile: 7 dòng.
  - Menu mobile — MenuMobile: 2 dòng.
  - Nghề dệt chiếu — CraftPage / CraftMobile: 2 dòng.
  - Làng Hới — VillagePage / VillageMobile: 5 dòng, trong đó 1 `rõ`.
  - Câu chuyện — StoriesIndex / StoriesMobile: 6 dòng, trong đó 2 `rõ`.
  - Bài câu chuyện — StoryDetail / StoryMobile: 5 dòng.
  - Con người — PeopleIndex / PeopleMobile: 3 dòng.
  - Chân dung — PersonDetail / PersonMobile: 2 dòng.
  - Sản phẩm — ProductsIndex / ProductsMobile: 4 dòng.
  - Chi tiết sản phẩm — ProductDetail / ProductMobile: 4 dòng.
  - Thư viện — ArchivePage / ArchiveMobile: 3 dòng, trong đó 1 `rõ`.
  - Kết nối — ConnectPage / ConnectMobile: 2 dòng.
  - Component / Nền tảng — Components / Foundations so với `/styleguide`: 6 dòng, trong đó 2 `rõ`.
- [ ] Điểm lệch mức `rõ` (7 mục, nên sửa trước tiên):
  - Link mũi tên `LinkArrow` và link chữ đứng riêng: thiết kế gạch chân, mũi tên cách chữ ~10px; build không gạch chân, mũi tên dính liền chữ (toàn site, cả `/styleguide`).
  - `/lang-hoi` 1440: khoảng giữa đầu trang và ảnh lớn ~150px, thiết kế ~56px.
  - `/cau-chuyen` 1440: ô tìm kiếm đầu trang hẹp (~230px so với ~360px), placeholder bị cắt.
  - `/cau-chuyen` 1440 + 390: đoạn mô tả trong thẻ bài dùng serif, thiết kế dùng sans (Be Vietnam Pro).
  - `/thu-vien` 1440 + 390: header/footer nền sáng, artboard vẽ nền tối (đã có trong backlog, do layout dùng chung).
  - `/styleguide` 1440, "Thành phần di sản": chỗ "Bước công đoạn" và "Điểm hoa văn" chỉ còn khung "Làm ở Phase 4/5.".
  - `/styleguide` 1440, "Lightbox thư viện": chỉ còn khung "Làm ở Phase 5.".
- [ ] Cần người dùng quyết (3 điểm lệch mang tính phán đoán, không rõ build hay thiết kế đúng):
  - Mục nav đang ở có gạch chân màu rơm: artboard các trang không vẽ, chỉ `Components` vẽ ("03 · trang hiện tại: gạch chân sợi rơm"). Giữ hay bỏ.
  - Eyebrow đầu trang ở mobile: thiết kế mobile không có gạch ngang phía trước, build có ở mọi trang.
  - Các đường kẻ sợi thêm so với thiết kế: dưới khối "Nghề dệt chiếu" ở trang chủ, trên "Di sản hôm nay" ở `/lang-hoi` (và thiếu đường kẻ giữa "Vị trí" và "Đời sống làng"), giữa khung nguyên tắc và bộ lọc ở mobile Con người/Câu chuyện.

### Phase 6 (Admin)
Mã `Task N` là task trong plan Phase 6.
- [x] Đã điều tra (Phase 6 final): sau khi người duyệt đăng trong admin, tải lại trang thấy trạng thái "Đã thay đổi". Hook của ta (`syncWorkflow`/`guardPublish`/revalidate) không tạo thêm version. Trong e2e đó là bản nháp mới hơn thật, hoặc tải lại trước khi PATCH đăng xong. Trong admin, nút đăng theo locale ("Xuất bản trong Tiếng Việt") của Payload lưu thêm một version nháp chụp lại với thời điểm muộn hơn, nên trạng thái đọc là "Đã thay đổi". Không ảnh hưởng trang công khai (bản đã đăng vẫn đúng).
- [ ] Chốt "giữ ít nhất một người duyệt" (`beforeOperation` của Users) chạy trước kiểm quyền: biên tập viên thử xoá/hạ người duyệt duy nhất nhận lỗi 400 thay vì 403. Không lộ dữ liệu (Phase 6 final).
- [ ] Hướng dẫn biên tập: người duyệt dùng "Xuất bản tài liệu", không dùng "Xuất bản trong Tiếng Việt", để tránh trạng thái "Đã thay đổi" gây nhầm (ghi vào tài liệu hướng dẫn admin).
- [ ] Task 1: `Makers`/`People` dùng chung một object `controlAdmin` cho nhiều trường (có thể bị sửa chung khi sanitize) → gọi `controlFieldAdmin()` cho từng trường; dòng literal dài ở `People.ts`/`Makers.ts`.
- [ ] Task 1: `admin-config.test.ts` export `collections`/`globals` từ file test (plan bắt buộc); import lại sẽ đăng ký lại describe → tách helper dùng chung.
- [ ] Task 2: url `Sources` ở preview bị `isHttpUrl` bỏ (chưa test); `validateHttpUrl` chỉ kiểm tiền tố, `"https://a b"` qua admin rồi bị lib bỏ → khớp `[^\s]+`.
- [x] Task 2: `context.skipLastReviewerGuard` là lối tắt chỉ cho test trong hook Users (local API) → đã ghi chú trong code; kiểm tra hạ vai trò nay là "vai trò mới không còn là người duyệt" (Phase 6 final fix).
- [x] Task 2: xoá/hạ hàng loạt mọi người duyệt qua được guard vì Payload chạy hook từng bản ghi song song trong một transaction → guard chuyển sang `beforeOperation` của Users, tính trên cả tập bản ghi bị nhắm; có test int (Phase 6 final fix).
- [ ] Task 3: `safeInternalPath` kiểm `/admin|/api` phân biệt hoa thường (`/Admin` qua; Next route phân biệt hoa thường nên chỉ 404) → thêm cờ `i`. Thiếu test `previewFor('archive-assets')` trả null với bản ghi không lưu trữ qua hàm admin. Thứ tự import ở `ArchiveAssets.ts` và các collection; `routes.test.ts` không có lượt RED.
- [ ] Task 4: `aria-label` "Chế độ xem trước" của `PreviewBar` viết cứng trong component (nên ở `previewCopy`/view); styleguide viết cứng `/preview/exit` thay vì `PREVIEW_EXIT_ROUTE`. Thiếu unit test href thoát có `?anh=`; int `canPreview` chỉ kiểm đường JWT header (đường cookie do e2e kiểm). Layout await `getSiteSettings` và `getPreviewBar` tuần tự (→ `Promise.all`).
- [x] Task 4: redirect `/preview(/exit)` đặt `Cache-Control: private, no-store` (Phase 6 final fix).
- [x] Xem trước gắn với phiên admin: cookie `__prerender_bypass` dùng chung cả bản build nên `getMode`/`getPreviewBar` kiểm thêm phiên Payload khi Draft Mode bật; đăng xuất là mất xem trước (Phase 6 final fix).
- [ ] Task 5: tiêu đề test `admin-config` ghi "7 nội dung" (thực tế 6); hai câu hook của global cùng một dòng; seed không đặt `disableRevalidate` (dựa vào nhánh nuốt lỗi); kiểu `revalidator` hẹp hơn của Next.
- [ ] Revalidate chạy cả khi lưu bản nháp (render lại thừa, R2 chấp nhận); có thể bỏ qua khi `context.publishingDraftArg` và tài liệu chưa đăng.
- [ ] E2E workflow: chờ toast thành công sau khi bấm "Xuất bản tài liệu" rồi mới poll trang công khai.
- [ ] Task 6: selector admin trong e2e dựa lớp nội bộ Payload `.doc-controls__popup .popup-button`; chromium phụ thuộc `workflow` nên workflow lỗi thì e2e dev bị bỏ qua (cần ghi vào tài liệu chạy test); khôi phục site-settings đăng lại email đã đăng (mất bản nháp chờ); `finally` chỉ `console.error` khi khôi phục lỗi mà không có lỗi trước → email có thể vẫn bị đổi; chưa kiểm bấm "Đăng" thành công trước khi poll trang công khai; `loginReviewer` trên :3100 chưa xác minh `baseURL`.

### Phase 5b (Sản phẩm, Thư viện, Kết nối)
Mã `T1`–`T10` là task trong plan Phase 5b.

**Lớp lib/content và view model**
- [ ] `getProduct` (`queries.ts`) dài ~80 dòng, trộn chú thích, chú thích ảnh và nguồn → tách helper `annotationViews`, `imageCaptions` (T1).
- [ ] `others` (hiện vật khác): `eyebrow` là `''` khi mã bị ẩn, component phải render an toàn (T1).
- [ ] Nguồn bị ẩn thì `sourceNote` viết tay cũng bị ẩn; chưa có test cho ca có `sourceNote` (T1). Test cơ sở dệt thiếu ca nháp nhưng có đồng ý và ca preview hiện liên hệ (T1).
- [x] Cơ sở đã đăng nhưng không có liên hệ: nhánh chọn trong view model (`ProductView.contactLine`; câu "Chưa có cơ sở…" chỉ khi không có cơ sở; T8; sửa ở `fd68826`).
- [ ] Không có guard h1 khi tên hiện vật null; `optionalText` chưa có test riêng; `ReadNext` đặt lề theo `p.sources.length` (bố cục phụ thuộc dữ liệu) (T8).
- [x] `archive.ts`: nhãn Xưa/Nay dựng từ `ARCHIVE_ERA_OPTIONS` (`archiveEraOptions`), bỏ tham số `_payload` thừa (T2; sửa ở `fd68826`).
- [ ] Thiếu test: nhãn `restricted`, nhãn quyền `permitted` mobile, bỏ tư liệu không có mã (T2).
- [ ] `connect.int.spec` chỉ reset liên hệ ở nhánh thành công → dùng `try/finally` (T2).
- [ ] Seed `page-intros` (tiêu đề `/ket-noi` có `\n`) chỉ cập nhật khi chạy `SEED_FORCE_GLOBALS` trên DB đã có dữ liệu; `products.json` đổi dòng cuối (T1, T2).
- [x] `docNumber ?? code` và nhãn ô ảnh đã chuyển sang view model (`displayCode`, `docLabel`, `chipLabel`; T5; sửa ở `fd68826`).
- [ ] `ProductsView` ghép số đếm bằng `fillTemplate` trong component → helper/view model (T7).
- [ ] `connectContact`: `mailHref`/`telHref` còn lỏng (khoảng trắng giữa chuỗi; ở preview "[cần xác minh] 0123" vẫn thành link) (T10).
- [ ] `src/lib/content/pages.ts`: import `./connectContact` sai thứ tự chữ cái (T10).
- [ ] `ConnectView` đọc `contact.mobileLine?.separator` thừa bên trong `.map` (T10).
- [ ] `generateMetadata` của `/thu-vien` có thể trả title rỗng khi cả intro và breadcrumb null; URL OG tương đối (xem `metadataBase` ở mục A) (T9).

**Component dùng chung**
- [ ] `PeopleView` truyền `href ?? undefined` nên chuỗi rỗng vẫn render `Link href=""` → dùng `||` (T3).
- [ ] `Button` bỏ qua `size` với biến thể không phải outline (T3).
- [ ] `ShotNeeded` tự chuyển desktop/mobile như `VariantText`; `FactList columns=2` với số mục lẻ thiếu đường kẻ mục kế cuối, chưa test; `Segmented` pill sáng không có gap (có thể viền đôi, đối chiếu artboard); test `cards` so chuỗi con thay vì `aria-label` chính xác (T3).
- [x] `PatternExplorer`: đóng chi tiết trả focus về điểm đã chọn; điểm ẩn có `aria-hidden` (T4; `fd68826`).
- [ ] `PatternExplorer` còn lại: `StageHint` render chip rỗng khi copy null; viền ảnh nhỏ đang chọn có thể che vòng focus; nút danh sách khi tiêu đề null chỉ có số; test ảnh đơn kiểm "không có nhóm" có thể qua vì rỗng (T4).
- [x] Nhãn "n · tiêu đề" và `aria-label` điểm đã vào lib (`markerLabel`, `pickerLabel`; T4; sửa ở `fd68826`).
- [ ] Lightbox: `open(code, opener:boolean)` dùng cờ và `useCallback` thừa; vuốt cũng chạy với chuột kéo ở desktop; focus về ô đã mở chứ không về ô của ảnh hiện tại sau Trước/Tiếp; bẫy focus coi `visibility:hidden` là nhìn thấy (`getClientRects`); thiếu test click kèm phím bổ trợ; chú thích test "hidden-focus" khó hiểu; 2 test styleguide e2e bị skip không giải thích (T5).
- [ ] `ArchiveGallery` có mẹo `{' '}`; `Eyebrow` nằm trong `dt` → dùng `as="dt"`; test e2e "đổi chủ đề đóng hộp" chưa mở lightbox trước; unit `ArchiveView` chưa kiểm `initialCode` được chuyển xuống (T9).
- [ ] Form: viền thẻ `ChoiceGroup` đổi 1→2px khi chọn làm nội dung xê ~1px; test form thiếu ConsentCheck đã tick, input email, `ErrorSummary` với `{n}` khác nhau (T6).
- [ ] `ConnectView`: `!text-text-meta`, `!border-border-strong` và `text-[13px]`/`text-[15px]`/`py-[104px]` viết cứng; `rowBase` mobile có thể trùng mẫu danh sách chung; email/điện thoại render hai lần (desktop và mobile, CSS ẩn); dòng trống thừa; `connectErrors.ts` nằm ở components (nên ở lib) (T10).
- [ ] Trang hiện vật: desktop không có `context` thì cột 1–4 trống, khối liên hệ nằm cột 6 (T8). Test: đếm `1 hiện vật` chỉ dùng `toContain`, test CTA "chỉ desktop" chưa kiểm ẩn, lề mobile của divider thừa, kiểm "Ô liên hệ desktop" đếm yếu (T7, T10).

**Khác biệt giao diện so với artboard**
- [ ] Header/footer toàn site giữ nền sáng ở `/thu-vien` trong khi artboard vẽ nền tối (layout dùng chung) (T9).
- [ ] `PageHeader` dùng chung hơi cao hơn artboard ở `/san-pham`; VI/EN có khung viền; "Xem nguồn" 15px thay vì 14px; `/con-nguoi` và `/cau-chuyen` còn breadcrumb trên mobile (T7).
- [ ] `/ket-noi` mobile: đệm khung thành công 48 (artboard 28/20); ô liên hệ desktop cuối thiếu viền; breadcrumb 1440 cao 21px, kiểm vùng chạm ở desktop đang bỏ qua (T10).
- [ ] "ĐÃ XÁC MINH NGUỒN" ở thư viện đếm theo dữ liệu (R12), chưa có cờ xác minh riêng do người duyệt bật.

**Test / quy trình**
- [ ] E2E `ket-noi` dùng `waitForTimeout` cố định (T10).
- [ ] `test:int` chạy cả bộ unit (đã ghi ở Phase 1); `test:int` sau Phase 5b gồm 708 test.

### Phase 5a (Câu chuyện, Con người)
- [x] **Preview chân dung:** nhãn "Ảnh chưa được phép đăng" bị chú thích đè → `ContentImage` có prop `notesPosition`, chân dung dùng `bottom-right` (Phase 5b R20).
- [ ] Chữ hiển thị còn viết cứng trong component: `StoryCard.tsx` "`{n} PHÚT ĐỌC`", `PortraitCard.tsx` mặc định `cta = 'Xem chân dung →'` (trùng `peopleCopy.card.cta`), `PeopleTeaser.tsx` `'Đọc câu chuyện →'`. `StoryCardView.status` dựng chuỗi hiển thị trong `queries.ts` thay vì đọc từ `storiesCopy`.
- [ ] Ảnh thẻ "Liên quan" (công đoạn/hiện vật) chỉ kiểm quyền của asset, không kiểm đồng ý của người: nếu ảnh chân dung của người chưa đồng ý ảnh được dùng lại cho công đoạn/hiện vật thì sẽ hiện. So id asset với chân dung/phóng sự khi chưa có đồng ý ảnh.
- [ ] `getPersonPage` tải mọi công đoạn và sản phẩm để tìm một bản ghi liên quan.
- [ ] Featured meta "{s} nguồn báo chí" đếm mọi loại nguồn (nếu có nguồn truyền khẩu/lưu trữ thì nhãn sai).
- [ ] `ShareButtons`: không báo khi sao chép thất bại; thông báo không xoá nên bấm lại không được đọc lại; "Sao chép link" xuống hai dòng ở 390.
- [ ] `FilterableList`: bọc mục bằng `div.contents` (sai nếu nơi gọi dùng ul/li); giả định `filters[0]` là `all`; `useMemo` phụ thuộc hàm inline.
- [ ] `TableOfContents`: mục đang đọc không reset khi rời heading; mục đầu chưa sáng trước khi cuộn (artboard sáng sẵn). `ReadingProgress`: bài ngắn hơn màn hình hiện 100%. Thiếu test render không JS và test gỡ listener.
- [ ] `VerifyNote` có `title` đổi p→aside và bỏ qua `size`; `SourceList` biến thể `notes` có key rỗng thừa; `RichText` chỉ nhận định dạng đậm/nghiêng; `story.h3` trùng `story.h`.
- [ ] `ConsentPanel` render cả khối desktop và mobile (chữ lặp trong DOM); test `StatusDot` so tên class. Lời trích chân dung có mục 2 cũng render hai lần (mỗi breakpoint ẩn một bản, Phase 5a F1).
- [ ] `Tag` overlay gap 8px (artboard 6px); `StatusDot` cỡ 8 ngầm định viền 1.5px.
- [x] Heading lời mời 44px (`PeopleView`) đã thành `ui/CtaBand` (Phase 5b R10).
- [ ] Heading viết riêng còn lại chưa thành biến thể `SectionHeading`: h2 câu chuyện 30/40px (`PersonView`), `ReadNext` 40px.
- [ ] Test: `stories-view.test.tsx` có đoạn bị prettier dàn lại; fixture tự tái tạo định dạng featured của lib; ảnh hero bài nổi bật không còn preload ở desktop; chưa có test cấp trang cho trường hợp "đồng ý ảnh nhưng chưa đồng ý tên" (lib int đã có); kiểm "Chủ đề đề xuất" ở home dùng `.first()`.
- [ ] Ngày đăng trống ở preview hiện `[cần xác minh]` (artboard "[chờ thẩm định]").

### Phase 4 (Nghề dệt chiếu, Làng Hới)
- [x] `productTag` đã chuyển vào view model `ProductCardView.tag` (Phase 5b R1).
- [ ] `src/components/content/labels.ts` (`previewNotes`; `storyStatus` đã chuyển ở Phase 5a) vẫn là luật nghiệp vụ trong component → chuyển vào `lib/content`.
- [ ] Rule lint kiến trúc chưa chặn import tương đối (`../../lib/content/visibility`) và `payload/*`; test "Ok" của `architecture.test.ts` nên thêm ca đường dẫn tương đối.
- [ ] Không có `aria-live` khi đổi công đoạn/mốc (Tiếp, Mốc sau); cân nhắc vùng `polite` ở khối chi tiết.
- [ ] Vòng quanh điểm mốc đang chọn dùng `track-on-dark` (.2) thay vì `rgba(227,205,156,.25)` của artboard.
- [ ] `confidence: null` ở preview hiện như "Chờ xác minh" nhưng không có cờ `unverified` báo biên tập viên.
- [ ] `/styleguide` có h1 thứ hai (mẫu `PageHeader`) → đổi mẫu sang cấp tiêu đề khác.
- [ ] Nhãn tư liệu mobile ở hero trang chủ giãn chữ .2em (artboard .18em); khung "ẢNH CẦN CHỤP" của CraftTeaser mobile nay là khung lùi vào thay vì tràn viền.
- [ ] Màu `rgba` chỉ dùng một lần còn lại (ArchiveTeaser .88, FilterChips/PatternTeaser .35, PatternTeaser .82, SiteFooter .18); `StepProgress` gap desktop 2 thay vì 2.5; nền sân khấu `bg-bg-deep` thay vì `#2A3D31` (chưa có token).
- [ ] `PAGE_MEDIA_SLOT_LABELS` nên có kiểu theo slot; `seed.int` chỉ kiểm ảnh slot của `nghe-det-chieu`.
- [ ] `applyMode` `nullTexts` xoá mọi chuỗi trong object có `cite` (sẽ mất `href` nếu sau này đặt cạnh `cite`) → thêm test chặn trước.
- [ ] E2E: `global-setup` viết cứng cổng 3000; regex ảnh public chỉ nhận 2 dạng đường dẫn; test bàn phím craft dùng `focus()` thay vì Tab (Phase 7 T5 có test Tab thật tới nút Tiếp nhưng vẫn `.focus()` bước hiện tại trước khi Tab → chưa đóng hẳn); `craft-journey.test` gán thẳng `window.matchMedia`; test cỡ mặc định `ThreadsDivider` so chuỗi con.
- [ ] Cảnh báo dev next/image "width or height modified" với `nkc8-840x560.webp`.
- [ ] `ScrollStrip focusable` thành thêm một điểm Tab ở desktop (nơi dải không cuộn).
- [ ] H2 "Di sản hôm nay" mobile 32px (token) thay vì 30px của artboard; bảng thông tin và chú giải timeline render hai lần theo breakpoint.
- [ ] Commit `2dfff2f` ghi trailer Sonnet 5.5.

### Phase 3 (trang chủ)
- [ ] `page.tsx` gọi `getMode`/`getPageIntro` hai lần (metadata + page); `getProduct` gọi lặp theo từng sản phẩm (N+1) trong trường hợp xấu.
- [ ] `Button.iconSize` không còn nơi dùng (dead prop).
- [ ] `CraftTeaser`: `scrollIntoView` cũng chạy trên pill bị ẩn ở desktop (vô hại); `index` không kẹp lại nếu số công đoạn giảm; thumbnail không có lớp ghi chú preview.
- [ ] `StoriesTeaser`: căn bằng `md:-mt-7` (nên dùng `first:pt-0`); thẻ compact mobile lệch nhẹ border/padding/gap so với artboard; PortraitCard hiện eyebrow/vai trò không có trong Home.
- [ ] `ArchiveTeaser`: lọc không khớp ảnh nào chỉ còn ô "Ô chờ tư liệu lịch sử" (chưa có test riêng cho 0 kết quả); khoảng cách 2 ô mobile; padding nhãn lệch 1px.
- [ ] `Reveal`: chưa test ngắt observer khi unmount; có wrapper rỗng.
- [ ] E2E: câu h1 viết cứng thay vì đọc từ seed; e2e public giả định mọi bài seed chưa có trang chi tiết; selector `img` rộng; `reuseExistingServer` ở :3100 có thể dùng lại bản build cũ khi chạy local.
- [ ] Badge preview bị xuống dòng trong thumbnail nhỏ (chỉ bản preview).
- [ ] Test T1 (chú thích liền kề 1440) trùng một phần với test 390.
- [ ] Thiếu test int: đồng ý trộn lẫn / ảnh Làng Hới thiếu một phần; seed `byFile` ném lỗi khi thiếu asset (chỉ dev).

### Phase 2 (component)
- [ ] Thiếu test: Button `tone=dark`/`as=h3`, ShotNeeded dark, Tag dashed/filled, VerifyNote md, PortraitCard `sm`/không ảnh/ảnh bị gắn cờ, ProductCard có ảnh, StoryCard compact có/không ảnh bìa, ExhibitCard `aria-current`, Tabs aria-controls/dark, Feedback lines>3/0.
- [ ] Button thiếu `justify-center`; style disabled chỉ có ở primary; hover outline-dark tự đặt.
- [ ] `rgba(40,39,36,.2)` viết cứng 2 chỗ; `aria-controls` của tab không active trỏ tới panel không tồn tại; LinkArrow giãn full width trong flex-col.
- [ ] `toLocaleUpperCase` / `toUpperCase` dùng lẫn.

### Phase 1 (nền móng)
- [ ] `test:int` chạy `vitest run` cả config → chạy luôn test unit.
- [ ] Focus nền tối chỉ áp cho con của `.bg-bg-inverse/.bg-bg-deep/.bg-bg-ink`; rule focus toàn cục chưa nằm trong `@layer base`.
- [ ] Chưa có token line-height và eyebrow (600 / +0.24em).
- [x] Bootstrap user đầu tiên: đếm-rồi-tạo có race → chỉ còn ở dev (Phase 7, R16; xem mục A).
- [x] Người duyệt cuối cùng không xoá/hạ vai trò được (Phase 6, R9). Còn mối lo xoá hàng loạt: xem mục Task 2 ở Phase 6.
- [x] `Sources.date` validate `YYYY-MM-DD` và ngày có thật (Phase 6, R10).
- [ ] Collection nào ghi đè `hooks` sau khi spread `contentCollectionDefaults` sẽ mất `recordDraftArg` (fail closed).
- [ ] Test kích thước ảnh nhận 403|404; thư mục tmp rò khi SIGKILL.
- [ ] `Stories.category` có lựa chọn thứ 5 "Con người" (theo artboard); `Products.code` để `localized` không cần thiết; vài test dùng `rejects.toThrow` trơn.
- [ ] `toImageView` thiếu url → `''` và kích thước 0; `sourceMap()` tải hết nguồn mỗi bài/người.
- [ ] Độ phủ cờ preview chưa đều (craft subtitle/tools, nguồn timeline); thiếu test DB cho chặn `getPerson` (R14), lọc ảnh sản phẩm, maker chưa đăng.
- [ ] Seed: slug kỹ thuật `mau-nguoi-2..8`; idempotency upload theo tên file lưu (media cũ + DB trống → trùng); biên tập viên có thể gõ tên người vào `code` → thành tên file; dữ liệu dev cũ giữ tên file gốc (seed lại staging từ đầu).
- [x] Nền chưa `inert` khi menu mở → giải bằng cách khác: menu mobile dùng vòng focus, `keyboard.e2e.spec.ts` khẳng định Tab/Shift+Tab 16 lần không ra khỏi `#menu-mobile` (Phase 7, ruling P4). Nền vẫn không `inert` với trình đọc màn hình.
- [ ] Menu mobile vẫn mở (aria-expanded cũ) khi resize qua 1024; `text-[14px]` viết cứng; footer liên hệ hiện `[cần xác minh]` ở preview.

## E. Dữ kiện trang vào CMS (nhánh du-lieu-trang-cms, 2026-10-30)

Phải làm trước khi lên prod:
- [ ] Commit mục "Nhập dữ kiện trang (lần đầu lên prod)" và dòng "Không chạy `npm run seed`…" trong `docs/DEPLOY.md` (đang ở working tree cùng thay đổi riêng của người dùng).
- [ ] Prod sau khi nhập chỉ có dữ kiện: tiêu đề/đoạn dẫn đầu trang, ảnh và dòng thời gian phải nhập trong `/admin` (lệnh nhập không làm).

Còn mở (nhỏ):
- [ ] Preview: dòng so sánh mobile tự ghép có ô trống vẫn hiện nguyên văn `Thủ công: h · Máy: ` và không mờ; nên ghép từ ô đã qua `showText`.
- [ ] `hasPendingDraft` (`src/seed/pageFacts.ts`) sắp theo `-updatedAt` thay vì `where: { latest: { equals: true } }` như Payload.
- [ ] Int test "keeps pending draft" (`tests/int/seed.int.spec.ts`) phụ thuộc thứ tự test trước; `seed()` in report làm ồn output int test.
- [ ] `getVillagePage` đọc `page-intros` 3 lần mỗi request.
- [ ] Int "hides empty" chưa kiểm heritage, `noPortrait`, ghi chú preview là null ở public; re-seed trong `finally` có thể che lỗi gốc.
- [ ] Unit test schema chưa khoá `hasMany`/`localized`/`required` của `citedSentenceFields`/`pageSourcesField`; int rejection test dùng `.rejects.toThrow()` trần.
- [ ] `import-page-facts.ts`: `payload.destroy()` không nằm trong `finally`; nhánh `'published'` của `formatReport` không bao giờ chạy.
- [ ] Hướng dẫn admin: bước "Báo người duyệt biết" chưa chỉ cách báo cho global; `labels.json` gắn với tiêu đề nguồn seed.
- [ ] Fixtures `/styleguide` lặp chữ seed; ô mobile của `ComparisonTabs` lặp markup `Cite` inline; tên test "có numbers thì hiện [1] ở ô máy và đoạn mô tả" đã lỗi thời.
- [ ] `isEmptyGroup` coi nhóm admin cố ý xoá trống là trống → chạy lại lệnh nhập sẽ điền lại (đã ghi lưu ý trong DEPLOY.md).

## F. Lệnh nhập nội dung khởi đầu `import:content` (nhánh du-lieu-trang-cms, 2026-10-31)

Phải làm trước khi lên prod:
- [ ] Commit mục nhập nội dung trong `docs/DEPLOY.md` (đang ở working tree cùng thay đổi riêng của người dùng). Thay cho việc đầu tiên của mục E.
- [ ] Ảnh và con người nhập trong `/admin` khi người làng gửi ảnh và đồng ý (lệnh nhập không làm). Thay cho việc thứ hai của mục E, trừ phần ảnh.

Còn mở (nhỏ):
- [ ] `importContent` tạo nguồn trước khi dựng dữ liệu; lỗi muộn (vd. thiếu `storyExtras`) để lại nguồn đã tạo. Chạy lại vẫn an toàn.
- [ ] `stripFigureParagraphs` lọc theo dòng; token `[[figure:…]]` nhiều dòng sẽ lọt.
- [ ] `sourceRefs()` lặp đường dẫn trường của builder và regex `cite`; nhánh lỗi nguồn lạ qua `importContent` chưa có test.
- [ ] `storyDocs`: chưa có unit test; cho phép `asset` khác null mà thiếu `assets`; `workflow` `'seed'|'draft'` khác các builder khác; tự `readFileSync` cạnh `readSeedJson`.
- [ ] Test "có asset thì gắn image" có thể qua rỗng; `productDocs` có ảnh chưa test.
- [ ] Test "global có nháp chờ duyệt" chưa kiểm bản đăng vẫn trống.
- [ ] `toId` và `{ ...existing, ...fill }` lặp ở `importPageFacts` và `importContent`.
- [ ] Global có nháp chờ duyệt mà không có gì để điền thì không có cảnh báo.
- [ ] Báo cáo lệnh: dòng Phần mở đầu trang liệt kê ~35 trường; chưa test dòng "Đã có sẵn nguồn"; nhãn "Công đoạn" rút gọn từ "Công đoạn làm nghề".
- [ ] Test global chưa từng lưu dùng `TRUNCATE … CASCADE` thô qua `payload.db.drizzle`.

Soát chữ trước prod (2026-11-01), người dùng duyệt sửa lệch artboard: "Thanh Hoá", ngoặc kép cong “Trạng Chiếu”, bỏ câu tả ảnh tham khảo (prod không có ảnh), chân trang bỏ "cần đối chiếu", nhãn mốc "Chưa rõ năm" thay "[?]", nguồn "Dân Việt, dẫn Báo Hải Dương", "ni-lông". Link nguồn ra trang ngoài mở tab mới (`src/components/ui/newTab.tsx`).
- [ ] Ghi chú nguồn cuối bài thiếu tác giả ("Vương Tâm" của bài Đại Đoàn Kết, có trong artboard StoryDetail): collection `sources` chưa có trường tác giả; cần thêm trường, migration, `SourceView.author`, `ensureSources` chép `author`.
- [ ] Khi có ảnh thật từ người làng: thêm lại câu tả ảnh cho công đoạn 5, 6 và phần Dệt thủ công/Dệt bằng máy trong `/admin`.

## G. Chuyển Phần mở đầu trang sang collection Trang (nhánh trang-collection, 2026-11-04)

Việc cho máy dev khác:
- [ ] Sau khi pull đợt 2a, chạy `npm run dev` một lần và trả lời "có" ở câu hỏi DATA LOSS (xoá bảng `page_intros*`, `lh_*`, `ndc_*`). Dev push treo khi không có TTY ở câu hỏi này.

Dữ liệu và e2e:
- [ ] Dữ kiện năm sinh/mất trùng giữa dòng thời gian và tổ nghề: hai nơi nhập cùng một dữ kiện, dễ lệch nhau.
- [ ] Câu riêng cho điện thoại lẫn trong dữ liệu trang (chữ dành cho mobile nằm chung trường với chữ desktop).
- [ ] E2e `workflow` và `a11y-public` chạy song song trên cùng server :3100 nên có thể đụng nhau (thấy lại ở lần chạy 2026-11-04: story `e2e-quy-trinh-*` còn sót trong DB dev, làm `public`, `a11y-public` và `chromium` fail vì đếm 6 bài thay vì 5).
- [ ] `tests/e2e/links.e2e.spec.ts` có lúc quá thời gian (flake).
- [ ] `tests/int/pages.int.spec.ts` có lúc quá 5 giây khi chạy cả bộ (flake).

Review còn mở (mức nhỏ):
- [ ] `src/hooks` (kiểm nguồn trước khi xoá): các truy vấn tra cứu không truyền `req` nên nằm ngoài transaction xoá; nhãn global/collection có thể rơi về slug hoặc "X: X" trong câu báo tiếng Việt; thiếu test cho cờ bỏ qua trực tiếp, trích dẫn global chỉ có bản nháp, câu báo nhiều nơi.
- [ ] `src/collections/fields/pageFacts.ts`: mảng trả về chưa thụt lề lại sau khi đổi sang thân khối; ép kiểu `as Field` ở trường ảnh có điều kiện và ở `validate` (thiếu chú thích); test chưa kiểm `pg_lh_heritage_sents`, `pg_ndc_compare`.
- [ ] Hook `stripForeignFields` của Pages: `clearGroup` đệ quy sẽ làm hỏng upload/relationship/richText nếu sau này có trong nhóm (cần chú thích hoặc duyệt theo cấu hình trường); giá trị lạ đã có trong DB không được dọn khi cập nhật một phần; test xoá/sửa của biên tập viên chỉ kiểm `toThrow()`, chưa kiểm đúng lỗi Forbidden.
- [ ] Hook kiểm nguồn của Pages: dòng thủ công và máy dùng chung nhãn `where` nên câu báo có thể lặp dòng.
- [ ] `src/seed/migratePages.ts`: `draft.dropped` chỉ ghi khi có ghi bản nháp; `--check` không phát hiện mất dữ liệu của tool-n.
- [ ] `src/lib/content`: `getCraftPage`/`getVillagePage` đọc trang hai lần; ép kiểu ảnh `tools` trong `craftMerge`; tìm trang theo slug lặp ở 3 nơi, `pageLabel` đoán theo tiền tố, closure `toId` lặp.
- [ ] `src/seed`: hằng `pageIntros` đặt tên gây hiểu nhầm (giờ ghi vào collection Trang).
- [ ] Test `admin-config` dùng cấu hình thật, phụ thuộc thứ tự chạy.
- [ ] Ảnh hướng dẫn admin (`public/admin-guide/`) có ngày giờ trong ảnh nên mỗi lần chụp lại đều đổi PNG.

## D. Quyết định cần biết (không phải lỗi)

- Phase 7 (đủ danh sách R1–R16 trong `docs/superpowers/plans/2026-10-28-phase-7-staging-kiem-tra.md`), thêm các quyết định khi chạy:
  - P1: ảnh tải lên qua `clientUploads` (R8) được kiểm bằng giao diện admin (Playwright), vì tải qua REST không đi đường đó.
  - P2: test CLS nằm trong `cls.e2e.spec.ts` riêng (project `a11y-public` khớp `/(a11y|cls)\.e2e/`; `chromium` bỏ qua).
  - P3: script `audit:lighthouse` chạy bằng `node --import tsx/esm` để import `routes.ts`.
  - P4: test menu mobile chỉ đòi Tab không ra khỏi menu (vòng focus hoặc nền `inert` đều đạt); hiện dùng vòng focus.
  - MinIO ghim image `quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z` có sẵn ở máy, bucket tạo bằng `mkdir` (kéo từ quay.io treo ở máy này); dùng cho diễn tập, không ảnh hưởng dev thường.
  - Plugin S3 luôn đăng ký (tắt khi thiếu `S3_BUCKET`) cùng migration `phase7_sync`, để schema giống nhau ở mọi môi trường.
  - Staging: đọc file ảnh trả `{ id: { exists: true } }` thay vì `true` để `storage-s3` nhận được doc; dev/production không đổi.
  - Lighthouse: chỉ bỏ qua 404 với route đánh dấu `draftOnPublic` và cờ `--public`; mọi 404 khác là lỗi.
  - Điểm lệch so với thiết kế ghi thẳng vào `docs/superpowers/reports/2026-10-28-phase-7-kiem-tra.md`; ảnh chụp không commit.

- Phase 6 (đủ danh sách R1–R12 trong `docs/superpowers/plans/2026-10-28-phase-6-hoan-thien-admin.md`), thêm các quyết định khi chạy:
  - P1: `safeInternalPath` kiểm cả giá trị thô và giá trị giải mã một lần; trả về giá trị thô khi hợp lệ để giữ mã hoá query (ví dụ `?anh=`).
  - P2: `lib/content/preview.ts` xuất factory `createPreview(payload)` → `{ canPreview(headers) }` gắn trong `index.ts` như các module `create*`; `getPreviewBar()` là export thường.
  - Plan ghi "7 collection nội dung" nhưng thực tế có 6 (stories, people, craft-steps, timeline-events, products, makers); bộ hook đúng là 8 collection (6 + archive-assets + sources).
  - Project Playwright `chromium` phụ thuộc `workflow` (ngoài brief): bài tạm của e2e quy trình dùng chung DB làm hỏng đếm của `stories.e2e` khi chạy đồng thời. Hệ quả: `--project=chromium` cũng chạy `public` + `workflow` (cần build :3100) trừ khi dùng `--no-deps`.

- Phase 5b (đủ danh sách R1–R21 trong `docs/superpowers/plans/2026-10-28-phase-5b-san-pham-thu-vien-ket-noi.md`), thêm các quyết định khi chạy:
  - R-P1 (tinh chỉnh ở T10): `getConnectPage` trả liên hệ đã dựng sẵn (`{text, href|null}`, `visit` kèm câu mặc định, `mobileLine` gồm các phần có `href` để giữ `mailto:`/`tel:`); email/điện thoại trống là null ở cả hai mode, preview hiện placeholder từ copy.
  - Size/care trống của hiện vật trả null ở cả hai mode; component hiện chỉ dẫn biên tập chỉ ở preview (T1/T8).
  - `PatternExplorer` có slot `aside` cho khối tiêu đề, hiện `ShotNeeded` khi không có ảnh; thứ tự đọc "h1 sau sân khấu" đã được sửa ở T8: aside đứng đầu DOM, mobile đặt cuối bằng `max-md:order-last` (đã xong, không còn mở).
  - Radio ChoiceGroup: kiểm phím mũi tên bằng e2e (jsdom không mô phỏng được) (T6/T10).
  - Nhãn ô ảnh thư viện mở rộng "Mở ảnh: {tiêu đề}, TL · 001 · Làng quê" để đạt WCAG 2.5.3 (T5).
  - Khối liên hệ của hiện vật luôn có ở desktop kể cả khi không còn dòng nào, vì câu "Chưa có cơ sở được xác minh…" (R5) thắng yêu cầu bỏ section rỗng (T8).
  - Payload RSC lặp lại query `?anh=TL-004` do người gọi tự gõ: không coi là rò rỉ, e2e public bỏ tham số đó trước khi kiểm (T9).
  - Header/footer giữ nền sáng ở `/thu-vien` dù artboard tối, vì layout dùng chung (T9).
  - `getArchivePage`/`getProductPage` được `cache()` bọc nên gọi hai lần (metadata và trang) không tốn thêm truy vấn.
- Phase 5a (đủ danh sách R1–R21 trong `docs/superpowers/plans/2026-10-27-phase-5a-cau-chuyen-con-nguoi.md`), thêm các quyết định khi chạy:
  - Thẻ "Chủ đề đề xuất" hiện ở public (R2); trên `/cau-chuyen` không bấm được (R21).
  - Thứ tự bài theo ngày tạo, cũ trước (T5a); "Xem thêm" giữ ở mobile (T5b).
  - Vai trò của người chỉ hiện khi đồng ý tên (T2a). Phóng sự ảnh bỏ alt/chú thích khi chưa đồng ý tên; lời trích cần nguồn hiển thị được (T2b). Câu chuyện chân dung có danh sách nguồn riêng (T2c), biên tập viên chèn được trích dẫn nguồn (không có khối ảnh — F2).
  - Thẻ công đoạn liên quan chỉ hiện khi công đoạn đã đăng; với seed, public chỉ còn "Những chân dung khác" (P2).
  - Lời trích chân dung: sau mục 2 ở desktop, sau mục 1 ở mobile, đúng artboard (F1).
  - Chữ hoa của nhãn chủ đề làm bằng CSS (text-transform), chữ gốc giữ hoa thường.

- Phase 4:
  - **Nội dung trang:**
    - Tiêu đề trang nhiều dòng (R1).
    - Ảnh trang theo slot (R2).
    - "CẦN GHI LẠI" và các ghi chú quy trình chỉ hiện ở preview (R3, R4, cùng câu "Cần đối chiếu với sử liệu khoa bảng…").
    - Lead mobile dùng lead CMS như desktop.
    - Chú thích sân khấu lấy từ CMS, không theo chữ minh hoạ trên artboard.
  - **Nguồn và mức tin cậy:**
    - Ở public, câu hoặc dữ kiện mất hết nguồn thì bị ẩn.
    - Mốc có nguồn mà mọi nguồn bị ẩn thì hiện là "Chờ xác minh" (F1).
    - Chú thích ở `/lang-hoi` dạng `[n]` (F3).
    - Nguồn trang Làng Hới đánh số [1] Vietnam+, [2] Dân Việt, [3] Đại Đoàn Kết (R9).
    - Mốc "+" tĩnh, link tới `/ket-noi` (R6).
  - **Tương tác:**
    - Bảng So sánh bỏ hàng trống ở public, bỏ tab khi không còn hàng (R7).
    - Phóng cận cảnh vẫn dùng được khi giảm chuyển động, chỉ bỏ hiệu ứng (F2).
    - Không JS: chỉ trạng thái đầu (R10).
- Phase 3: dữ liệu CMS thắng chữ minh hoạ artboard; mục rỗng thì ẩn ở public; regex placeholder mở rộng ẩn cả "[Cần Thơ]"; mobile mục Sản phẩm không có danh sách điểm dạng chữ (R2); sản phẩm nổi bật = sản phẩm đầu tiên có ảnh và điểm hoa văn (R3); nhãn chuyên mục lấy từ option collection, giá trị lạ → ẩn (R4).
- Ghi chép đầy đủ quyết định Phase 1–2 nằm trong `.superpowers/sdd/2026-10-26-phase-1-nen-mong/progress.md` và `.superpowers/sdd/2026-10-27-phase-2-component/progress.md` (không xoá cho tới khi chép hết vào đây).
