export type GuideShot = {
  /** Tên file trong `public/admin-guide/`: `<id>.png`, và `<id>-mobile.png` khi `mobile`. */
  id: string
  /** Mô tả ảnh cho người không nhìn thấy ảnh. */
  alt: string
  /** Có thêm ảnh chụp ở bề ngang điện thoại (390px). */
  mobile: boolean
}

/**
 * Ảnh chụp cho trang Hướng dẫn. Spec `tests/e2e/admin-guide-shots.e2e.spec.ts` chụp đúng các id này
 * (`npm run guide:seed && npm run guide:shots`), trang Hướng dẫn đọc danh sách này để hiện ảnh.
 */
export const GUIDE_SHOTS: GuideShot[] = [
  { id: 'dang-nhap', alt: 'Trang đăng nhập đã điền email và mật khẩu, khung đỏ ở nút Đăng nhập.', mobile: false },
  { id: 'trang-dau', alt: 'Trang đầu sau khi đăng nhập, khung đỏ quanh các nút Việc thường làm.', mobile: false },
  { id: 'tai-anh-chon-file', alt: 'Trang tải ảnh lên, khung đỏ ở nút Chọn một file.', mobile: false },
  { id: 'tai-anh-luu', alt: 'Ảnh đã chọn và đã điền văn bản thay thế, khung đỏ ở nút Lưu.', mobile: false },
  { id: 'viet-bai-mo', alt: 'Trang đầu, khung đỏ ở nút Viết bài mới.', mobile: false },
  { id: 'viet-bai-noi-dung', alt: 'Trang sửa bài viết, khung đỏ quanh ô Nội dung.', mobile: false },
  { id: 'gui-duyet-quy-trinh', alt: 'Trang sửa bài viết, khung đỏ quanh ô Quy trình đang chọn Chờ duyệt.', mobile: false },
  { id: 'gui-duyet-luu', alt: 'Trang sửa bài viết, khung đỏ ở nút Lưu bản nháp.', mobile: false },
  { id: 'xem-truoc', alt: 'Trang sửa bài viết, khung đỏ ở nút Bản xem trước (hình mũi tên ra ngoài) cạnh nút Lưu bản nháp.', mobile: false },
  { id: 'menu-dien-thoai', alt: 'Trang đầu, khung đỏ ở nút ba gạch ở góc trên bên trái để mở menu.', mobile: true },
  { id: 'duyet-danh-sach', alt: 'Trang đầu của người duyệt, khung đỏ quanh ô Đang chờ duyệt có một bài viết.', mobile: false },
  { id: 'duyet-quyen-anh', alt: 'Trang sửa ảnh tư liệu, khung đỏ quanh ô Quyền sử dụng đang chọn Được phép.', mobile: false },
  { id: 'duyet-dang', alt: 'Bài viết đang chờ duyệt, khung đỏ ở nút Xuất bản tài liệu.', mobile: false },
  { id: 'tao-tai-khoan', alt: 'Trang tạo người dùng mới, khung đỏ quanh ô Vai trò.', mobile: false },
]
