# Việc tồn đọng (backlog)

Gom các mục review để lại sau Phase 1–3. Đã đối chiếu với `main` @ 4aa3e50 ngày 2026-10-27.
Quy ước: mỗi phase kết thúc phải chép các mục còn mở vào đây **trước** khi xoá thư mục `.superpowers/sdd/<plan>/`.

## A. Phải xong trước khi deploy staging/production (Phase 6–7)

- [ ] `/` đang prerender tĩnh: `getMode()` chốt lúc build → build bằng `.env` dev sẽ đóng băng bản preview (placeholder, ảnh chưa duyệt) vào HTML. Cần render động hoặc revalidate + draft mode, và chặn build production khi `PREVIEW_ALL=true`. Cùng vấn đề cho mọi trang dùng `getMode` (Phase 1 T11: settings/mode chốt lúc build).
- [ ] Link 404 từ trang chủ cho tới khi có trang: `/nghe-det-chieu`, `/con-nguoi`, `/cau-chuyen`, `/san-pham`, `/thu-vien`, `/ket-noi`, và chú thích nguồn hoa văn → trang hiện vật.
- [ ] `Sources.url` không kiểm tra giao thức; `src/components/content/Sources.tsx:49` đặt thẳng `href={s.url}` → nên chỉ nhận `http(s):` (chỉ staff nhập, update cần reviewer — rủi ro thấp).
- [ ] `.npmrc` `legacy-peer-deps=true` che xung đột peer; 9 cảnh báo `npm audit` (Phase 1).

## B. Phải làm trong Phase 4–5

- [ ] Nhãn tiếng Việt cho `Products.group` và `ArchiveAssets.era` (hiện chưa render; dùng cách của `src/lib/content/categories.ts`).
- [ ] `ArchiveTeaser` tự chép `LABELS` từ option của `ArchiveAssets` → chuyển sang `categories.ts` để khỏi lệch.
- [ ] Trang hiện vật (Phase 5) đánh số nguồn theo đúng thứ tự trang chủ đang dùng cho chú thích hoa văn.
- [ ] Renderer rich text bỏ `cite` trỏ tới nguồn đã xoá (Phase 1 final).
- [ ] Timeline: mục "+ Mốc của bạn" là phần tử tĩnh, không phải dữ liệu (Phase 1 R18).
- [ ] Rich text chưa có khối ảnh; nếu cần thì thêm khối ảnh đã kiểm soát quyền (Phase 1 R16).

## C. Lỗi nhỏ còn mở

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
- [ ] `toImageView` thiếu url → `''` và kích thước 0; `getSources()` không nhận mode (luôn public); `sourceMap()` tải hết nguồn mỗi bài/người.
- [ ] Độ phủ cờ preview chưa đều (craft subtitle/tools, nguồn timeline); thiếu test DB cho chặn `getPerson` (R14), lọc ảnh sản phẩm, maker chưa đăng.
- [ ] Seed: slug kỹ thuật `mau-nguoi-2..8`; idempotency upload theo tên file lưu (media cũ + DB trống → trùng); biên tập viên có thể gõ tên người vào `code` → thành tên file; dữ liệu dev cũ giữ tên file gốc (seed lại staging từ đầu).
- [ ] Menu mobile vẫn mở (aria-expanded cũ) khi resize qua 1024; nền chưa `inert` khi menu mở; `text-[14px]` viết cứng; footer liên hệ hiện `[cần xác minh]` ở preview.

## D. Quyết định cần biết (không phải lỗi)

- Phase 3: dữ liệu CMS thắng chữ minh hoạ artboard; mục rỗng thì ẩn ở public; regex placeholder mở rộng ẩn cả "[Cần Thơ]"; mobile mục Sản phẩm không có danh sách điểm dạng chữ (R2); sản phẩm nổi bật = sản phẩm đầu tiên có ảnh và điểm hoa văn (R3); nhãn chuyên mục lấy từ option collection, giá trị lạ → ẩn (R4).
- Ghi chép đầy đủ quyết định Phase 1–2 nằm trong `.superpowers/sdd/2026-10-26-phase-1-nen-mong/progress.md` và `.superpowers/sdd/2026-10-27-phase-2-component/progress.md` (không xoá cho tới khi chép hết vào đây).
