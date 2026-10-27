# Việc tồn đọng (backlog)

Gom các mục review để lại sau Phase 1–5a. Cập nhật lần cuối khi kết thúc Phase 5a (nhánh phase-5a-cau-chuyen-con-nguoi).
Quy ước: mỗi phase kết thúc phải chép các mục còn mở vào đây **trước** khi xoá thư mục `.superpowers/sdd/<plan>/`.

## A. Phải xong trước khi deploy staging/production (Phase 6–7)

- [ ] `/` đang prerender tĩnh: `getMode()` chốt lúc build → build bằng `.env` dev sẽ đóng băng bản preview (placeholder, ảnh chưa duyệt) vào HTML. Cần render động hoặc revalidate + draft mode, và chặn build production khi `PREVIEW_ALL=true`. Cùng vấn đề cho mọi trang dùng `getMode` (Phase 1 T11: settings/mode chốt lúc build).
- [ ] Link 404 cho tới khi có trang (`/nghe-det-chieu`, `/lang-hoi` có từ Phase 4; `/cau-chuyen`, `/con-nguoi` có từ Phase 5a): `/san-pham`, `/thu-vien`, `/ket-noi`, và chú thích nguồn hoa văn → trang hiện vật.
- [ ] `Sources.url` không kiểm tra giao thức; `src/components/content/Sources.tsx:49` đặt thẳng `href={s.url}` → nên chỉ nhận `http(s):` (chỉ staff nhập, update cần reviewer — rủi ro thấp).
- [ ] `.npmrc` `legacy-peer-deps=true` che xung đột peer; 9 cảnh báo `npm audit` (Phase 1).
- [ ] `metadataBase` chưa đặt → URL ảnh OG của bài viết/chân dung là đường dẫn tương đối (Next cảnh báo). Đặt theo tên miền khi deploy (Phase 5a T6).
- [ ] `/cau-chuyen/[slug]`, `/con-nguoi/[slug]`: `generateStaticParams` chỉ gồm bản ghi public, nhưng mode vẫn chốt lúc build như mục đầu tiên (Phase 5a R20).
- [ ] E2E public: regex `page.content()` không bắt được URL `next/image` đã mã hoá (`%2Fimages%2Freference`), và vòng kiểm ảnh qua được khi trang không có ảnh nào. Cần seed một asset `permitted` để kiểm có đối tượng (Phase 5a T9).

## B. Phải làm trong Phase 4–5

- [x] Nhãn tiếng Việt cho `Products.group` và `ArchiveAssets.era` (`groupLabel`, `eraLabel` trong view model — Phase 4).
- [x] `ArchiveTeaser` tự chép `LABELS` → nhãn chip lấy từ `categories.ts` qua props (Phase 4).
- [ ] Trang hiện vật (Phase 5) đánh số nguồn theo đúng thứ tự trang chủ đang dùng cho chú thích hoa văn.
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

### Phase 5a (Câu chuyện, Con người)
- [ ] **Preview chân dung:** chú thích "CHÂN DUNG · …" (`PersonView.tsx` figcaption, absolute góc dưới trái) đè lên nhãn "Ảnh chưa được phép đăng" của `ContentImage.tsx:41` (cũng góc dưới trái) → người duyệt không thấy cảnh báo quyền ảnh trên ảnh chân dung (1440 và 390). Xếp chung một khối hoặc dời nhãn.
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
- [ ] Heading viết riêng chưa thành biến thể `SectionHeading`: lời mời 44px (`PeopleView`), h2 câu chuyện 30/40px (`PersonView`), `ReadNext` 40px — gom nếu Phase 5b lặp lại.
- [ ] Test: `stories-view.test.tsx` có đoạn bị prettier dàn lại; fixture tự tái tạo định dạng featured của lib; ảnh hero bài nổi bật không còn preload ở desktop; chưa có test cấp trang cho trường hợp "đồng ý ảnh nhưng chưa đồng ý tên" (lib int đã có); kiểm "Chủ đề đề xuất" ở home dùng `.first()`.
- [ ] Ngày đăng trống ở preview hiện `[cần xác minh]` (artboard "[chờ thẩm định]").

### Phase 4 (Nghề dệt chiếu, Làng Hới)
- [ ] `src/components/content/labels.ts` (`productTag`, `previewNotes`; `storyStatus` đã chuyển ở Phase 5a) vẫn là luật nghiệp vụ trong component → chuyển vào `lib/content`.
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
- [ ] Bootstrap user đầu tiên: đếm-rồi-tạo có race; reviewer cuối cùng tự xoá được mình (khoá admin).
- [ ] `Sources.date` chưa validate `YYYY-MM-DD`.
- [ ] Collection nào ghi đè `hooks` sau khi spread `contentCollectionDefaults` sẽ mất `recordDraftArg` (fail closed).
- [ ] Test kích thước ảnh nhận 403|404; thư mục tmp rò khi SIGKILL.
- [ ] `Stories.category` có lựa chọn thứ 5 "Con người" (theo artboard); `Products.code` để `localized` không cần thiết; vài test dùng `rejects.toThrow` trơn.
- [ ] `toImageView` thiếu url → `''` và kích thước 0; `sourceMap()` tải hết nguồn mỗi bài/người.
- [ ] Độ phủ cờ preview chưa đều (craft subtitle/tools, nguồn timeline); thiếu test DB cho chặn `getPerson` (R14), lọc ảnh sản phẩm, maker chưa đăng.
- [ ] Seed: slug kỹ thuật `mau-nguoi-2..8`; idempotency upload theo tên file lưu (media cũ + DB trống → trùng); biên tập viên có thể gõ tên người vào `code` → thành tên file; dữ liệu dev cũ giữ tên file gốc (seed lại staging từ đầu).
- [ ] Menu mobile vẫn mở (aria-expanded cũ) khi resize qua 1024; nền chưa `inert` khi menu mở; `text-[14px]` viết cứng; footer liên hệ hiện `[cần xác minh]` ở preview.

## D. Quyết định cần biết (không phải lỗi)

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
