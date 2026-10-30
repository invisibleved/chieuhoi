# Chuyển dữ kiện cố định của trang Làng Hới và Nghề dệt chiếu vào CMS

Ngày: 2026-10-30. Trạng thái: chờ duyệt.

## Vì sao

Hai trang `/lang-hoi` và `/nghe-det-chieu` có nhiều dữ kiện đang viết cứng trong `src/lib/content/copy/village.ts` và `copy/craft.ts`. Đó là dữ kiện về làng (địa giới, tổ nghề, vị trí, di sản) và về nghề (ghi chú dụng cụ, bảng so sánh dệt tay với dệt máy). Dữ kiện loại này đổi mỗi khi xác minh thêm. Ví dụ hôm nay: địa giới được xác nhận theo Nghị quyết 1666/NQ-UBTVQH15 và 202/2025/QH15, và bài Vietnam+ cho số liệu "2 lá/ngày dệt tay, 25 lá/ngày dệt máy". Hiện mỗi lần sửa phải nhờ dev rồi deploy. Admin (biên tập viên, người duyệt) cần tự sửa trong `/admin` và đăng qua quy trình duyệt sẵn có.

CLAUDE.md đã quy định "nguồn thật là Payload/Postgres". Việc này đưa hai trang về đúng quy định đó.

## Mục tiêu

- Biên tập viên sửa được trong `/admin` mọi **dữ kiện** của hai trang (danh sách ở mục Phạm vi), kèm chọn nguồn. Người duyệt đăng, web đổi theo mà không cần deploy.
- Chú thích số [n] vẫn tự đánh và trỏ tới danh sách nguồn cuối trang, như hiện nay.
- Hiển thị sau khi chuyển **giống hệt hiện nay** ở cả 1440px và 390px, với dữ liệu seed tương ứng nội dung hiện tại (gồm phần đã sửa ngày 2026-10-30: 2 nghị quyết, bỏ ghi chú "cần đối chiếu" ở Địa giới).
- Giữ nguyên luật hiển thị: chữ trống hoặc còn `[cần xác minh]`/`[chờ …]` bị ẩn ở bản công khai và hiện placeholder ở bản xem trước. Câu có nguồn mà mọi nguồn bị ẩn thì câu cũng ẩn ở bản công khai.

## Không làm

- Bản đồ vị trí. Toạ độ đã có (làng 20.647372790279487, 106.14036435985214; đền thờ tổ nghề 20.64635912580336, 106.1407453664099) nhưng bản đồ sẽ có thiết kế và kế hoạch riêng. Đợt này không thêm ô toạ độ.
- Chữ giao diện theo artboard: tiêu đề section, dòng nhỏ phía trên, nhãn nút, chú giải độ tin cậy, nhãn aria, thẻ "Đọc tiếp", lời mời "Mốc của bạn". Các chữ này vẫn ở `copy/*.ts`.
- Các trang khác (Trang chủ, Con người, Sản phẩm, Câu chuyện, Thư viện, Kết nối).
- Sửa nội dung. Ví dụ câu "bên kia sông là thành phố Hưng Yên" đã lỗi thời. Admin sẽ sửa câu này trong CMS sau khi có công cụ; đợt này seed nguyên văn hiện tại.
- Tiếng Anh.

## Điều không được để xảy ra

- Trang công khai hiện một dữ kiện có nguồn mà không có chú thích số, hoặc hiện chú thích trỏ tới nguồn bị ẩn.
- Biên tập viên phải hiểu khái niệm kỹ thuật (sourceId, JSON, desktop/mobile) mới nhập được.
- Bản công khai bị trống hoặc vỡ bố cục chỉ vì global chưa được đăng sau khi deploy. Xem mục Chuyển tiếp.
- Ghi chú biên tập (nhánh `preview`) lọt ra bản công khai.

## Phạm vi: những gì chuyển vào CMS

Tất cả nằm trong global sẵn có **Phần mở đầu trang** (`page-intros`), tab **Làng Hới** và tab **Nghề dệt chiếu**. Không thêm menu hay global mới. Người dùng đã duyệt mockup theo cách này: các ô mới nằm dưới phần dòng nhỏ, tiêu đề, đoạn dẫn, ảnh của trang đang có. Đặt tên nhóm theo tiêu đề section người đọc thấy trên web.

### Tab Làng Hới

| Nhóm trong admin | Thay cho | Nội dung mỗi mục |
| --- | --- | --- |
| Bảng thông tin đầu trang | `villageFacts` | Mảng dòng: Mục (vd "ĐỊA GIỚI HIỆN NAY"), Nội dung, Bản ngắn cho điện thoại (tuỳ chọn), Ghi chú, Ghi chú ngắn cho điện thoại (tuỳ chọn), Ghi chú biên tập (chỉ bản xem trước), Nguồn (chọn nhiều từ Sources) |
| Tổ nghề | `villageCopy.founder.paragraphs`, `.conflict`, `.noPortrait` | Mảng **đoạn**, mỗi đoạn là mảng **câu**. Hộp "Các nguồn chưa thống nhất" là một mảng câu riêng, kèm ghi chú biên tập cuối hộp. Dòng "Không có chân dung lịch sử…" là một ô chữ |
| Vị trí | `villageCopy.location.body`, `.preview.note` | Một câu có nguồn + ghi chú biên tập. Ô bản đồ chờ (`preview.map`) vẫn là chữ giao diện trong code |
| Di sản hôm nay | `villageCopy.heritage.paragraphs`, `.preview.note` | Mảng câu có nguồn + ghi chú biên tập |

Mỗi **câu có nguồn** có các ô: Câu, Bản ngắn cho điện thoại (tuỳ chọn), Ẩn trên điện thoại (ô tick), Nguồn. Đây là dạng chung cho mọi chỗ có chú thích, và là cách biểu diễn `{ text: { desktop, mobile }, cite }` hiện nay:

- Bản ngắn trống, không tick: điện thoại dùng câu đầy đủ.
- Có bản ngắn: điện thoại dùng bản ngắn.
- Tick "Ẩn trên điện thoại": điện thoại không hiện câu này, ứng với `mobile: null` hiện nay.

### Tab Nghề dệt chiếu

| Nhóm trong admin | Thay cho | Nội dung |
| --- | --- | --- |
| Dụng cụ | `craftTools[].note` | Mảng tối đa 3 dòng theo thứ tự: Tên dụng cụ, Ghi chú (câu có nguồn). Ảnh vẫn lấy từ ô ảnh "Dụng cụ 1–3" theo thứ tự dòng (cách hiện nay) |
| Hai cách dệt | `craftCompare.hand/machine.text/note`, `craftCompare.rows` | Thẻ Dệt thủ công và Dệt bằng máy: Mô tả, Ghi chú (đều là câu có nguồn). Bảng so sánh: mảng hàng gồm Khía cạnh, Thủ công, Bằng máy, Dòng cho điện thoại (tuỳ chọn), Nguồn |

Hàng so sánh trên điện thoại: nếu ô "Dòng cho điện thoại" trống, hệ thống tự ghép `Thủ công: … · Máy: …` (đúng mẫu của 3 hàng cuối trên artboard mobile). Seed điền đúng văn bản mobile hiện tại cho cả 4 hàng, nên hiển thị không đổi.

Tên dụng cụ, tiêu đề thẻ "Dệt thủ công", "Dệt bằng máy" và tên khía cạnh đang nằm trong code. Chúng chuyển vào CMS cùng ghi chú, vì là dữ kiện: tên gọi địa phương của dụng cụ còn chờ người làng xác nhận.

### Chú thích nguồn trên trang Nghề dệt chiếu

Trang Nghề dệt hiện không có chú thích hay danh sách nguồn. Sau khi chuyển, ghi chú dụng cụ, thẻ hai cách dệt và hàng so sánh đều có ô Nguồn. Khi có ít nhất một nguồn hiển thị được, trang hiện danh sách nguồn cuối trang bằng component dùng chung `SourceList` và ký hiệu `Cite`, giống trang Làng Hới. Không có nguồn thì không hiện gì: với dữ liệu seed hiện tại, trang trông như cũ. Đây là quyết định của tôi để giữ luật "mọi dữ kiện có nguồn phải có chú thích số" khi admin bắt đầu nhập số liệu từ Vietnam+.

## Luật hành vi

- **Đánh số nguồn** (quyết định của tôi): mỗi tab có thêm ô **Nguồn tham khảo của trang**, tức danh sách nguồn có sắp thứ tự, kéo thả được. Số [n] theo đúng thứ tự đó, thay cho `villageSourceOrder` cố định. Nguồn được trích trong trang mà không có trong danh sách thì tự nối vào cuối, theo thứ tự xuất hiện đầu tiên từ trên xuống: bảng thông tin → tổ nghề (đoạn, rồi hộp chưa thống nhất) → vị trí → di sản (trang Nghề dệt: dụng cụ → thẻ hai cách dệt → bảng so sánh). Seed điền danh sách Làng Hới là Vietnam+, Dân Việt, Đại Đoàn Kết, NQ 1666, NQ 202, nên số [1]–[5] giữ nguyên như hiện nay. Không dùng thứ tự xuất hiện thuần tuý, vì với dữ liệu hiện tại nó đánh lại số (Đại Đoàn Kết thành [2]) và làm lệch artboard.
- **Dòng thời gian:** không đổi; dòng nguồn của mốc vẫn là "publisher (ngày)", không đánh số.
- **Bản công khai:** mọi ô chữ đi qua `showText`/`applyMode` như hiện nay. Ghi chú biên tập luôn là `null` ở public. Dòng bảng thông tin có nguồn mà mọi nguồn bị ẩn thì bỏ cả dòng (giữ luật trong `getVillagePage`).
- **Section rỗng:** section nào mọi câu đều rỗng ở mode hiện tại thì ẩn, như logic `founderOn`/`locationOn` hiện có.
- **Kiểm dữ liệu khi lưu:** Mục và Câu không được trống. Hàng so sánh phải có Khía cạnh. Dụng cụ tối đa 3 dòng.

## Kiến trúc (theo CLAUDE.md)

- Schema: các nhóm mới thêm trong `src/globals/PageIntros.ts`, tách thành file trường riêng nếu dài. Dạng "câu có nguồn" là một hàm tạo Field dùng chung cho cả hai tab.
- `src/lib/content/pages.ts` đọc global, ánh xạ thành **đúng kiểu view model hiện có** (`VillagePageView`, `CraftPageView`). Phần `copy` chỉ còn chữ giao diện. Đánh số nguồn đặt ở lớp `lib/content`, không đặt trong component.
- Component trong `src/components/village` và `craft` không đổi, hoặc chỉ đổi vì kiểu dữ liệu. Không lọc consent/rights trong component.
- Seed: chuyển nội dung hiện tại của `villageFacts`, `founder`, `location`, `heritage`, `craftTools`, `craftCompare` sang `src/seed/data/` (như `timeline.ts`). Ở dev/staging (quyết định của tôi): seed đọc bản đã đăng của `page-intros` và chỉ điền các nhóm mới **đang trống**, không đụng tiêu đề, ảnh hay nhóm admin đã nhập. Nếu global đang có bản nháp chưa đăng, seed lưu thành nháp và in cảnh báo, không đăng thay người duyệt. Ngược lại thì đăng luôn. `SEED_FORCE_GLOBALS=true` vẫn giữ nghĩa cũ.
- Migration: `npm run migrate:create <tên>`, commit `src/migrations`.

## Chuyển tiếp lúc deploy (prod đang trống)

Prod hiện chưa có dữ liệu CMS. Sau deploy, global chưa có các ô mới nên hai section Tổ nghề, Vị trí, Di sản, bảng thông tin… sẽ trống cho tới khi có dữ liệu. Thứ tự lên prod:

1. Deploy (`npm run ci` chạy migration).
2. Chạy **lệnh nhập riêng** (người dùng đã chọn, 2026-10-30), ví dụ `npm run import:page-facts`. Không nới `src/seed/guard.ts` và không cho `npm run seed` chạy ở production. Lệnh này:
   - chạy được ở mọi `APP_ENV`, kể cả production; dùng chung dữ liệu với seed (`src/seed/data/`);
   - chỉ tạo các nguồn mà trang cần (Vietnam+, Dân Việt, Đại Đoàn Kết, NQ 1666, NQ 202) nếu chưa có `sourceId` đó, và không sửa nguồn đã có;
   - chỉ điền các nhóm mới của tab Làng Hới và Nghề dệt chiếu khi nhóm đó **đang trống**, không đụng ô nào khác của global;
   - lưu global thành **bản nháp**, không bao giờ đăng. Nguồn mới cũng ở trạng thái chưa đăng nếu collection Sources có quy trình đăng;
   - không bao giờ tạo người, sản phẩm, câu chuyện, ảnh hay mốc dòng thời gian;
   - in ra những gì đã tạo, đã bỏ qua và lý do; chạy lại lần hai không đổi gì;
   - có test int cho các luật trên và mục hướng dẫn trong `docs/DEPLOY.md`. Sửa dòng "Không chạy `npm run seed`…" cho rõ lệnh nào được phép.
3. Người duyệt xem bản nháp ở `/admin` rồi đăng global Phần mở đầu trang và các nguồn.

Hai section rỗng là chấp nhận được trong lúc chuyển tiếp, vì logic "section rỗng thì ẩn" đã có. Không cần fallback về code.

## Trang hướng dẫn admin

Cập nhật `/admin/huong-dan` (`src/admin/`): thêm mục "Sửa dữ kiện trang Làng Hới và Nghề dệt", có ví dụ dòng Địa giới hiện nay và cách gắn nguồn. Chụp lại ảnh bằng `npm run guide:seed && npm run guide:shots`. Nhãn in đậm mới phải khớp `labels.json`.

## Kiểm tra

- Unit: ánh xạ global → view model (gồm 3 trường hợp bản ngắn / ẩn trên điện thoại / trống), đánh số nguồn theo thứ tự xuất hiện, tự ghép dòng so sánh cho điện thoại, ẩn ghi chú biên tập ở public, bỏ dòng có nguồn bị ẩn hết. Sửa các test đang import `villageFacts`/`craftTools`/`craftCompare` trực tiếp.
- Int: `pages.int.spec.ts` chạy với dữ liệu seed, kết quả view model bằng với hiện nay. Test validate khi lưu global.
- E2E/chụp màn hình: `SCREENS=1 … screens.e2e.spec.ts` cho `/lang-hoi` và `/nghe-det-chieu` ở 1440 và 390, so với ảnh trước khi đổi. Không được có khác biệt.
- `npm run lint`, `npm run build`.

## Để lại cho người làm

- Tên trường và cấu trúc lồng nhau chính xác trong Payload (group/array/tabs), miễn là nhãn admin như trên.
- Có giữ `villageFacts`… làm dữ liệu seed hay viết lại thành dạng dữ liệu seed.
- Chia task và thứ tự.

## Ghi chú môi trường

Postgres cục bộ ở port 5433 đang nhận kết nối rồi đóng ngay (`ECONNRESET`), nên `npm run test:int` lỗi toàn bộ. Cần sửa Docker trước khi chạy test tích hợp. Các thay đổi ngày 2026-10-30 (2 nghị quyết, mốc "Hôm nay", "Đền thờ tổ nghề") chưa commit và chưa qua test int.
