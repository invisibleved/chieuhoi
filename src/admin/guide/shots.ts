export type GuideShot = {
  /** Tên file trong `public/admin-guide/`: `<id>.png`, và `<id>-mobile.png` khi `mobile`. */
  id: string
  /** Mô tả ảnh cho người không nhìn thấy ảnh. */
  alt: string
  /** Có thêm ảnh chụp ở bề ngang điện thoại (390px). */
  mobile: boolean
}

/**
 * Ảnh chụp cho trang Hướng dẫn, trên giao diện admin gốc của Payload. Spec `tests/e2e/admin-guide-shots.e2e.spec.ts`
 * chụp đúng các id này (`npm run guide:seed && npm run guide:shots`), trang Hướng dẫn đọc danh sách này để hiện ảnh.
 */
export const GUIDE_SHOTS: GuideShot[] = [
  { id: 'dang-nhap', alt: 'Trang đăng nhập đã điền email và mật khẩu, khung đỏ ở nút Đăng nhập.', mobile: false },
  { id: 'mo-menu', alt: 'Trang đầu, khung đỏ ở nút ba gạch ở góc trên bên trái để mở menu.', mobile: true },
  { id: 'menu-huong-dan', alt: 'Menu đã mở bên trái, khung đỏ ở mục Hướng dẫn cuối menu.', mobile: false },
  {
    id: 'trang-dau',
    alt: 'Trang đầu gồm các thẻ, khung đỏ quanh hai nhóm Tư liệu và Nội dung, có thẻ Kho tư liệu ảnh, Sản phẩm, Bài viết và Con người.',
    mobile: false,
  },
  { id: 'tai-anh-mo', alt: 'Trang đầu, khung đỏ quanh thẻ Kho tư liệu ảnh có nút dấu cộng.', mobile: false },
  { id: 'tai-anh-chon-file', alt: 'Trang tải ảnh lên, khung đỏ ở nút Chọn một file.', mobile: false },
  { id: 'tai-anh-luu', alt: 'Ảnh đã chọn và đã điền văn bản thay thế, khung đỏ ở nút Lưu.', mobile: false },
  { id: 'viet-bai-mo', alt: 'Trang đầu, khung đỏ quanh thẻ Bài viết có nút dấu cộng.', mobile: false },
  { id: 'viet-bai-noi-dung', alt: 'Trang sửa bài viết, khung đỏ quanh ô Nội dung.', mobile: false },
  {
    id: 'xem-truoc',
    alt: 'Trang sửa bài viết, khung đỏ ở nút nhỏ hình ô vuông có mũi tên chỉ ra ngoài, bên trái nút Lưu bản nháp.',
    mobile: false,
  },
  { id: 'gui-duyet-quy-trinh', alt: 'Trang sửa bài viết, khung đỏ quanh ô Quy trình đang chọn Chờ duyệt.', mobile: false },
  { id: 'gui-duyet-luu', alt: 'Trang sửa bài viết, khung đỏ ở nút Lưu bản nháp.', mobile: false },
  {
    id: 'loi-o-thieu',
    alt: 'Trang tải ảnh lên chưa lưu được, khung đỏ quanh thông báo lỗi màu đỏ ở phía dưới, ghi tên ô Văn bản thay thế.',
    mobile: false,
  },
  { id: 'duyet-danh-sach', alt: 'Danh sách Bài viết, khung đỏ ở chữ Chờ duyệt trong cột Quy trình.', mobile: false },
  { id: 'duyet-quyen-anh', alt: 'Trang sửa ảnh tư liệu, khung đỏ quanh ô Quyền sử dụng đang chọn Được phép.', mobile: false },
  { id: 'dang-bai-mo', alt: 'Danh sách Bài viết, khung đỏ ở tên bài đang chờ duyệt trong cột đầu.', mobile: false },
  { id: 'duyet-dang', alt: 'Bài viết đang chờ duyệt, khung đỏ ở nút Xuất bản tài liệu.', mobile: false },
  {
    id: 'du-kien-dia-gioi',
    alt: 'Phần mở đầu trang, phần Làng Hới, khung đỏ quanh dòng ĐỊA GIỚI HIỆN NAY trong Bảng thông tin đầu trang, đã mở ra, có các ô Mục, Nội dung và Nguồn.',
    mobile: false,
  },
  { id: 'du-kien-nguon', alt: 'Dòng Địa giới hiện nay đã mở, khung đỏ quanh ô Nguồn có các nguồn đã chọn.', mobile: false },
  { id: 'tao-tai-khoan', alt: 'Trang tạo người dùng mới, khung đỏ quanh ô Vai trò.', mobile: false },
]
