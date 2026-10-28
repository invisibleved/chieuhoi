# Phase 7 — Báo cáo kiểm tra

## So với thiết kế

So bằng mắt (R14), không so pixel: ảnh thiết kế `design/screens/*.jpg` (trái) ghép cạnh ảnh chụp bản preview :3000 (phải), có phiên người duyệt và giảm chuyển động.
Cách tạo lại: `SCREENS=1 npm run test:e2e -- --project=chromium --no-deps tests/e2e/screens.e2e.spec.ts`, rồi `node tools/screens-sheet.mjs`. Ảnh nằm trong `test-results/screens/` và `.superpowers/screens/`, không commit.

Phạm vi: đã xem đủ 25 màn hình (12 trang × 2 viewport, MenuMobile, Components, Foundations).
Không tính là lệch:
- nút "N" của Next dev;
- nhãn "Ảnh chưa được phép đăng" của bản preview;
- footer đầy đủ ở các trang con (artboard chỉ vẽ footer rút gọn kèm ghi chú "xem artboard Trang chủ").

Loại: `dữ liệu` (CMS khác chữ/ảnh minh hoạ, đúng ý), `bố cục`, `kiểu chữ`, `màu`, `thiếu`, `a11y`. Mức: `rõ` / `nhỏ`.

### Toàn site (header, footer, link)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 + 390 | Link mũi tên (`LinkArrow`) và link chữ đứng riêng ("Đọc về làng Hới →", "Tất cả câu chuyện →", "Xem nguồn →", "Kết nối với cơ sở dệt", "Gửi yêu cầu →", "Yêu cầu sửa hoặc gỡ bài →") | Thiết kế: gạch chân, mũi tên cách chữ ~10px. Build: không gạch chân, mũi tên dài (⟶) dính liền chữ. Có ở mọi trang và trên `/styleguide` (mục "LINK MŨI TÊN"). | kiểu chữ | rõ |
| 1440 + 390 | Breadcrumb | Thiết kế gạch chân các mục cha ("Trang chủ", "Câu chuyện"). Build không gạch chân. | kiểu chữ | nhỏ |
| 390 | Link quay lại "← Câu chuyện" / "← Con người" / "← Sản phẩm" | Thiết kế: chữ thường, màu chữ chính, gạch chân. Build: đậm, màu đỏ điều, không gạch chân. | kiểu chữ | nhỏ |
| 1440 | Header | VI/EN có khung viền; header cao hơn artboard ~10px (đã có trong backlog). | bố cục | nhỏ |
| 1440 | Nav desktop | Mục đang ở có gạch chân màu rơm. Artboard các trang không vẽ trạng thái này, chỉ `Components` có ("03 · trang hiện tại: gạch chân sợi rơm"). Khớp spec component. Ghi lại để chốt. | bố cục | nhỏ |
| 1440 | Nút "Kết nối" trên header ở `/ket-noi` | Artboard ConnectPage tô đỏ nút này (trang hiện tại). Build vẫn để màu thường. | thiếu | nhỏ |
| 390 | Eyebrow đầu trang ("03 — NGHỀ DỆT CHIẾU"…) | Bản mobile của thiết kế không có gạch ngang phía trước. Build có gạch ở mọi trang. | kiểu chữ | nhỏ |
| 390 | Breadcrumb mobile | Build hiện breadcrumb ở `/con-nguoi`, `/cau-chuyen` (đã có trong backlog); `/nghe-det-chieu`, `/lang-hoi` thì thiết kế cũng có. | bố cục | nhỏ |
| 1440 + 390 | Footer: link điều hướng | Build dùng chữ đậm hơn (medium). Thiết kế dùng chữ thường 400. | kiểu chữ | nhỏ |
| 1440 + 390 | Footer: liên hệ | "[cần xác minh] · [cần xác minh]" thay cho "[Email liên hệ] · [Số điện thoại]" (đã có trong backlog). | dữ liệu | nhỏ |
| 1440 + 390 | Danh sách nguồn (`SourceList`) ở Làng Hới, bài viết, hiện vật | Thiết kế: tiêu đề nguồn màu đỏ điều. Build: màu chữ chính (gạch chân). Số thứ tự "1." ở ghi chú nguồn: thiết kế màu chữ, build màu vàng. | màu | nhỏ |
| 390 | Danh sách nguồn mobile | Thiết kế cắt tiêu đề dài bằng "…" trên một dòng. Build xuống đủ 2–3 dòng. | bố cục | nhỏ |
| 1440 | Ô "Đọc tiếp"/"Liên quan"/"Hiện vật khác" (preview) | Nhãn "Ảnh chưa được phép đăng" trên ảnh thẻ hiện bằng font serif (kế thừa từ thẻ), ở mọi nơi khác là sans. Chỉ bản preview. | kiểu chữ | nhỏ |
| 390 | Mũi tên dòng "Đọc tiếp"/"Liên quan" mobile | Build dùng mũi tên dài, to hơn (⟶). Thiết kế dùng → nhỏ. | kiểu chữ | nhỏ |
| 390 | Chữ trích dẫn (pull quote) ở bài viết và chân dung | Build lớn hơn artboard: câu trích xuống thêm 1 dòng (desktop 3 dòng thay vì 2, mobile "[Trích nguyên văn lời kể]" xuống 2 dòng). | kiểu chữ | nhỏ |

### Trang chủ — Home (1440) / HomeMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 + 390 | Toàn trang | Tư liệu, chú thích, số công đoạn (7 thay vì 6), ảnh chân dung thứ ba, bài/hiện vật, nhãn "Chủ đề đề xuất"/"Bản nháp", "Xem đề cương" thay "Đọc bài" đều theo CMS. | dữ liệu | nhỏ |
| 1440 | Hero: ảnh nhỏ chồng | Ảnh nhỏ nằm thấp hơn ~20px, đè lên nhãn preview của ảnh lớn (còn lộ chữ "› đăng"). | bố cục | nhỏ |
| 1440 + 390 | Giữa "Nghề dệt chiếu" (nền xanh) và "Con người" | Build có đường kẻ sợi (threads) ngay dưới khối xanh. Thiết kế không có (đường kẻ chỉ nằm giữa Con người và Câu chuyện). | bố cục | nhỏ |
| 1440 + 390 | Thẻ chân dung | Có eyebrow vai trò ("NGHỆ NHÂN") và tag nét đứt "[cần xác minh]". Thiết kế không có (eyebrow đã có trong backlog). | bố cục | nhỏ |
| 390 | Dải chân dung | Dòng gợi ý chỉ còn "Vuốt ngang để xem thêm". Thiếu bộ đếm "· 1 / 3" của artboard. | thiếu | nhỏ |
| 390 | Dải chân dung | Thiết kế cho thẻ đầu tràn sát mép trái 0px. Build lùi vào 20px. | bố cục | nhỏ |
| 390 | Thẻ câu chuyện gọn | Nhãn preview xuống dòng từng chữ trong ảnh nhỏ (đã có trong backlog). | bố cục | nhỏ |

### Menu mobile — MenuMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 390 | Danh sách mục | Mỗi dòng thấp hơn ~2px. Nút "Kết nối với làng" và "Tìm kiếm" cao hơn artboard ~12px. | bố cục | nhỏ |
| 390 | Đường kẻ sợi cuối menu | Thiết kế màu rơm. Build màu xám nhạt. | màu | nhỏ |

### Nghề dệt chiếu — CraftPage (1440) / CraftMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 + 390 | Toàn trang | Công đoạn mở sẵn là 01 thay vì 05/01, ảnh tư liệu, phụ đề và mô tả theo CMS. Lead mobile dùng bản desktop (dài hơn). | dữ liệu | nhỏ |
| 390 | Khối chi tiết công đoạn | Build có thêm mục "CẦN GHI LẠI". Artboard mobile chỉ có "DỤNG CỤ". | bố cục | nhỏ |

### Làng Hới — VillagePage (1440) / VillageMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 | Khoảng giữa đầu trang và ảnh lớn | Build để trống ~150px. Thiết kế ~56px. Ảnh lớn bị đẩy xuống rõ. | bố cục | rõ |
| 1440 + 390 | Đường kẻ sợi | Thiết kế đặt đường kẻ giữa "Vị trí" và "Đời sống làng". Build không có ở đó mà đặt ngay trên khối "Di sản hôm nay" (nền cói đậm). Mobile cũng thêm đường kẻ trên "Di sản hôm nay". | bố cục | nhỏ |
| 1440 | Ô bản đồ chờ dữ liệu | Thiết kế có nền kẻ ngang mảnh. Build nền trơn. | thiếu | nhỏ |
| 390 | Dòng thời gian mobile | Năm của mốc chưa mở: thiết kế màu sáng nhạt (muted), build màu vàng. | màu | nhỏ |
| 390 | Lead, mô tả | Lead mobile dùng bản desktop. H2 "Di sản hôm nay" xuống 3 dòng (cỡ 32px, đã có trong backlog). | dữ liệu | nhỏ |

### Câu chuyện — StoriesIndex (1440) / StoriesMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 | Ô tìm kiếm đầu trang | Ô hẹp hơn nhiều (~230px so với ~360px). Placeholder bị cắt "Ví dụ: khung dệt, Trạn…". | bố cục | rõ |
| 1440 + 390 | Đoạn mô tả trong thẻ bài | Thiết kế dùng sans (Be Vietnam Pro). Build dùng serif (Noto Serif). | kiểu chữ | rõ |
| 1440 | Thẻ chủ đề đề xuất | Thiết kế có CTA "Xem đề cương →" dưới mỗi thẻ. Build không có ở trang danh sách (trang chủ thì có). | thiếu | nhỏ |
| 1440 | Đầu trang | Tiêu đề và ảnh nổi bật thấp hơn ~25px (PageHeader cao hơn, đã có trong backlog). | bố cục | nhỏ |
| 390 | Cuối danh sách | Build có nút "Xem thêm câu chuyện" và "Đã hiện hết…". Artboard mobile không có. | bố cục | nhỏ |
| 1440 + 390 | Thẻ, số bài | Ảnh bìa, "4 PHÚT ĐỌC", "6 bài", lead mobile theo CMS. | dữ liệu | nhỏ |

### Bài câu chuyện — StoryDetail (1440) / StoryMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 + 390 | Toàn bài | Thân bài mobile dùng bản đầy đủ (artboard mobile rút gọn). Meta "[cần xác minh]" thay "[Tên biên tập viên]"/"[chờ thẩm định]" (đã có trong backlog). Bài "Đọc tiếp" thứ ba khác. | dữ liệu | nhỏ |
| 1440 | Mục lục | Sau khi cuộn hết rồi về đầu, mục cuối vẫn sáng (đã có trong backlog). Nhãn mục dài xuống 2 dòng. | bố cục | nhỏ |
| 390 | Tiêu đề h1 | Xuống dòng "Chuyện về Trạng / Chiếu" thay vì "Chuyện về / Trạng Chiếu". | kiểu chữ | nhỏ |
| 390 | Chú thích số trong bài | Hai số "1 2" dính nhau. Thiết kế cách rõ. | kiểu chữ | nhỏ |
| 390 | Nút chia sẻ | "Sao chép link" xuống 2 dòng (đã có trong backlog). | bố cục | nhỏ |

### Con người — PeopleIndex (1440) / PeopleMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 + 390 | Thẻ chân dung | Thêm tag nét đứt "[cần xác minh]" dưới vai trò. Thiết kế không có. | dữ liệu | nhỏ |
| 390 | Giữa khung nguyên tắc và bộ lọc | Build có đường kẻ sợi. Artboard mobile không có. | bố cục | nhỏ |
| 390 | Lead, khung nguyên tắc, số chân dung | Lead mobile dùng bản desktop. Nội dung khung nguyên tắc dài hơn. "8 chân dung" thay "6". | dữ liệu | nhỏ |

### Chân dung — PersonDetail (1440) / PersonMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 + 390 | Liên quan | Chỉ 2 thẻ (desktop) / 1 dòng (mobile). Thiếu "Chiếu do [tên] làm" vì không có sản phẩm liên quan. | dữ liệu | nhỏ |
| 1440 + 390 | Tên, tiêu đề | "[cần xác minh]" thay "[Tên nghệ nhân]" / "[tên]". | dữ liệu | nhỏ |

### Sản phẩm — ProductsIndex (1440) / ProductsMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 + 390 | Thẻ hiện vật | Thêm tag nét đứt "[cần xác minh]" dưới mô tả (mobile: dưới tên). | dữ liệu | nhỏ |
| 390 | Tag "Chưa có ảnh" | Artboard mobile tô nền cói đậm. Build viền nét đứt (giống desktop). | kiểu chữ | nhỏ |
| 1440 | Đầu trang, "Xem nguồn" | PageHeader cao hơn, "Xem nguồn" 15px (đã có trong backlog). | bố cục | nhỏ |
| 390 | Lead | Dùng lead desktop (artboard mobile rút gọn). | dữ liệu | nhỏ |

### Chi tiết sản phẩm — ProductDetail (1440) / ProductMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 + 390 | Khối "Nguồn" | Build có thêm khối nguồn [1] trước "Hiện vật khác". Artboard không vẽ (hiện vật có nguồn trong CMS). | dữ liệu | nhỏ |
| 1440 | Eyebrow | "HIỆN VẬT 01 · CHIẾU CÓI TRUYỀN THỐNG" xuống 2 dòng. Artboard ghi "CHIẾU CÓI". | dữ liệu | nhỏ |
| 390 | Chọn điểm hoa văn ("1 · Viền / 2 · Hoa văn / 3 · Mặt cói") | Thiết kế là dải chữ không khung, kẻ dưới. Build là ba ô có viền. | bố cục | nhỏ |
| 1440 + 390 | Mô tả, tag "[cần xác minh]", bảng thông tin | Thêm dòng "Hoa văn", mô tả dài hơn, tag nét đứt. | dữ liệu | nhỏ |

### Thư viện — ArchivePage (1440) / ArchiveMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 + 390 | Header/footer | Header nền sáng. Artboard vẽ nền tối (đã có trong backlog). | màu | rõ |
| 1440 | Đường kẻ sợi dưới đầu trang | Thiết kế màu hồng đất trên nền tối. Build màu rơm. | màu | nhỏ |
| 390 | Lead, số tư liệu, nhãn | Lead mobile dùng bản desktop. "14 tư liệu" thay "10". | dữ liệu | nhỏ |

### Kết nối — ConnectPage (1440) / ConnectMobile (390)

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 | Ô liên hệ | Đường kẻ cuối các ô không khớp artboard (đã có trong backlog). | bố cục | nhỏ |
| 390 | Lead, địa chỉ | Lead dài hơn. Dòng ghi chú địa chỉ khác chữ. | dữ liệu | nhỏ |

### Component / Nền tảng — Components (1440) / Foundations (1440), so với `/styleguide`

| Viewport | Vùng | Lệch gì | Loại | Mức |
|---|---|---|---|---|
| 1440 | "Thành phần di sản" | Chỗ của "Bước công đoạn" và "Điểm hoa văn" chỉ còn khung "Làm ở Phase 4." / "Làm ở Phase 5.". Thiết kế vẽ đủ trạng thái (mặc định/hover/đang chọn/focus; điểm 1-2-3). Demo thật nằm ở mục khác của styleguide. | thiếu | rõ |
| 1440 | "Lightbox thư viện" | Chỉ còn khung "Làm ở Phase 5.". Thiết kế vẽ hộp lightbox đầy đủ (demo thật nằm trong mục "Bộ lọc, tab & phân trang"). | thiếu | rõ |
| 1440 | "Bộ lọc, tab & phân trang" | Thiếu mẫu phân trang số (1 2 3 →). Build chỉ có "Xem thêm". | thiếu | nhỏ |
| 1440 | Foundations (màu, chữ, khoảng cách, lưới, chuyển động) | `/styleguide` không có phần Nền tảng. Token chỉ có trong CSS. | thiếu | nhỏ |
| 1440 | Đầu trang | Build có header site, breadcrumb và ba khung ghi chú dev. Artboard không có. | bố cục | nhỏ |
| 1440 | Thứ tự mục | Build thêm "Thành phần chung", "Khối trang Nghề & Làng", "Bài đọc & chân dung", "Thẻ khi thiếu dữ liệu". Mục "Bộ lọc…" nằm sau các mục này. | bố cục | nhỏ |

### Tổng hợp

- Tổng 66 dòng: 7 `rõ`, 59 `nhỏ`.
- Theo loại:
  - `dữ liệu`: 17
  - `bố cục`: 24
  - `kiểu chữ`: 12
  - `màu`: 5
  - `thiếu`: 8
  - `a11y`: 0
- Không thấy lỗi a11y mới bằng mắt.
- Những mục ghi "(đã có trong backlog)" được nhắc lại để đủ bối cảnh. Đó không phải mục mới.
