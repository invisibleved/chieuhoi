# Nhập nội dung khởi đầu lên prod (A) và nghiên cứu thêm dữ kiện (B)

Ngày: 2026-10-31. Trạng thái: chờ duyệt.

## Vì sao

Chạy thử trên DB trắng giống prod (2026-10-31) cho thấy sau `migrate`, `create-reviewer`, `import:page-facts` thì web gần như rỗng: chỉ có dữ kiện hai trang Làng Hới và Nghề dệt chiếu. Dòng thời gian, công đoạn, sản phẩm, tiêu đề và đoạn dẫn đầu trang, chân trang đều trống. Các nội dung này đã có sẵn và đã kiểm trong repo (`content/seed/*.json`, `src/seed/data/*.ts`), nhưng chỉ `npm run seed` đưa vào DB, mà seed bị chặn ở prod (vì nó kéo theo ảnh tham khảo chưa có quyền).

Người dùng muốn người lạ vào trang đọc được: lịch sử văn hoá của làng nghề, cách làm, các sản phẩm, và hình ảnh văn hoá con người làng nghề. Ảnh và con người sẽ do một người làng làm nghề cung cấp sau (người dùng tự lo, tải lên `/admin`). Việc ở đây là phần chữ.

Nguyên tắc của người dùng: **đọc rồi mới đăng**. Không gì được tự đăng.

## Hai phần, làm theo thứ tự

- **A.** Lệnh nhập ở prod đưa vào toàn bộ nội dung chữ đã kiểm trong repo, dưới dạng bản nháp.
- **B.** Nghiên cứu thêm dữ kiện có nguồn, viết thành tài liệu để người dùng và người làng đọc. Chỉ phần được đồng ý mới vào lệnh nhập (một thay đổi nhỏ sau đó, đi qua quy trình bình thường).

A xong (code, test, chạy thử DB trắng) rồi mới làm B.

---

## A. Lệnh nhập nội dung khởi đầu

### Mục tiêu

Trên DB trắng, sau `migrate` → `create-reviewer` → lệnh nhập → người duyệt đăng từng mục trong `/admin`, các trang hiện đủ phần chữ giống trang dev, chỉ thiếu ảnh (các ô ảnh hiện "Ảnh cần chụp" như hiện nay).

### Phạm vi nhập

Dữ liệu lấy đúng nguồn mà `npm run seed` đang dùng, không viết lại, không thêm câu mới:

| Nội dung | Nguồn dữ liệu | Khoá tự nhiên | Ghi chú |
|---|---|---|---|
| Nguồn (sources) | `content/seed/sources.json` | `sourceId` | Toàn bộ 5 nguồn (đã có trong lệnh hiện tại) |
| Dòng thời gian | `timeline.json` + `timelineCopy` | `order` | 7 mốc, giữ `confidence` và nguồn |
| Công đoạn | `craftSteps.json` + `craftCopy` | `n` | 7 bước, **không** gắn ảnh; giữ `shotNeeded`, `focus` |
| Sản phẩm | `products.json` + `productSummary` | `slug` | 7 loại, **không** gắn ảnh; giữ chú giải (annotations) và nguồn của chú giải |
| Bài "Chuyện về Trạng Chiếu" | `stories.json` + `chuyen-ve-trang-chieu.md` + `storyExtras` | `slug` | Thân bài giữ chú thích nguồn, **bỏ mọi hình chèn** (figure) và ảnh bìa |
| Phần mở đầu trang | `pageIntros` (`site.ts`) | trường | `eyebrow`, `title`, `heroTitle`, `lead` của mọi trang; **không** ảnh/`media` |
| Thông tin site | `siteSettings` (`site.ts`) | trường | Tagline, mô tả, địa chỉ, ghi chú địa chỉ, bản quyền |
| Dữ kiện trang | như lệnh hiện tại | nhóm | Giữ nguyên hành vi `importPageFacts` |

Không nhập:
- Ảnh tư liệu (`archive-assets`) và mọi quan hệ tới ảnh. Ảnh tham khảo không bao giờ lên prod.
- Hồ sơ người mẫu (`peopleSamples`): tên null, chưa ai đồng ý, ảnh tham khảo. Con người sẽ nhập thật khi người làng đồng ý.
- 5 bài trạng thái `idea`: chỉ là gợi ý chủ đề, chưa có nội dung.
- Người làm nghề (`makers`): seed không có dữ liệu.

### Hành vi

- **Chỉ tạo, không ghi đè.** Bản ghi đã tồn tại theo khoá tự nhiên (kể cả bản admin đã sửa hoặc đã xoá nội dung) thì bỏ qua và báo trong kết quả. Global chỉ điền trường đang trống; trường đã có chữ thì giữ.
- **Không tự đăng.** Bản ghi mới tạo dưới dạng bản nháp Payload (`_status: draft`) và `workflow: 'draft'`. Global lưu một bản nháp (cùng logic đang có của `importPageFacts`: dữ kiện trang và phần mở đầu trang nằm chung global `page-intros`, nên gộp vào **một** lần lưu nháp, không tạo hai bản nháp chồng nhau).
- Bản công khai không hiện gì mới cho tới khi người duyệt đăng (truy vấn công khai đã lọc `_status: 'published'`).
  - Ngoại lệ: **nguồn** (`sources`) không có bản nháp, nên được tạo ở trạng thái dùng được ngay, giống lệnh `import:page-facts` hiện nay. Trang công khai chỉ hiện một nguồn khi có nội dung đã đăng trích dẫn nó, nên nguồn đứng một mình không lộ ra. *(Quyết định của Claude.)*
- **Trạng thái trong JSON bị bỏ qua.** `status` của từng mục trong `content/seed/*.json` không quyết định gì ở lệnh nhập: mọi thứ lệnh nhập tạo ra đều là nháp, với `workflow: 'draft'`. Seed dev vẫn dùng `status` như hiện nay. Phần chuyển dữ liệu dùng chung nhận trạng thái đăng và giá trị `workflow` làm tham số.
- **Global "trường trống"** được tính trên bản mới nhất: bản nháp nếu có, không thì bản đã đăng. Đây cũng là bản `updateGlobal` sẽ chồng lên. Lệnh chỉ điền trường đang trống, rồi lưu thành bản nháp. Nếu đang có bản nháp chờ duyệt thì điền vào chính bản nháp đó và báo `warning` trong kết quả, giống `importPageFacts` hiện tại. *(Quyết định của Claude.)*
- **Chạy lại an toàn:** chạy lần hai trên cùng DB báo "Không có gì để nhập." Lệnh dành cho lần đầu lên prod. Nếu chạy lại, một bản ghi đã bị xoá hẳn sẽ được tạo lại, và một trường global cố ý để trống sẽ được điền lại. Chấp nhận như vậy, ghi rõ trong `DEPLOY.md` cạnh lưu ý tương tự đã có; không làm cơ chế "bia mộ". *(Quyết định của Claude.)*
- **Người chạy:** như lệnh hiện tại, không cần tài khoản (`overrideAccess`, không có `user`). *(Quyết định của Claude.)*
- **Bài Trạng Chiếu:** đoạn `[[figure:…]]` trong markdown chỉ chứa chú thích ảnh, không có dữ kiện có nguồn, nên bỏ cả đoạn.
- Chạy được ở mọi `APP_ENV`, như lệnh hiện tại. Không dùng `assertSeedAllowed`.
- Bản ghi tạo ra phải hợp lệ theo schema hiện tại (không đổi schema, không cần migration), và **người duyệt đăng được**. Bản nháp bỏ qua kiểm tra hợp lệ, nhưng lúc đăng thì có kiểm tra, nên test phải đăng thật từng loại.

### Lệnh

- Lệnh mới `npm run import:content` chạy toàn bộ bảng trên và in báo cáo theo từng loại (đã tạo / bỏ qua vì đã có).
- `npm run import:page-facts` vẫn chạy được như cũ (đã ghi trong `DEPLOY.md`). Builder chọn: giữ riêng hay cho nó gọi chung phần dữ kiện trang.
- *(Quyết định của Claude:)* tên `import:content`.

### `npm run seed` ở dev

Kết quả của seed ở dev **không đổi** (vẫn gắn ảnh tham khảo, vẫn đăng sẵn như hiện nay, vẫn tạo người mẫu và bài ý tưởng). Builder nên cho seed và lệnh nhập dùng chung phần chuyển dữ liệu (đọc JSON → dữ liệu Payload) để hai nơi không lệch nhau; phần khác nhau (ảnh, trạng thái đăng, ghi đè) là tham số.

### Hướng dẫn

- `docs/DEPLOY.md`: thay bước nhập bằng `import:content`, ghi rõ người duyệt phải đăng từng mục: 7 mốc, 7 công đoạn, 7 sản phẩm, 1 bài, Phần mở đầu trang, Thông tin site. File này đang có thay đổi riêng của người dùng: **sửa nhưng không commit**, nhắc người dùng commit.
- Trang hướng dẫn admin (`/admin/huong-dan`) không bắt buộc đổi. Nếu đổi lời thì chụp lại ảnh theo CLAUDE.md.

### Kiểm tra

- Test int, chạy trên DB trắng:
  - Sau lệnh nhập: đúng số bản ghi (5 nguồn, 7 mốc, 7 công đoạn, 7 sản phẩm, 1 bài). Ngoài nguồn, tất cả đều là nháp. Không có quan hệ ảnh nào. Truy vấn công khai không trả về mục nào mới.
  - Chạy lần hai không tạo gì.
  - Bản ghi đã sửa không bị ghi đè.
  - Global chỉ điền trường trống.
  - Người duyệt đăng được ít nhất một mục mỗi loại (mốc, công đoạn, sản phẩm, bài, hai global). Sau khi đăng, mục đó hiện trong truy vấn công khai.
- Test seed hiện có vẫn qua (seed dev không đổi).
- Chạy thử thật như lần 2026-10-31: DB `chieuhoi_demo` trắng, `next dev` công khai ở cổng 3001, người duyệt đăng trong admin, chụp 1440 và 390 các trang `/`, `/lang-hoi`, `/nghe-det-chieu`, `/san-pham`, `/cau-chuyen`. Ảnh không commit.
- `lint`, `tsc`, `build`, `test:unit`, `test:int` qua.

### Điều không được để xảy ra

- Bất kỳ ảnh tham khảo hay quan hệ tới `archive-assets` nào lọt vào DB qua lệnh nhập.
- Lệnh nhập đăng bất cứ thứ gì, hoặc ghi đè chữ admin đã sửa.
- Seed dev đổi hành vi.

---

## B. Nghiên cứu thêm dữ kiện

### Mục tiêu

Bổ sung chữ cho bốn mảng người dùng muốn: lịch sử văn hoá, cách làm, sản phẩm, con người. Ưu tiên lấp các chỗ đang `[cần xác minh]` và các ô "cần ghi lại" (`craftCopy.toRecord`) của công đoạn.

### Sản phẩm

Một tài liệu Claude Doc tiếng Việt (giống báo cáo nghiên cứu lần trước), gồm:

1. **Dữ kiện mới:** mỗi dòng có câu dữ kiện, nguồn (tên, đơn vị đăng, ngày, link), mức tin cậy (`press` / `oral` / `pending` theo cách trang đang dùng), chỗ nó sẽ vào (trang, mục, trường CMS).
2. **Chỗ các nguồn lệch nhau:** ghi cả hai phía, không tự chọn.
3. **Lấp chỗ trống hiện có:** với từng `[cần xác minh]` và ô "cần ghi lại", ghi đã tìm được gì, hay chưa.
4. **Danh sách ảnh cần chụp** cho người làng: theo đúng các ô ảnh trên trang (từng công đoạn, từng loại chiếu, đền thờ tổ nghề, khung dệt tay và máy, sinh hoạt làng), kèm nhắc xin phép người trong ảnh.
5. **Danh sách câu hỏi cho người làng:** những gì báo chí không trả lời được.

### Quy tắc

- Không bịa sự kiện, ngày tháng, tên người, lời trích, ý nghĩa hoa văn. Chỉ ghi điều nguồn nói; ghi rõ nguồn nào nói.
- Lời kể trên báo ghi là "theo lời kể", mức `oral`.
- Tên người thật chỉ ghi khi đã xuất hiện công khai trên báo, và đánh dấu "chưa xin đồng ý": web chỉ hiện khi người đó đồng ý.
- Ảnh tìm thấy trên mạng chỉ ghi lại (của ai, ở đâu, cần xin ai), không tải về, không đưa vào repo.

### Sau khi người dùng đọc

Dữ kiện được đồng ý mới vào dữ liệu seed và lệnh nhập (dạng nháp, người duyệt đăng). Đó là một thay đổi riêng, nhỏ, làm sau khi có danh sách đồng ý. Không thuộc phạm vi viết code của tài liệu này.

---

## Ràng buộc chung

- Kiến trúc và component dùng chung theo CLAUDE.md. Đợt này không dự kiến đổi giao diện.
- Làm tiếp trên nhánh `du-lieu-trang-cms` (chưa merge). *(Quyết định của Claude.)*
- `test:int` và `guide:seed` không chạy song song.

## Để builder tự quyết

- Cấu trúc code chung giữa seed và lệnh nhập.
- Cách bỏ hình chèn khỏi thân bài (bỏ ở bước chuyển markdown hay bỏ node sau khi chuyển).
- Định dạng báo cáo của lệnh, miễn đọc được bằng tiếng Việt.
