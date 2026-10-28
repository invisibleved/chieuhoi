# Việc tồn đọng (backlog)

Gom các mục review để lại sau Phase 1–6. Cập nhật lần cuối khi kết thúc Phase 6 (nhánh phase-6-hoan-thien-admin).
Quy ước: mỗi phase kết thúc phải chép các mục còn mở vào đây **trước** khi xoá thư mục `.superpowers/sdd/<plan>/`.

## A. Phải xong trước khi deploy staging/production (Phase 6–7)

- [ ] (Phase 6 đã giải: bản preview qua Draft Mode + `/preview`, nội dung mới cập nhật qua revalidate. Còn lại cho Phase 7: chặn build production bằng `.env` dev / `PREVIEW_ALL=true`.) `/` đang prerender tĩnh: `getMode()` chốt lúc build → build bằng `.env` dev sẽ đóng băng bản preview (placeholder, ảnh chưa duyệt) vào HTML. Cần render động hoặc revalidate + draft mode, và chặn build production khi `PREVIEW_ALL=true`. Cùng vấn đề cho mọi trang dùng `getMode` (Phase 1 T11: settings/mode chốt lúc build).
- [x] Link 404 cho tới khi có trang: `/san-pham`, `/san-pham/*`, `/thu-vien`, `/ket-noi` và chú thích nguồn hoa văn → trang hiện vật đã có (Phase 5b); `tests/e2e/links.e2e.spec.ts` duyệt link từ header, footer và 5 trang chính.
- [x] `Sources.url` chỉ nhận `http(s)://` ở admin và lib bỏ url khác giao thức khỏi view model (Phase 6, R10).
- [ ] `.npmrc` `legacy-peer-deps=true` che xung đột peer; 9 cảnh báo `npm audit` (Phase 1).
- [ ] `metadataBase` chưa đặt → URL ảnh OG của bài viết/chân dung là đường dẫn tương đối (Next cảnh báo). Đặt theo tên miền khi deploy (Phase 5a T6).
- [ ] `/cau-chuyen/[slug]`, `/con-nguoi/[slug]`: `generateStaticParams` chỉ gồm bản ghi public, nhưng mode vẫn chốt lúc build như mục đầu tiên (Phase 5a R20).
- [x] E2E public: regex `page.content()` không bắt được URL `next/image` đã mã hoá (`%2Fimages%2Freference`) → `public-pages.e2e.spec.ts` dùng `REFERENCE_IMAGE` nhận cả dạng mã hoá, chạy trên 7 route (gồm 4 route Phase 5b) (Phase 5b T11).
- [ ] E2E public: seed chưa có asset `permitted` nên vòng kiểm ảnh qua vì không có ảnh nào để kiểm. Cần seed một asset `permitted` (cô lập trong e2e) để kiểm có đối tượng.
- [ ] `/thu-vien` đọc `searchParams` nên là route động (R11 Phase 5b): render theo từng request, ngược với mục đầu tiên (mode chốt lúc build). Cân nhắc cache theo mode khi deploy.
- [ ] `/san-pham`, `/san-pham/[slug]`, `/ket-noi` prerender tĩnh như trang chủ: mode chốt lúc build, build bằng `.env` dev sẽ đóng băng bản preview (mục đầu tiên). `/ket-noi` còn đọc `SiteSettings` lúc build; phần "sửa trong admin không thấy ngay" đã xong nhờ revalidate (Phase 6, R2).
- [ ] Ảnh `next/image` đã tối ưu còn trong cache sau khi thu hồi quyền ảnh (R12 Phase 6) → cấu hình `minimumCacheTTL`/xoá cache khi deploy.
- [ ] Race bootstrap user đầu tiên (`ALLOW_FIRST_USER`, chỉ dev; R12 Phase 6).

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

### Phase 6 (Admin)
Mã `Task N` là task trong plan Phase 6.
- [x] Đã điều tra (Phase 6 final): sau khi người duyệt đăng trong admin, tải lại trang thấy trạng thái "Đã thay đổi". Hook của ta (`syncWorkflow`/`guardPublish`/revalidate) không tạo thêm version. Trong e2e đó là bản nháp mới hơn thật, hoặc tải lại trước khi PATCH đăng xong. Trong admin, nút đăng theo locale ("Xuất bản trong Tiếng Việt") của Payload lưu thêm một version nháp chụp lại với thời điểm muộn hơn, nên trạng thái đọc là "Đã thay đổi". Không ảnh hưởng trang công khai (bản đã đăng vẫn đúng).
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
- [ ] E2E: `global-setup` viết cứng cổng 3000; regex ảnh public chỉ nhận 2 dạng đường dẫn; test bàn phím craft dùng `focus()` thay vì Tab; `craft-journey.test` gán thẳng `window.matchMedia`; test cỡ mặc định `ThreadsDivider` so chuỗi con.
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
- [ ] Bootstrap user đầu tiên: đếm-rồi-tạo có race (chỉ dev; R12 Phase 6, thuộc Phase 7).
- [x] Người duyệt cuối cùng không xoá/hạ vai trò được (Phase 6, R9). Còn mối lo xoá hàng loạt: xem mục Task 2 ở Phase 6.
- [x] `Sources.date` validate `YYYY-MM-DD` và ngày có thật (Phase 6, R10).
- [ ] Collection nào ghi đè `hooks` sau khi spread `contentCollectionDefaults` sẽ mất `recordDraftArg` (fail closed).
- [ ] Test kích thước ảnh nhận 403|404; thư mục tmp rò khi SIGKILL.
- [ ] `Stories.category` có lựa chọn thứ 5 "Con người" (theo artboard); `Products.code` để `localized` không cần thiết; vài test dùng `rejects.toThrow` trơn.
- [ ] `toImageView` thiếu url → `''` và kích thước 0; `sourceMap()` tải hết nguồn mỗi bài/người.
- [ ] Độ phủ cờ preview chưa đều (craft subtitle/tools, nguồn timeline); thiếu test DB cho chặn `getPerson` (R14), lọc ảnh sản phẩm, maker chưa đăng.
- [ ] Seed: slug kỹ thuật `mau-nguoi-2..8`; idempotency upload theo tên file lưu (media cũ + DB trống → trùng); biên tập viên có thể gõ tên người vào `code` → thành tên file; dữ liệu dev cũ giữ tên file gốc (seed lại staging từ đầu).
- [ ] Menu mobile vẫn mở (aria-expanded cũ) khi resize qua 1024; nền chưa `inert` khi menu mở; `text-[14px]` viết cứng; footer liên hệ hiện `[cần xác minh]` ở preview.

## D. Quyết định cần biết (không phải lỗi)

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
