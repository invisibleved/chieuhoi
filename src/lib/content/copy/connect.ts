// Chữ cố định của /ket-noi, chép nguyên văn từ artboard Kết nối (desktop và mobile).
// Nhánh `preview` là placeholder cho thông tin liên hệ chưa có: chỉ hiện ở bản xem trước.
import type { ApplyMode } from './applyMode'

export const connectCopy = {
  breadcrumb: { home: 'Trang chủ', current: 'Kết nối' },
  ways: [
    { n: '01', title: 'Góp ảnh và ký ức', body: 'Ảnh cũ, giấy tờ, câu chuyện của gia đình bạn về nghề chiếu.' },
    { n: '02', title: 'Giới thiệu người giữ nghề', body: 'Chúng tôi sẽ hỏi ý họ trước khi ghi lại bất cứ điều gì.' },
    { n: '03', title: 'Kết nối cơ sở dệt', body: 'Danh sách cơ sở chỉ công khai khi đã xác minh và được đồng ý.' },
    { n: '04', title: 'Hợp tác văn hoá', body: 'Nghiên cứu, triển lãm, giáo dục về làng nghề.' },
  ],
  form: {
    title: 'Góp một ký ức',
    lead: 'Chúng tôi đọc từng đóng góp, liên hệ để xác minh, và chỉ đăng khi bạn đồng ý.',
    note: {
      desktop: 'Bản minh hoạ thiết kế. Chưa có hệ thống nhận đóng góp thật; không có dữ liệu nào được gửi đi.',
      mobile: 'Bản minh hoạ. Chưa có hệ thống nhận thật; không dữ liệu nào được gửi đi.',
    },
    name: { label: 'Họ và tên', error: 'Vui lòng cho biết tên để chúng tôi xưng hô.' },
    contact: { label: 'Số điện thoại hoặc email', error: 'Cần một cách liên lạc để xác minh đóng góp.' },
    type: {
      legend: 'Bạn muốn góp gì?',
      options: [
        { value: 'photo', label: 'Ảnh hoặc giấy tờ cũ' },
        { value: 'story', label: 'Một câu chuyện, ký ức' },
        { value: 'person', label: 'Giới thiệu người giữ nghề' },
        { value: 'other', label: 'Hợp tác, câu hỏi khác' },
      ],
    },
    story: { label: 'Câu chuyện hoặc mô tả', hint: 'Ví dụ: ảnh chụp năm nào, ai trong ảnh, ở đâu trong làng.' },
    upload: { label: 'Ảnh hoặc tệp', title: 'Kéo ảnh vào đây hoặc chọn tệp', hint: 'JPG, PNG · minh hoạ, chưa có hệ thống tải lên' },
    consent: {
      label: 'Tôi là chủ sở hữu hoặc được phép chia sẻ tư liệu này, và đồng ý để Chiếu Hới liên hệ xác minh, đăng kèm ghi công khi tôi duyệt.',
      error: 'Cần xác nhận quyền chia sẻ trước khi gửi.',
    },
    summary: { count: 'Còn {n} mục cần bổ sung.', rest: ' Xem các ô được đánh dấu bên dưới.' },
    submit: 'Gửi đóng góp',
    withdraw: 'Bạn có thể yêu cầu gỡ đóng góp bất cứ lúc nào.',
    success: {
      title: 'Cảm ơn {name}.',
      fallbackName: 'bạn',
      body: 'Chúng tôi sẽ liên hệ qua {contact} để xác minh trước khi đăng. (Màn hình minh hoạ: chưa có dữ liệu nào thực sự được gửi.)',
      fallbackContact: 'thông tin bạn để lại',
      again: 'Góp thêm một ký ức',
    },
  },
  contact: {
    title: 'Thông tin liên hệ',
    labels: { email: 'EMAIL', phone: 'ĐIỆN THOẠI', address: 'ĐỊA CHỈ', visit: 'THĂM LÀNG' },
    noVisit: { desktop: 'Chưa có thông tin tham quan chính thức', mobile: 'Thăm làng: chưa có thông tin chính thức' },
    visitPrefix: { desktop: null, mobile: 'Thăm làng: ' },
    preview: { email: '[Email liên hệ]', phone: '[Số điện thoại]' },
  },
} as const

export type ConnectCopyView = ApplyMode<typeof connectCopy>
