# Chiếu Hới — Bàn giao thiết kế cho dev

Bản gốc (có thể đã cập nhật): https://claude.ai/artifact/QYd3S7KcUHZkg8TCX2gsUZ · Xuất ngày 26/10/2026

## Tổng quan

Thiết kế đã hoàn tất cho 8 trang theo brief, mỗi trang có bản desktop 1440 và mobile 390, kèm design system v0.1. Toàn bộ nằm trên canvas Claude Design (https://claude.ai/artifact/SgNwDLSutHp5F7tWP8TCrv). Trong gói này:

- `design/screens/*.jpg`: ảnh chụp toàn trang của từng artboard. **Đây là nguồn chuẩn về giao diện.**
- `design/source/*.dc.html`: mã nguồn artboard để tra giá trị chính xác (định dạng: xem `design/source/README.md`).
- `design/explorations/`: 3 hướng thiết kế ban đầu (A, B, C). Chỉ để tham khảo, không triển khai.

Hướng đã chốt là **Heritage Editorial**, tỉ lệ 70/20/10: chất tạp chí biên tập là nền, cộng trải nghiệm khám phá kiểu bảo tàng và nét nhận diện thủ công.

Nguyên tắc xuyên suốt: **không bịa nội dung.** Mọi thông tin chưa xác minh hiển thị dạng `[cần xác minh]`. Khi triển khai, các giá trị này lấy từ CMS cùng cờ trạng thái, không viết cứng.

## Bản đồ màn hình

| Route | Desktop | Mobile | Tương tác cần làm |
| --- | --- | --- | --- |
| `/` | Home | HomeMobile, MenuMobile | Menu mobile toàn màn hình; xem trước công đoạn dệt |
| `/lang-hoi` | VillagePage | VillageMobile | Dòng thời gian 8 mốc (desktop ngang, mobile dạng mở/đóng) |
| `/cau-chuyen` | StoriesIndex | StoriesMobile | Lọc chủ đề, tìm kiếm, trạng thái trống, xem thêm |
| `/cau-chuyen/[slug]` | StoryDetail | StoryMobile | Mục lục, tiến độ đọc, chú thích nguồn, chia sẻ |
| `/nghe-det-chieu` | CraftPage | CraftMobile | Hành trình 7 công đoạn, xem cận cảnh, tab thủ công/máy |
| `/con-nguoi` | PeopleIndex | PeopleMobile | Lọc nhóm, nhãn trạng thái đồng ý |
| `/con-nguoi/[slug]` | PersonDetail | PersonMobile | Ẩn/hiện nội dung theo trạng thái đồng ý |
| `/san-pham` | ProductsIndex | ProductsMobile | Lọc nhóm, ô "Ảnh cần chụp" |
| `/san-pham/[slug]` | ProductDetail | ProductMobile | Khám phá đường dệt, bộ ảnh |
| `/thu-vien` | ArchivePage | ArchiveMobile | Lọc nhóm và thời kỳ, lightbox có metadata |
| `/ket-noi` | ConnectPage | ConnectMobile | Form góp tư liệu: kiểm tra dữ liệu, báo lỗi, màn hình thành công |

Tablet 768px không có artboard riêng: dùng bố cục 8 cột trong phần token, các lưới 3–4 cột rút xuống 2 cột.

## Design tokens

File đầy đủ: `design/tokens/tokens.css`, `design/tokens/tailwind.preset.ts`. Bản trực quan: `design/screens/Foundations.jpg`. Mọi cặp chữ và nền đều đạt chuẩn WCAG AA (tỉ lệ đo thật ghi trong `tokens.css`).

| Nhóm | Giá trị |
| --- | --- |
| Màu chính | Cói `#F3EBDD` (nền) · Cói đậm `#E9DECA` · Rơm `#C3A46C` (chỉ trang trí, không dùng cho chữ) · Đỏ điều `#A04435` (nhấn) · Xanh làng `#344B3D` · Mực `#282724` |
| Font | Noto Serif Display (tiêu đề, ≥20px) · Noto Serif (đoạn mở đầu, chú thích nghiêng) · Be Vietnam Pro (nội dung, giao diện). Cả ba có bộ ký tự tiếng Việt |
| Thang chữ (desktop / mobile) | display 70/38 · h1-h2 60/36 · h3 44/28 · h4 32/24 · h5-h6 26/22 · quote 36/26 · lead 22/18 · body-lg 19/16 · body 17/16 · small 14 · caption 14/13 · eyebrow 12, đậm 600, giãn chữ +0.24em |
| Khoảng cách | Bậc 4px: 4, 8, 12, 16, 20, 24, 32, 48, 64, 80, 96, 128, 160. Giữa các section: desktop 96–128, mobile 48–64 |
| Lưới | Desktop 12 cột, lề 80, rãnh 24 · Tablet 8 cột, lề 40, rãnh 20 · Mobile 4 cột, lề 20, rãnh 12 |
| Breakpoint | 375 · 390 · 768 · 1024 · 1440 · 1920 (nội dung tối đa 1440, ảnh tràn viền vẫn kéo hết ngang) |
| Bo góc, bóng | Bo góc 0 cho mọi khung, 50% chỉ cho điểm đánh dấu hoa văn · Không dùng bóng đổ |
| Focus | Viền 2px, cách 3–4px; xanh làng trên nền sáng, vàng `#E3CD9C` trên nền tối |
| Chuyển động | 150ms (micro) · 250ms (ui) · 600ms (hiện dần) · `cubic-bezier(.2,.7,.2,1)` |

## Danh mục component

Mẫu đầy đủ trạng thái: `design/screens/Components.jpg`. Mọi component tương tác đều cần đủ trạng thái: mặc định, hover, focus, đang nhấn, vô hiệu, và lỗi nếu có.

| Component | Biến thể / trạng thái | Dùng ở |
| --- | --- | --- |
| `SiteHeader` | desktop (menu đánh số 01–06, trang hiện tại gạch chân sợi rơm) · mobile (logo + nút menu 48px) | Mọi trang |
| `MobileMenu` | mở toàn màn hình, chọn ngôn ngữ VI/EN (EN đang tắt) | Mobile |
| `SiteFooter` | đầy đủ (Trang chủ) · rút gọn (trang con) | Mọi trang |
| `Breadcrumb` | — | Trang con |
| `Button` | primary · secondary có icon · outline-dark · disabled | Mọi trang |
| `LinkArrow` | nền sáng · nền tối | Mọi trang |
| `SectionHeading` | eyebrow + h2 + ghi chú phải | Mọi trang |
| `DocumentLabel` | nhãn tư liệu trên ảnh · chip mã TL | Trang chủ, Nghề dệt, Thư viện |
| `PortraitCard` | có nhãn "Chờ đồng ý" / đã đồng ý | Con người, Trang chủ |
| `StoryCard` | nổi bật · gọn · trạng thái Bản nháp / Chủ đề đề xuất | Câu chuyện |
| `ObjectCard` | có ảnh · ô "Ảnh cần chụp" · nhãn xác nhận loại | Sản phẩm |
| `CraftStep` / `CraftJourney` | mặc định · hover · đang chọn · focus · chưa có ảnh | Nghề dệt, Trang chủ |
| `Timeline` | ngang (desktop) · mở/đóng (mobile) · 3 mức tin cậy | Làng Hới |
| `PatternExplorer` | điểm chọn: mặc định / đang mở / focus · phóng to | Chi tiết sản phẩm, Trang chủ |
| `FilterChips` | đang chọn · mặc định · hover · focus · nền sáng / nền tối · dạng vuốt ngang trên mobile | Danh sách, Thư viện |
| `Tabs` | gạch chân (desktop) · nút chia ô (mobile) | Nghề dệt |
| `Lightbox` | ảnh + metadata · trước/sau · đóng | Thư viện |
| `ConsentPanel` | chưa có / đã có đồng ý, đã duyệt bài | Chi tiết chân dung |
| `SourceNote` | chú thích số trên dòng + danh sách nguồn | Bài đọc, Làng Hới |
| `VerifyNote` | khung nét đứt "Cần xác minh" | Nhiều trang |
| Form | input, select, textarea, tải ảnh, ô đồng ý · lỗi theo từng ô + tổng hợp lỗi · thành công | Kết nối |
| Phản hồi | skeleton · trống · lỗi · thành công | Mọi danh sách |

## Đặc tả tương tác

Nguyên tắc chung: nội dung phải đọc được đầy đủ khi không có JavaScript. Chuyển động chỉ là lớp phủ thêm. Không khoá cuộn trang, không dùng parallax mạnh. Khi người dùng bật `prefers-reduced-motion`, bỏ toàn bộ hiệu ứng dịch chuyển và phóng to.

Logic trạng thái tham khảo nằm trong `renderVals()` của file `.dc.html` tương ứng.

1. **Hành trình dệt chiếu** (CraftPage, CraftMobile)
   - Danh sách 7 nút công đoạn dùng `aria-current="step"`, kèm thanh tiến trình `role=progressbar`. Nút Trước/Tiếp không vòng lại, dừng ở 01 và 07.
   - "Xem cận cảnh" phóng ảnh lên 1.9 lần quanh điểm `focus` khai báo cho từng công đoạn, 250ms. Đổi công đoạn thì tự thu nhỏ lại.
   - Công đoạn chưa có ảnh hiển thị khung "Ảnh cần chụp".
   - Mobile: hàng nút vuốt ngang, công đoạn đang chọn tự cuộn vào giữa bằng `scrollIntoView({inline:'center'})`.
2. **Dòng thời gian** (VillagePage, VillageMobile)
   - 3 mức tin cậy, phân biệt bằng **hình dạng** điểm mốc chứ không chỉ bằng màu: tròn đặc = có nguồn báo chí; thoi rỗng = truyền khẩu; tròn nét đứt = chờ xác minh.
   - Desktop: 8 nút trên một trục ngang, phần chi tiết mốc nằm bên dưới. Mobile: danh sách mở/đóng từng mốc, dùng `aria-expanded`.
   - Dữ liệu mốc lấy từ CMS (`content/seed/timeline.json`), không viết cứng.
3. **Khám phá đường dệt** (ProductDetail, ProductMobile)
   - Điểm chọn trên ảnh là `<button>` 44×44px, đặt theo toạ độ % trong CMS, dùng `aria-pressed`.
   - Chọn một điểm thì ảnh phóng lên 2.2 lần quanh toạ độ đó và ẩn các điểm khác; chú thích hiện trong vùng `aria-live="polite"`. Nút "Đóng chi tiết" (và phím Esc) đưa ảnh về như cũ.
   - Luôn có danh sách điểm dạng chữ bên cạnh ảnh (mobile: nút chia ô dưới ảnh) để người dùng bàn phím và trình đọc màn hình dùng được.
   - Chú thích chỉ lấy từ trường có nguồn. Không tự diễn giải ý nghĩa biểu tượng.
4. **Lightbox thư viện** (ArchivePage, ArchiveMobile)
   - Hộp thoại `role=dialog aria-modal`. Khi mở, đưa focus vào nút Đóng; giữ focus quay vòng trong hộp; khi đóng, trả focus về ô ảnh đã mở.
   - Phím ← → chuyển ảnh (vòng lại đầu/cuối), Esc đóng. Mobile: vuốt ngang để chuyển ảnh, metadata nằm dưới ảnh.
   - URL có dạng `?anh=TL-021` để chia sẻ được đường dẫn tới từng ảnh.
   - Trên prototype, phím Esc chưa kiểm chứng được; cần test lại khi làm thật.
5. **Cuộn kể chuyện và điều hướng**
   - Ảnh hiện dần khi cuộn tới (600ms, dùng IntersectionObserver), không ghim trang. Hover/focus 150ms.
   - Thanh tiến độ đọc trên bài đọc dài dùng `position: sticky`, không được làm khựng khi cuộn.

**Form Kết nối:**
- Chỉ kiểm tra dữ liệu khi bấm Gửi. Lỗi hiển thị theo từng ô (`aria-invalid`, `aria-describedby`), kèm một khung `role=alert` tổng hợp số mục còn thiếu.
- Bắt buộc: họ tên, cách liên lạc, ô đồng ý quyền chia sẻ.
- Khi chưa có hệ thống nhận thật, màn hình thành công phải giữ dòng "minh hoạ".

## Mô hình nội dung cho CMS

Các trường về xác minh, đồng ý và quyền dùng là **bắt buộc**, vì giao diện hiển thị nhãn dựa trên chúng. Bản ghi nào chưa đủ điều kiện đăng thì không được xuất ra trang công khai. Dữ liệu mẫu: `content/seed/`.

| Kiểu nội dung | Trường chính | Trường kiểm soát |
| --- | --- | --- |
| `Story` | tiêu đề, slug, sapo, chủ đề, ảnh bìa, nội dung (rich text có tham chiếu `SourceRef`), người biên tập, thời gian đọc | `status`: idea / draft / reviewed / published · `sources[]` |
| `Person` | tên, vai trò, năm làm nghề, ảnh chân dung, các đoạn kể, lời trích | `consent`: none / partial / full (tách riêng cho tên, ảnh, lời trích) · `reviewedBySubject` · `quoteSourceId` (bắt buộc nếu có lời trích) |
| `CraftStep` | số thứ tự, tên, mô tả, dụng cụ, ảnh, điểm phóng to (x%, y%) | `verifiedBy` (nghệ nhân) · `status` |
| `TimelineEvent` | mốc (chuỗi, cho phép "Thời Lê", "[?]"), tiêu đề, mô tả | `confidence`: press / oral / pending · `sources[]` |
| `Product` | tên, loại, nhóm (truyền thống / đương đại), ảnh, chất liệu, kỹ thuật, kích thước, bảo quản, `annotations[]` (x, y, tiêu đề, mô tả, nguồn) | `typeConfirmed` · `makerId` (chỉ hiện khi cơ sở đồng ý công khai) |
| `ArchiveAsset` | mã TL, tiêu đề, mô tả, nhóm, thời kỳ (xưa / nay), thời gian, nội dung liên quan | `photographer` · `owner` · `source` · `rights`: unknown / permitted / restricted · `subjectConsent` |
| `Maker` | tên cơ sở, liên hệ | `verified` · `publicConsent` |
| `SourceRef` | tên báo / tư liệu, tiêu đề, URL, ngày | — |
| `Contribution` | tên, liên hệ, loại, mô tả, tệp | `rightsConfirmed` · trạng thái duyệt (không tự động đăng) |

**Quy tắc hiển thị:**
- `rights ≠ permitted` thì không đăng công khai.
- `consent` chưa đủ thì hiện nhãn "Chờ đồng ý" và ẩn tên, lời trích.
- `status = idea` thì hiện "Chủ đề đề xuất", không có trang chi tiết.
- Trường trống thì hiển thị `[cần xác minh]` trên bản preview nội bộ, và ẩn hẳn trên bản công khai.

## Ghi chú triển khai

**Next.js, TypeScript, Tailwind**
- App Router; các trang danh sách và chi tiết dùng ISR, revalidate theo webhook của CMS.
- Map token vào Tailwind qua CSS variables. Nếu là Tailwind v4, khai báo trong `@theme`. Lưới dùng `grid-cols-12`, khoảng cách theo bậc 4.
- Font: `next/font/google` cho Noto Serif Display, Noto Serif và Be Vietnam Pro, khai báo `subsets: ['vietnamese','latin']`, `display: 'swap'`. Chỉ nạp các độ đậm đang dùng: 400 và 400 nghiêng cho hai font serif; 400, 500, 600 cho Be Vietnam Pro.
- Thẻ HTML: `lang="vi"`. Tiếng Anh làm sau theo route `/en/...`; nút EN hiện đang ở trạng thái vô hiệu.
- Không làm giỏ hàng, thanh toán, đăng nhập cho người xem. Form "Góp tư liệu" chỉ có backend khi dự án quyết định nhận đóng góp thật; khi đó cần lưu bằng chứng người gửi đã đồng ý.

**Hiệu năng** (mục tiêu: máy Android tầm trung, mạng 4G trong nước)
- `next/image` với AVIF/WebP, `sizes` theo lưới. Ảnh hero dùng `priority`, ảnh còn lại tải chậm (lazy). Ảnh tràn viền cần file gốc rộng tối thiểu 2400px.
- Luôn khai báo `width`/`height` hoặc `aspect-ratio` cho ảnh để trang không bị xô lệch khi tải. Không dùng video nền.
- Chuyển động viết bằng CSS và IntersectionObserver, không cần thư viện animation. Các phần tương tác (hành trình dệt, dòng thời gian, lightbox, khám phá đường dệt) làm client component; phần còn lại là server component.

**Khả năng truy cập** (mục tiêu WCAG 2.2 AA)
- [ ] Chữ tối thiểu 12px; mọi cặp màu theo bảng token.
- [ ] Vùng chạm tối thiểu 44×44px trên mobile.
- [ ] Dùng thẻ thật: `<button>`, `<a>`, `<label>`; không gắn sự kiện click vào `div`. Bộ lọc dùng `aria-pressed`, tab dùng `role=tablist`.
- [ ] Focus luôn nhìn thấy (viền 2px); lightbox giữ focus trong hộp.
- [ ] Alt text mô tả đúng cảnh trong ảnh; ảnh trang trí dùng `alt=""`.
- [ ] Trang vẫn dùng được khi phóng chữ 200%; tôn trọng `prefers-reduced-motion`.
- [ ] Thông tin không truyền đạt chỉ bằng màu (điểm mốc dòng thời gian, lỗi form đều có hình dạng hoặc chữ đi kèm).

## Cần xác minh trước khi ra mắt

Danh sách này chặn việc ra mắt công khai, nhưng không chặn việc triển khai code.

**Ảnh và quyền dùng**
- [ ] Xin phép và ghi công tác giả cho toàn bộ ảnh tham khảo. Metadata của 6 ảnh ghi tác giả "hson"; 2 ảnh có watermark Phạm Văn Sỹ và Phạm Quốc Bảo, đã loại khỏi thiết kế.
- [ ] Xác nhận ảnh nào được chụp ở làng Hới.
- [ ] Lấy sự đồng ý của những người nhìn rõ mặt trong ảnh, hoặc thay ảnh khác.
- [ ] Chụp bổ sung: phong cảnh làng, đồng cói, công đoạn phơi và nhuộm, chân dung cận, sản phẩm trên nền trơn (chiếu đót, sợi xe, gon), ảnh xưa. Ảnh hero cần rộng từ 2400px.

**Thông tin lịch sử và hành chính**
- [ ] Đối chiếu năm sinh, năm mất và năm đỗ Tam nguyên của Phạm Đôn Lễ (1457, 1531, 1481) với sử liệu khoa bảng.
- [ ] Thống nhất thời điểm mang nghề về làng: các nguồn ghi thời Lê, riêng Vietnam+ ghi đầu thế kỷ XVI.
- [ ] Đối chiếu địa giới hành chính mới (xã Long Hưng, tỉnh Hưng Yên) với nghị quyết sáp nhập.
- [ ] Xác minh năm lập đền thờ tổ nghề, cấp xếp hạng di tích, và ngày lễ tế (báo ghi mùng 6 tháng Giêng âm lịch).
- [ ] Đối chiếu số hộ, số khung dệt, số lao động với số liệu của xã (số liệu trong báo chưa thống nhất nên chưa đưa lên trang).

**Nghề và sản phẩm**
- [ ] Nhờ nghệ nhân xác nhận tên gọi và trình tự 7 công đoạn, tên các dụng cụ và bộ phận khung dệt.
- [ ] Xác nhận danh mục các loại chiếu (brief ghi chiếu cải, chiếu đậu; Vietnam+ ghi hoa cài, đót, sợi xe, gon) và đặc điểm từng loại.
- [ ] Xác nhận họa tiết cụ thể trên từng hiện vật. Chỉ ghi ý nghĩa biểu tượng khi có nguồn.
- [ ] Danh sách cơ sở dệt đồng ý công khai thông tin liên hệ.

**Con người và câu chuyện**
- [ ] Phỏng vấn có ghi âm; có mẫu giấy đồng ý riêng cho tên, ảnh và lời trích.
- [ ] Thẩm định bản nháp "Chuyện về Trạng Chiếu"; viết 5 bài theo chủ đề đề xuất.
- [ ] Cung cấp email, số điện thoại liên hệ và thông tin tham quan làng.

## Nguồn tham khảo

- Vietnam+ — [Giữ hồn nghề dệt chiếu cói làng Hới giữa nhịp sống hiện đại](https://www.vietnamplus.vn/giu-hon-nghe-det-chieu-coi-lang-hoi-giua-nhip-song-hien-dai-post1123026.vnp), 14/08/2026
- Dân Việt (dẫn Báo Hải Dương) — [Lăng mộ Trạng nguyên Phạm Đôn Lễ thời Hậu Lê ở Hải Dương](https://danviet.vn/lang-mo-trang-nguyen-pham-don-le-thoi-hau-le-o-hai-duong-ong-que-thai-binh-ong-to-nghe-det-chieu-20240613144750326-d1166801.html), 13/06/2024
- Đại Đoàn Kết — Vương Tâm, [Về làng Hới](https://daidoanket.vn/ve-lang-hoi-10198724.html), 07/08/2021
