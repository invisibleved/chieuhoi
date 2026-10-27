// Chữ cố định trang chủ mà component chung cần nhận qua props (nhãn tư liệu, tiền tố tác giả ảnh).
import { docLabel, photoPrefix } from './docLabel'

export const homeCopy = { docLabel, photoPrefix }

export type HomeCopyView = typeof homeCopy
