// Chữ cố định trang chủ mà component chung cần nhận qua props (nhãn tư liệu, tiền tố tác giả ảnh, nhãn chờ đồng ý).
import { docLabel, photoPrefix } from './docLabel'
import { peopleCopy } from './people'

// `pendingLabel`: nhãn "Chờ đồng ý" trên thẻ chân dung, cùng nguồn với trang Con người.
export const homeCopy = { docLabel, photoPrefix, pendingLabel: peopleCopy.card.pending }

export type HomeCopyView = typeof homeCopy
