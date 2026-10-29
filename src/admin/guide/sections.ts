import { isReviewerUser } from '@/access/roles'

/** Một bước. Chữ trên màn hình (nút, ô) viết trong `**…**` và phải khớp đúng chữ trên ảnh chụp `shot`. */
export type GuideStep = { text: string; shot?: string }

export type GuideSection = {
  /** Neo trong trang: `/admin/huong-dan#<id>`. */
  id: string
  title: string
  audience: 'all' | 'reviewer'
  /** Câu "Dùng khi…" mở đầu mục. */
  when: string
  steps: GuideStep[]
}

/** Câu mở đầu trang: chỉ chỗ mở menu, nơi có link Hướng dẫn. */
export const GUIDE_INTRO =
  'Menu nằm sau nút có ba gạch ngang ở góc trên bên trái, và trong menu có mục Hướng dẫn để bạn mở lại trang này.'

/**
 * Nội dung trang Hướng dẫn, viết theo giao diện admin gốc của Payload. Người đọc là người trong làng ít dùng máy tính:
 * câu ngắn, mỗi bước một việc, gọi "bạn", không dùng từ kỹ thuật. Thứ tự mục theo spec admin-de-dung, phần 4.
 */
export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'dang-nhap',
    title: 'Đăng nhập',
    audience: 'all',
    when: 'Dùng khi bạn mở trang quản lý để bắt đầu làm việc.',
    steps: [
      { text: 'Mở địa chỉ trang quản lý mà người duyệt đã gửi cho bạn.' },
      { text: 'Gõ email của bạn vào ô **Email**.' },
      { text: 'Gõ mật khẩu vào ô **Mật khẩu**.' },
      { text: 'Bấm **Đăng nhập**.', shot: 'dang-nhap' },
      {
        text: 'Bạn sẽ thấy trang đầu, gồm nhiều thẻ xếp theo nhóm. Việc của bạn nằm ở hai nhóm **Tư liệu** và **Nội dung**.',
        shot: 'trang-dau',
      },
      {
        text: 'Bạn chỉ cần các thẻ **Kho tư liệu ảnh**, **Bài viết**, **Con người** và **Sản phẩm**. Các thẻ khác bạn bỏ qua.',
      },
      { text: 'Muốn mở menu, bấm nút có ba gạch ngang ở góc trên bên trái.', shot: 'mo-menu' },
      { text: 'Trong menu, bấm **Hướng dẫn** để đọc lại trang này.', shot: 'menu-huong-dan' },
    ],
  },
  {
    id: 'tai-anh-len',
    title: 'Tải ảnh lên',
    audience: 'all',
    when: 'Dùng khi bạn có ảnh mới muốn đưa vào kho tư liệu.',
    steps: [
      { text: 'Ở trang đầu, bấm nút tròn có dấu cộng trong thẻ **Kho tư liệu ảnh**.', shot: 'tai-anh-mo' },
      { text: 'Bấm **Chọn một file**.', shot: 'tai-anh-chon-file' },
      { text: 'Chọn ảnh trong máy hoặc trong điện thoại của bạn.' },
      { text: 'Ở ô **Văn bản thay thế**, viết một câu tả những gì có trong ảnh, cho người không nhìn thấy ảnh.' },
      { text: 'Biết thì ghi thêm **Tiêu đề** và **Người chụp**. Không biết thì để trống, đừng đoán.' },
      { text: 'Hai ô **Quyền sử dụng** và **Đồng ý của người trong ảnh** do người duyệt chọn. Bạn để nguyên.' },
      { text: 'Bấm **Lưu**.', shot: 'tai-anh-luu' },
    ],
  },
  {
    id: 'viet-mot-bai',
    title: 'Viết một bài',
    audience: 'all',
    when: 'Dùng khi bạn muốn kể một câu chuyện về làng, về nghề hay về một người.',
    steps: [
      { text: 'Ở trang đầu, bấm nút tròn có dấu cộng trong thẻ **Bài viết**.', shot: 'viet-bai-mo' },
      {
        text: 'Ô trên cùng bên trái có dấu sao đỏ cần một tên ngắn cho bài: viết không dấu, nối các chữ bằng gạch ngang, ví dụ chieu-hoa-ngay-tet. Mỗi bài một tên riêng.',
      },
      { text: 'Gõ tên bài vào ô **Tiêu đề**.' },
      { text: 'Viết bài vào ô lớn **Nội dung**.', shot: 'viet-bai-noi-dung' },
      {
        text: 'Các ô **Sapo**, **Chuyên mục**, **Ảnh bìa**, **Chú thích ảnh bìa** và **Nguồn** có thể bỏ trống. Có thì điền, chưa có thì để đó.',
      },
      { text: 'Bấm **Lưu bản nháp** để giữ bài. Bài chưa hiện lên trang web.' },
      { text: 'Bản nháp lưu được cả khi còn ô có dấu sao đỏ để trống. Nhưng bài chỉ được đăng khi mọi ô có dấu sao đỏ đã điền.' },
    ],
  },
  {
    id: 'them-nguoi-san-pham',
    title: 'Thêm người hoặc sản phẩm',
    audience: 'all',
    when: 'Dùng khi bạn muốn giới thiệu một người làm nghề hoặc một chiếc chiếu.',
    steps: [
      { text: 'Ở trang đầu, nhóm **Nội dung**, tìm thẻ **Con người** hoặc thẻ **Sản phẩm**.', shot: 'trang-dau' },
      { text: 'Bấm nút tròn có dấu cộng trong thẻ đó.' },
      {
        text: 'Ô trên cùng bên trái có dấu sao đỏ cần một tên ngắn, viết không dấu, nối bằng gạch ngang. Với người, tên ngắn này không được có tên của người đó.',
      },
      { text: 'Gõ tên vào ô **Tên**.' },
      { text: 'Điền những ô bạn biết chắc. Ô nào chưa rõ thì để trống, đừng đoán.' },
      { text: 'Với người, phần **Đồng ý công khai** do người duyệt đánh dấu khi người đó đã đồng ý. Bạn để nguyên.' },
      { text: 'Bấm **Lưu bản nháp**.' },
    ],
  },
  {
    id: 'xem-truoc',
    title: 'Xem trước bài trên trang',
    audience: 'all',
    when: 'Dùng khi bạn muốn xem bài sẽ trông thế nào trên trang web trước khi đăng.',
    steps: [
      { text: 'Bấm **Lưu bản nháp** trước, để bản xem trước có chữ mới nhất.' },
      { text: 'Nếu nút **Lưu bản nháp** mờ đi, bài đã được lưu rồi.' },
      {
        text: 'Bấm nút nhỏ hình ô vuông có mũi tên chỉ ra ngoài. Nút này nằm ngay bên trái nút lưu bản nháp.',
        shot: 'xem-truoc',
      },
      { text: 'Trang web mở ra ở một thẻ mới. Người ngoài chưa thấy bài này.' },
      { text: 'Xem xong, đóng thẻ đó để quay lại sửa bài.' },
    ],
  },
  {
    id: 'gui-duyet',
    title: 'Gửi bài cho người duyệt',
    audience: 'all',
    when: 'Dùng khi bài đã viết xong và bạn muốn người duyệt xem để đăng.',
    steps: [
      { text: 'Trong menu, bấm **Bài viết**.' },
      { text: 'Bấm vào tên bài của bạn.' },
      { text: 'Ở ô **Quy trình**, chọn **Chờ duyệt**.', shot: 'gui-duyet-quy-trinh' },
      { text: 'Bấm **Lưu bản nháp**.', shot: 'gui-duyet-luu' },
      { text: 'Xong. Trong danh sách **Bài viết**, bài của bạn có chữ **Chờ duyệt** ở cột **Quy trình**. Người duyệt nhìn đó để biết.' },
      { text: 'Đừng bấm **Xuất bản tài liệu**. Nút đó chỉ dành cho người duyệt.' },
    ],
  },
  {
    id: 'quen-mat-khau',
    title: 'Quên mật khẩu',
    audience: 'all',
    when: 'Dùng khi bạn không nhớ mật khẩu để đăng nhập.',
    steps: [
      { text: 'Đừng bấm **Quên mật khẩu?** ở trang đăng nhập. Trang này chưa gửi thư được, bạn sẽ không nhận được gì.' },
      { text: 'Gọi điện hoặc nhắn tin, nhờ người duyệt đặt lại mật khẩu cho bạn.' },
      { text: 'Người duyệt sẽ đưa bạn mật khẩu mới.' },
      { text: 'Gõ mật khẩu mới đó vào ô **Mật khẩu**.' },
      { text: 'Bấm **Đăng nhập**.', shot: 'dang-nhap' },
    ],
  },
  {
    id: 'khi-gap-loi',
    title: 'Khi gặp lỗi',
    audience: 'all',
    when: 'Dùng khi trang hiện chữ báo lỗi hoặc không lưu được.',
    steps: [
      {
        text: 'Đọc thông báo màu đỏ hiện ở phía dưới màn hình. Chữ sau dấu hai chấm là tên ô đang thiếu hoặc sai.',
        shot: 'loi-o-thieu',
      },
      { text: 'Tìm ô có tên đó trên trang.' },
      { text: 'Điền ô đó.' },
      { text: 'Bấm lưu lại.' },
      { text: 'Nếu trang báo bạn không có quyền, hãy bấm **Lưu bản nháp** thay cho nút bạn vừa bấm.' },
      { text: 'Nếu trang đứng yên hay trắng trơn, hãy tải lại trang. Những gì đã lưu vẫn còn.' },
      { text: 'Vẫn không được thì chụp màn hình và gửi cho người duyệt.' },
    ],
  },
  {
    id: 'xem-bai-cho-duyet',
    title: 'Xem bài chờ duyệt',
    audience: 'reviewer',
    when: 'Dùng khi bạn muốn biết có bài nào đang đợi bạn xem.',
    steps: [
      { text: 'Trong menu, bấm **Bài viết**.' },
      { text: 'Nhìn cột **Quy trình** trong danh sách.' },
      { text: 'Bài có chữ **Chờ duyệt** ở cột đó là bài đang đợi bạn.', shot: 'duyet-danh-sach' },
      { text: 'Trên điện thoại, cột **Quy trình** nằm bên phải. Vuốt bảng sang trái để thấy.' },
      { text: 'Bấm vào tên bài để mở và đọc.' },
      { text: 'Làm giống vậy với **Con người** và **Sản phẩm** để xem người và sản phẩm đang chờ duyệt.' },
      { text: 'Nếu bài cần sửa thêm, ở ô **Quy trình**, chọn **Bản nháp**.' },
      { text: 'Bấm **Lưu bản nháp**.' },
      { text: 'Báo cho người viết biết bài cần sửa chỗ nào.' },
    ],
  },
  {
    id: 'quyen-anh-dong-y',
    title: 'Đánh dấu quyền dùng ảnh và sự đồng ý',
    audience: 'reviewer',
    when: 'Dùng khi bạn đã hỏi chủ ảnh và người trong ảnh, và họ đã cho phép.',
    steps: [
      { text: 'Trong menu, bấm **Kho tư liệu ảnh**.' },
      { text: 'Bấm vào ảnh cần đánh dấu.' },
      { text: 'Ở ô **Quyền sử dụng**, chọn **Được phép**.', shot: 'duyet-quyen-anh' },
      { text: 'Chỉ chọn **Được phép** khi chủ ảnh đã cho phép. Ảnh chưa được phép sẽ không hiện trên trang web.' },
      { text: 'Ở ô **Đồng ý của người trong ảnh**, chọn **Đã đồng ý**. Ảnh không có người thì chọn **Không áp dụng**.' },
      { text: 'Bấm **Lưu**.' },
      { text: 'Với một người: trong menu, bấm **Con người**.' },
      { text: 'Bấm vào tên người đó.' },
      { text: 'Ở phần **Đồng ý công khai**, chỉ đánh dấu **Tên**, **Ảnh**, **Trích dẫn** mà người đó đã đồng ý.' },
      { text: 'Bấm **Xuất bản tài liệu**.' },
      { text: 'Ô nào chưa đánh dấu, trang web sẽ hiện chữ "Chờ đồng ý" thay cho phần đó.' },
    ],
  },
  {
    id: 'dang-bai',
    title: 'Đăng bài',
    audience: 'reviewer',
    when: 'Dùng khi bạn đã đọc bài chờ duyệt và thấy bài đúng, đủ.',
    steps: [
      { text: 'Trong menu, bấm **Bài viết**.' },
      { text: 'Tìm bài có chữ **Chờ duyệt** ở cột **Quy trình**.' },
      { text: 'Bấm vào tên bài đó, là dòng chữ có gạch chân ở cột đầu. Bấm vào chữ Chờ duyệt thì không mở được bài.', shot: 'dang-bai-mo' },
      { text: 'Xem lại: ảnh trong bài đã được phép dùng, người trong bài đã đồng ý.' },
      { text: 'Bấm **Xuất bản tài liệu**.', shot: 'duyet-dang' },
      { text: 'Bài hiện lên trang web. Ô **Quy trình** tự chuyển sang **Đã đăng**.' },
    ],
  },
  {
    id: 'tao-tai-khoan',
    title: 'Tạo tài khoản cho người mới',
    audience: 'reviewer',
    when: 'Dùng khi có người mới muốn cùng viết bài, hoặc khi ai đó quên mật khẩu.',
    steps: [
      { text: 'Trong menu, bấm **Người dùng**.' },
      { text: 'Bấm **Tạo mới**.' },
      { text: 'Gõ email của người mới vào ô **Email**.' },
      { text: 'Nghĩ một mật khẩu, gõ vào ô **Mật khẩu mới**.' },
      { text: 'Gõ lại mật khẩu đó vào ô **Xác nhận mật khẩu**.' },
      { text: 'Ở ô **Vai trò**, chọn **Biên tập viên**.', shot: 'tao-tai-khoan' },
      { text: 'Bấm **Lưu**.' },
      { text: 'Đưa email và mật khẩu cho người mới, tận tay hoặc qua điện thoại.' },
      { text: 'Khi ai đó quên mật khẩu: trong menu, bấm **Người dùng**.' },
      { text: 'Bấm vào email của người đó.' },
      { text: 'Bấm **Đổi mật khẩu**.' },
      { text: 'Gõ mật khẩu mới vào ô **Mật khẩu mới**.' },
      { text: 'Gõ lại mật khẩu đó vào ô **Xác nhận mật khẩu**.' },
      { text: 'Bấm **Lưu**.' },
      { text: 'Đưa mật khẩu mới cho người đó.' },
    ],
  },
]

/** Biên tập viên chỉ thấy phần cho mọi người; người duyệt thấy cả hai phần. */
export function sectionsFor(user: unknown): GuideSection[] {
  const reviewer = isReviewerUser(user)
  return GUIDE_SECTIONS.filter((s) => s.audience === 'all' || reviewer)
}

export type GuideTextPart = { text: string; bold: boolean }

/** Tách câu thành đoạn thường và đoạn in đậm (`**…**`). */
export function guideTextParts(text: string): GuideTextPart[] {
  return text
    .split('**')
    .map((t, i) => ({ text: t, bold: i % 2 === 1 }))
    .filter((p) => p.text !== '')
}
