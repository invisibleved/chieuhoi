# Admin dễ dùng cho người trong làng — thiết kế

Ngày: 2026-10-29. Nhánh: `admin-de-dung`.

## Vì sao

Người nhập nội dung là người trong làng Hới, ít quen máy tính và chưa từng dùng CMS. Khoảng một nửa dùng máy tính, một nửa dùng điện thoại. Admin Payload hiện tại chạy đúng và tự co giãn theo màn hình, nhưng người mới vào không biết bắt đầu từ đâu:
- trang đầu là 11 ô xám giống hệt nhau, ô đầu tiên là "Quản trị → Người dùng";
- không có nút cho việc thường làm;
- logo là của Payload, không có gì của Chiếu Hới.

Thành công nghĩa là: một người trong làng, chỉ cần bộ hướng dẫn, tự đăng nhập rồi tải ảnh hoặc viết một bài và gửi duyệt, không cần ai ngồi cạnh.

## Mục tiêu

1. **Nhận diện Chiếu Hới trong admin.**
   - Logo ở trang đăng nhập và icon trên thanh trên thay cho logo Payload.
   - Màu, font lấy từ token của site.
2. **Trang đầu chỉ ra việc cần làm.**
   - Trên cùng là vài nút việc to, bấm được bằng ngón tay.
   - Người duyệt thấy thêm số bài đang chờ duyệt.
   - Lưới ô sẵn có của Payload vẫn ở bên dưới.
3. **Biên tập viên chỉ thấy những mục họ cần.** Các mục quản trị và cấu hình bị ẩn khỏi menu và trang đầu.
4. **Bộ hướng dẫn ngay trong admin.**
   - Mỗi việc một mục, các bước đánh số.
   - Có ảnh chụp đánh dấu đúng chỗ cần bấm.
   - Đọc được trên điện thoại và in được.

## Không làm

- Không viết lại admin, không dùng shadcn. Giữ nguyên Payload cùng mọi chức năng: phân quyền, bản nháp, xem trước, tải ảnh, lịch sử.
- Không sửa form nhập liệu. Người dùng đã quyết: trường, nhãn, mô tả và thứ tự giữ nguyên. Các chỗ còn tiếng Anh ("Thêm: Review Checklist") và ô chọn "Ngôn ngữ" ghi vào backlog.
- Không thêm tính năng nội dung mới, không đổi quyền truy cập dữ liệu. Ẩn khỏi menu chỉ là giao diện; quyền vẫn do `access` quyết định như cũ.
- Không đổi giao diện site công khai.

## Ràng buộc

- Giữ quy tắc trong CLAUDE.md: kiến trúc một chiều, chữ tối thiểu 12px, vùng chạm 44×44px trên mobile, focus nhìn thấy, màu chữ chỉ lấy từ token và đạt WCAG AA, bo góc 0, không bóng đổ, không gradient.
- Component admin dùng chung đặt trong `src/components/admin/`, có test unit. Chúng chỉ nhận props hoặc dùng API client của Payload (`@payloadcms/ui`); số đếm "chờ duyệt" lấy ở server component qua Local API với quyền của người đang đăng nhập.
- Ảnh trong bộ hướng dẫn **không bao giờ** chứa ảnh tham khảo (`design/reference-images`, `public/images/reference/`). Ảnh được commit nên phải chụp trên dữ liệu mẫu có ảnh minh hoạ tự tạo (ô màu, hoa văn vẽ bằng code), không chụp trên DB dev.
- Không có dịch vụ email: link "Quên mật khẩu?" không gửi được thư. Hướng dẫn phải nói rõ: quên mật khẩu thì nhờ người duyệt đặt lại.
- Bản `next dev` hiện nút "N" của Next.js; ảnh hướng dẫn chụp trên bản build để không có nút này.

## Các phần đã quyết

### 1. Nhận diện
- **Logo** (trang đăng nhập): chữ "CHIẾU HỚI" giống header site (Noto Serif Display, giãn chữ rộng), dưới là dòng nhỏ "Quản lý nội dung". *Quyết định của Claude.*
- **Icon** (thanh trên, cạnh breadcrumb): chữ "CH" nhỏ cùng font. *Quyết định của Claude.*
- **Màu và font:** ghi đè biến CSS của Payload trong `src/app/(payload)/custom.scss`.
  - Nền: màu cói sáng (`--bg-raised` / `--bg-primary`).
  - Nút chính: xanh làng (`--bg-inverse`).
  - Focus: `--focus-light`.
  - Font: Be Vietnam Pro.
  - Tắt chế độ tối (`admin.theme: 'light'`), để chỉ phải kiểm tương phản một bộ màu và ảnh hướng dẫn luôn khớp với màn hình người làng thấy. *Quyết định của Claude.*
- **Trang đăng nhập:** thay link "Quên mật khẩu?" bằng dòng chữ "Quên mật khẩu? Nhờ người duyệt đặt lại.", vì không có email để gửi thư. Đây là form đăng nhập, không phải form nhập liệu, nên không đụng quyết định "không sửa form". *Quyết định của Claude.*

### 2. Trang đầu
Thêm một khối "Việc thường làm" bằng `admin.components.beforeDashboard`:

| Nút | Dẫn tới |
|---|---|
| Tải ảnh lên | tạo mới Kho tư liệu ảnh |
| Viết bài mới | tạo mới Bài viết |
| Thêm người | tạo mới Con người |
| Thêm sản phẩm | tạo mới Sản phẩm |
| Xem hướng dẫn | trang Hướng dẫn |

Danh sách nút là *quyết định của Claude*, dựa trên những gì biên tập viên được tạo.

- Nút chỉ hiện khi người đang đăng nhập có quyền tạo mục đó, lấy từ quyền Payload trả về. Hiện tại biên tập viên tạo được cả bốn loại. *Quyết định của Claude.*
- **Người duyệt** thấy thêm một dòng "Đang chờ duyệt". Dòng này cho số bản ghi có `workflow = 'in_review'` trong từng collection có trường này; mỗi số là link tới danh sách đã lọc sẵn. Số bằng 0 thì ghi "Không có bài nào chờ duyệt".
  - Collection được đếm: những collection có trường `workflow`. Tính trên bản mới nhất (gồm cả bản nháp), không chỉ bản đã đăng.
  - Kho tư liệu ảnh không có `workflow` nên không được đếm. *Quyết định của Claude.*
  - Đếm ảnh chưa xác nhận quyền dùng thì để vào backlog.
- **Trên điện thoại** các nút xếp thành một cột, rộng hết màn hình.
- Lưới ô sẵn có giữ nguyên bên dưới, đặt tiêu đề "Tất cả mục".

### 3. Ẩn theo vai trò
Với biên tập viên (`role !== 'reviewer'`), dùng `admin.hidden` để ẩn khỏi menu và trang đầu:
- Người dùng
- Thông tin site
- Phần mở đầu trang
- Nguồn

Người duyệt vẫn thấy tất cả. Biên tập viên vẫn thêm được nguồn từ ô "Nguồn" trong form như cũ. Danh sách ẩn là phần người dùng đã đồng ý ("đúng rồi") với đề xuất của Claude.

"Ẩn" ở đây chỉ có nghĩa là không hiện trong menu và trang đầu. URL vẫn mở được (quyền do `access` quyết định), và ô quan hệ "Nguồn" cùng hộp "Thêm mới" trong form vẫn chạy. Payload có `admin.group: false`: ẩn khỏi menu và trang đầu mà không tắt route, nhưng tuỳ chọn này cố định, không theo vai trò. `admin.hidden` thì nhận user, nhưng có thể tắt cả route và hộp quan hệ. Người làm kiểm tra hành vi thật của `admin.hidden` trên bản 3.92:
- nếu ô quan hệ và URL vẫn chạy thì dùng `admin.hidden`;
- nếu không thì lọc mục theo vai trò trong menu và trang đầu bằng component riêng.

Kèm một e2e: biên tập viên thêm được nguồn từ form Bài viết.

### 4. Bộ hướng dẫn
**Vị trí:** một trang riêng trong admin, `/admin/huong-dan`. *Quyết định của Claude*, vì người dùng chưa chọn giữa bản in, điện thoại hay trong admin. Trang này:
- có link trong menu admin (`afterNavLinks`) và ở trang đầu;
- dùng được trên điện thoại;
- có kiểu in (`@media print`) để in ra giấy.

**Nội dung** chia hai phần theo vai trò.

| Phần | Các mục |
|---|---|
| Dành cho mọi người | Đăng nhập; Tải ảnh lên; Viết một bài; Thêm người hoặc sản phẩm; Xem trước bài trên trang; Gửi bài cho người duyệt (đổi "Quy trình" sang "Chờ duyệt" rồi "Lưu bản nháp"); Quên mật khẩu (nhờ người duyệt); Khi gặp lỗi |
| Dành cho người duyệt | Xem bài chờ duyệt; Đánh dấu quyền dùng ảnh và sự đồng ý; Đăng bài; Tạo tài khoản cho người mới |

**Cách viết:**
- Câu ngắn, mỗi bước một việc.
- Gọi nút đúng chữ trên màn hình, in đậm.
- Không dùng từ kỹ thuật (đường dẫn, slug, collection, CMS).
- Mỗi mục mở đầu bằng một câu "Dùng khi nào". Có thêm một đoạn ngắn nói những ô nào có thể bỏ trống.

**Ảnh chụp:**
- Một script Playwright chụp trên bản build với dữ liệu mẫu riêng cho hướng dẫn (ảnh minh hoạ tự tạo). Ảnh lưu vào thư mục commit được.
- Bước cần bấm được đánh dấu bằng khung viền màu đỏ điều (`--accent`), không dùng mũi tên vẽ tay.
- Chụp bản máy tính cho mọi bước. Chụp thêm bản điện thoại cho bước nào trên điện thoại trông khác, ví dụ phải mở menu.
- Chạy lại script là có ảnh mới khi giao diện đổi.
- Dữ liệu cho ảnh chụp:
  - Dùng DB `chieuhoi_test` và một seeder riêng cho hướng dẫn, không dùng `npm run seed` (seed trỏ tới ảnh tham khảo).
  - Ảnh minh hoạ tự tạo bằng `sharp`.
  - Ảnh chụp trên bản build `next start` với `APP_ENV=development`. Admin không phụ thuộc chế độ xem trước, và không có hộp mật khẩu staging.
  - Bước đầu tiên chụp trang đăng nhập Payload đã đổi nhận diện. *Quyết định của Claude.*
- Phạm vi: viết đầy đủ cả 12 mục. Chữ in đậm trong hướng dẫn phải khớp đúng chữ trên ảnh chụp; người review kiểm bằng cách đối chiếu.
- Mỗi ảnh có `alt` mô tả bước.

## Phần để người làm quyết

- Đường dẫn file component, tên script chụp ảnh, nơi để ảnh trong `public/`.
- Cách lấy số "chờ duyệt", miễn là có quyền và không chậm trang đầu một cách đáng kể.
- Tắt hay giữ chế độ tối của Payload.
- Nội dung hướng dẫn viết bằng TSX hay MDX.

## Kiểm tra

- Unit test cho các component admin mới, kể cả danh sách ẩn theo vai trò.
- E2E:
  - biên tập viên không thấy các mục bị ẩn, người duyệt thấy;
  - các nút trang đầu mở đúng form;
  - `/admin/huong-dan` mở được khi đã đăng nhập;
  - axe không có lỗi trên trang đầu và trang hướng dẫn ở 1440 và 390.
- Chụp trang đăng nhập, trang đầu và trang hướng dẫn ở 1440 và 390 để người dùng xem cuối phase.

## Thay đổi ngày 2026-10-29 (sau khi người dùng xem bản đầu)

Người dùng thấy giao diện đã đổi kém đẹp hơn admin gốc và quyết định **về hẳn admin gốc của Payload**. Bỏ các mục tiêu 1, 2, 3:
- nhận diện (logo, icon, màu, font, trang đăng nhập, tắt chế độ tối);
- trang đầu có nút việc và số chờ duyệt;
- menu ẩn theo vai trò.

Chỉ giữ **mục tiêu 4, bộ hướng dẫn**, viết lại theo giao diện gốc:
- trang `/admin/huong-dan` và link "Hướng dẫn" trong menu;
- kiểu chữ của trang hướng dẫn dùng biến màu sẵn có của Payload, chữ thân vẫn 16px để dễ đọc;
- ảnh chụp và nhãn in đậm chụp lại trên admin gốc;
- link "Quên mật khẩu?" gốc không gửi được thư, nên hướng dẫn vẫn bảo nhờ người duyệt;
- người duyệt tìm bài chờ duyệt bằng cột hoặc bộ lọc "Quy trình" trong danh sách.
- component admin đặt trong `src/admin/` (không import `@/components`), thay cho `src/components/admin/` ở mục "Ràng buộc".
