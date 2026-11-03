# Chuyển "Phần mở đầu trang" thành collection `pages`

Ngày: 2026-11-03. Trạng thái: bản thiết kế chờ duyệt.
Bối cảnh đánh giá: https://claude.ai/artifact/K46HrADSp5omzEzUw3pG7L (sơ đồ DB và so sánh bốn cách).

## 1. Vì sao làm

Global `page-intros` (`src/globals/PageIntros.ts`) là **một bản ghi** chứa 8 nhóm đặt tên cứng theo trang (`home`, `lang-hoi`, …). Sau nhánh `du-lieu-trang-cms`, nó còn chứa toàn bộ dữ kiện của Làng Hới và Nghề dệt chiếu. Có ba hậu quả:

1. **Một nút Đăng cho cả 8 trang.** Ai đó đang sửa dở trang A, người duyệt đăng trang B, thì phần dở dang của trang A cũng lên web. Điều này trái nguyên tắc "đọc rồi mới đăng", và sẽ xảy ra thật khi người làng cùng nhập dữ kiện phần B.
2. **Cùng một cấu trúc bị lặp theo từng trang.** Payload sinh một bộ cột hoặc một bộ bảng cho mỗi nhóm. Ví dụ "ảnh của trang" lặp 5 bộ bảng (20 bảng), eyebrow/tiêu đề/đoạn dẫn lặp thành 44 cột. 56 trên 113 bảng của DB phục vụ riêng global này.
3. **Lịch sử sửa gộp chung.** Một chuỗi phiên bản cho cả 8 trang, khó biết ai đổi gì ở trang nào.

Cùng đợt này sửa ba lỗi khác mà bài đánh giá đã tìm thấy:

4. **Xoá một Nguồn thì chú thích biến mất mà không báo.** Collection Nguồn không có bước chặn xoá. Chú thích bị mất theo một trong ba cách:
   - Trường nhiều nguồn: khoá `*_rels_sources_fk` là `ON DELETE CASCADE`, hàng chú thích bị xoá theo.
   - Trường một nguồn (`products.annotations.source`, `people.quoteSource`): khoá là `ON DELETE SET NULL`, ô nguồn thành trống.
   - Chú thích nằm trong văn bản (khối `cite` trong `stories.body` và `people.story`): còn khối nhưng trỏ tới nguồn không còn tồn tại.

   Dòng dữ kiện mất hết nguồn vẫn hiện ở bản public, nên lên web không có chú thích.
5. **Hai danh sách nguồn phải tự giữ khớp.** Nguồn của từng câu và "Nguồn tham khảo của trang" (`pageSources`, quyết định số [1] [2]…) không được kiểm với nhau. Câu trích nguồn ngoài danh sách bị coi là nguồn ẩn và lặng lẽ biến mất khỏi bản public.
6. **Ảnh dụng cụ ghép với tên theo vị trí dòng.** Tên ở mảng `tools`, ảnh ở ô `tool-1..3` của mảng `media`. Đổi thứ tự dòng thì ảnh lệch tên.

## 2. Mục tiêu

- Mỗi trang là **một tài liệu riêng**, có bản nháp, nút Đăng và lịch sử riêng. Đăng trang A không đổi gì ở trang B.
- Mỗi cấu trúc chỉ khai báo một lần và dùng chung một bộ bảng cho mọi trang.
- Không thể xoá một Nguồn khi nó còn đang được trích ở bất kỳ đâu. Admin báo rõ nó đang được trích ở đâu.
- Không thể đăng một trang khi có câu trích nguồn chưa có trong "Nguồn tham khảo của trang".
- Ảnh dụng cụ nằm ngay trong dòng dụng cụ.
- **Trang public trông y hệt trước khi chuyển**: cùng chữ, cùng ảnh, cùng số chú thích.

## 3. Không làm

- Không đổi giao diện hay copy công khai. Không thêm trang mới.
- Không dùng trường khối (`blocks`). Bố cục trang do artboard cố định; biên tập viên không được thêm, bớt hay đảo phần.
- Không đổi `site-settings`: nó vẫn là global, vì đúng là một bản ghi cho cả site.
- Không đổi các collection nội dung khác (dòng thời gian, công đoạn, sản phẩm, bài viết, con người).
- Không làm tiếng Anh. Vẫn giữ `localized: true` như hiện nay.

## 4. Điều không được xảy ra

- Mất dữ liệu đã nhập hoặc đã đăng trên prod.
- Người duyệt phải nhập lại nội dung bằng tay.
- Biên tập viên tạo được trang thứ 9, tạo trang trùng, hay xoá một trang.
- Một ô chỉ thuộc trang này (ví dụ dữ kiện nhanh của Làng Hới) lưu được dữ liệu ở trang khác.
- Trong lúc chuyển, web công khai mất nội dung đang hiện.

## 5. Ràng buộc (giữ nguyên từ CLAUDE.md)

- Kiến trúc một chiều: `app` → `components` → `lib/content` → Payload. Chỉ `lib/content` gọi Payload; component chỉ nhận view model.
- Đổi schema thì tạo migration bằng `npm run migrate:create <tên>` và commit `src/migrations`. Chỉ dev mới `push`.
- Postgres giới hạn tên bảng, cột, ràng buộc ở 63 ký tự. Đặt `dbName` ngắn khi cần.
- Admin giữ giao diện gốc của Payload. Đổi admin hoặc lời hướng dẫn thì chụp lại ảnh (`guide:seed && guide:shots`).
- `test:int` và `guide:seed` không chạy song song.
- Không bịa nội dung. Bước chuyển chỉ chép dữ liệu, không tạo chữ mới.

## 6. Thiết kế đã chốt

### 6.1 Collection `pages`

- Slug collection: `pages`. Nhãn admin: "Trang" (số nhiều "Các trang"), nằm cùng nhóm menu với `site-settings`.
- Trường `slug`: kiểu `select` với đúng 8 giá trị `ROUTE_KEYS` hiện có, nhãn theo `ROUTE_LABELS`. Có `unique: true`, bắt buộc, chỉ đọc sau khi tạo. Dùng `select` thay cho chữ tự do để không gõ sai được.
- Tiêu đề hàng trong danh sách admin: nhãn của trang ("Làng Hới"…).
- **Quyền:**
  - `create: () => false` và `delete: () => false` cho mọi người dùng admin.
  - Chỉ code chạy với `overrideAccess` mới tạo được trang: migration, `seed`, `import:content`.
  - `read` và `update`: `isLoggedIn`, như global hiện tại.
- **Bản nháp:** `versions: { drafts: true }`, cùng các hook `recordDraftArg`, `guardPublish` và `revalidateAfterChange`. Mỗi trang có một chuỗi phiên bản riêng.
- **Trường chung cho mọi trang:** `eyebrow`, `title`, `lead`, giữ nguyên kiểu, nhãn và `localized` như trong `routeGroup`.
- **Trường riêng từng trang:**

  | Trang | Trường |
  |---|---|
  | `home` | `heroTitle`, `heroImage`, `heroInset`, `heroCaption`, `villageImages` |
  | trang có trong `PAGE_MEDIA_SLOTS` | `media`; danh sách ô ảnh hợp lệ lấy theo `slug` |
  | `lang-hoi` | `villageFactsFields()` |
  | `nghe-det-chieu` | `craftFactsFields()` |

  - Trong admin, mỗi trường chỉ hiện ở đúng trang của nó (`admin.condition` theo `slug`).
  - Phía server, một hook `beforeChange` xoá giá trị của các trường không thuộc trang đang lưu, để dữ liệu lạc chỗ không bao giờ được ghi.
- **Ô ảnh:** `validate` của `media` chỉ nhận các ô thuộc `PAGE_MEDIA_SLOTS[slug]`, và mỗi ô chỉ dùng một lần (giữ quy tắc hiện có).
- **Dụng cụ (vấn đề 6):**
  - Mỗi dòng `tools` có thêm trường `image` (upload tới `archive-assets`).
  - `pages` dùng một danh sách ô ảnh **mới, riêng**, không có `tool-1..3`.
  - `PAGE_MEDIA_SLOTS` của global giữ nguyên cho tới đợt 2b. Nếu bỏ sớm, enum trong Postgres bị thu hẹp trong khi prod còn hàng `tool-n`, và global vỡ.
  - Từ đợt 2a, `lib/content` lấy ảnh dụng cụ từ chính dòng đó, không ghép theo số thứ tự nữa.
- **Kiểm nguồn của trang (vấn đề 5):**
  - Khi lưu bản sẽ đăng, mọi nguồn mà một câu, một dòng dữ kiện, một dụng cụ hay một hàng so sánh trích phải có trong `pageSources` của trang đó.
  - Nếu sai, báo lỗi bằng tiếng Việt, nêu tên mục và tên nguồn còn thiếu.
  - Lưu nháp không bị chặn, để biên tập viên lưu giữa chừng được.
  - Đặt kiểm này ở `validate` của `pageSources`; Payload bỏ qua `validate` khi lưu nháp.
- **Dùng lại các hàm tạo trường trong `src/globals/pageFacts.ts`, nhưng thêm tham số tiền tố `dbName`:**
  - Các hàm này đang đặt `dbName` cố định (`lh_founder_paras`, `lh_founder_sents`, `lh_heritage_sents`, `ndc_compare`).
  - Adapter Postgres dùng `dbName` y như viết, không thêm tiền tố của bảng cha.
  - Ở đợt 1 global còn tồn tại, nên `pages` phải có tên khác, ví dụ `pg_lh_founder_paras`.
  - Global gọi hàm với tiền tố cũ, `pages` gọi với tiền tố mới.
  - Đợt 2b chỉ xoá các bảng cũ.

### 6.2 Chặn xoá Nguồn (vấn đề 4)

- Thêm hook `beforeDelete` cho collection `sources`.
- Hook tìm mọi chỗ đang trích nguồn đó, ở cả bản đã đăng lẫn bản nháp mới nhất:
  - Trường nhiều nguồn: `pages` (và global `page-intros` khi nó còn), `timeline-events`, `stories`.
  - Trường một nguồn: `products.annotations.source`, `people.quoteSource`.
  - Khối `cite` trong văn bản `stories.body` và `people.story`. Khối này không có hàng `_rels`, nên không truy vấn `where` được, phải đọc nội dung văn bản để tìm.
- Nếu còn chỗ trích, từ chối xoá với lời báo tiếng Việt, liệt kê các chỗ đang trích (tên collection và tiêu đề hoặc nhãn của mục).
- **Bỏ qua chặn** khi `req.context.skipSourceRefGuard` là true, giống cách `skipLastReviewerGuard` đang làm. `resetDb` (`tests/int/helpers.ts`) và `wipe` (`src/seed/guide.ts`) đặt cờ này, vì chúng xoá sạch mọi collection.
- Chỉ kiểm bản đã đăng và bản nháp mới nhất. Phiên bản cũ hơn trích nguồn đó vẫn mất chú thích khi nguồn bị xoá. Đây là giới hạn được chấp nhận và sẽ ghi trong hướng dẫn: khôi phục một phiên bản cũ thì phải xem lại chú thích.
- Không đổi khoá ngoại trong DB. Chặn ở tầng Payload là đủ, vì mọi thao tác xoá đều đi qua admin hoặc API của Payload.
- Việc này độc lập với collection `pages`, nên làm đầu tiên.

### 6.3 Đọc dữ liệu (`lib/content`)

- `getPageIntro(route, mode)`, `getHomeMedia`, `getPageMedia` và các hàm trong `pages.ts` đọc **một tài liệu** `pages` theo `slug`, thay cho đọc cả global.
- Quy tắc bản public giữ như cũ:
  - Bản public chỉ đọc trang đã đăng.
  - Trang chưa đăng thì coi như trống, đúng như `readGlobalDoc` đang làm với global chưa đăng.
- `readGlobalDoc` chỉ còn phục vụ `site-settings`.
- Các hàm ánh xạ trong `src/lib/content/pageFacts.ts` (`villageFactsFrom`, `craftFactsFrom`…) nhận thẳng tài liệu trang, thay cho `intros[route]`.
- View model (`*View`) không đổi, nên component không phải sửa.

### 6.4 Xem trước

`previewPathFor('pages', doc)` trả đường dẫn đúng của trang theo `slug`:

| `slug` | Đường dẫn |
|---|---|
| `home` | `/` |
| `lang-hoi` | `/lang-hoi` |
| các trang khác | tương tự |

Đây là cải thiện so với hiện tại, vì global luôn mở `/`. `PreviewCollection` bỏ `'page-intros'` và thêm `'pages'`.

### 6.5 Nhập liệu

- `seed`, `import:content` và `import:page-facts`:
  - Tạo đủ 8 trang nếu thiếu.
  - Điền nhóm còn trống như hiện nay, rồi lưu bản nháp **theo từng trang**.
  - Báo cáo in theo trang.
- `import:content` vẫn không tạo lại mục đã có, và vẫn chỉ tạo bản nháp.
- Đợt 1 giữ nguyên ba lệnh này, vẫn ghi vào global. Từ đợt 2a chúng ghi vào `pages`.
- `wipe` (`src/seed/guide.ts`) và `resetDb` (`tests/int/helpers.ts`) xoá mọi collection, và từ nay xoá cả `pages`. Global thì không bị xoá như vậy. Vì thế `guide:seed`, `seed` và các test int dựa vào phần mở đầu trang phải tự tạo lại 8 trang sau khi xoá.

### 6.6 Chuyển dữ liệu trên prod: ba đợt deploy

Hai lý do khiến không làm được trong một lần:
- Migration Payload không đọc được global cũ bằng API sau khi schema đã bỏ nó. Chuyển nhiều đợt thì dùng được API của Payload, không phải chép từng bảng bằng SQL.
- Trên Vercel, `npm run ci` chạy migration **trong lúc build**, khi bản cũ vẫn đang phục vụ người xem. Nếu migration xoá bảng cũ chạy cùng đợt với code đổi chỗ đọc, bản cũ đang chạy sẽ mất dữ liệu trong lúc build. Nếu build hỏng, web mất dữ liệu luôn. Vì vậy việc đổi chỗ đọc và việc xoá bảng phải nằm ở hai đợt khác nhau.

**Đợt 1: thêm `pages`, chép dữ liệu**
- Thêm collection `pages` và migration tạo bảng mới. Global `page-intros` vẫn còn, và trang công khai vẫn đọc từ global.
- Trong đợt này `pages` **ẩn khỏi menu admin** (`admin.hidden`) và người dùng admin không sửa được (`update: () => false`). Nhờ vậy không ai sửa nhầm chỗ chưa lên web.
- Thêm lệnh `npm run migrate:pages`, chạy như `import:content` bằng `.env.prod.local`. Với từng trang trong 8 trang, lệnh làm:
  - Nếu global đang có **bản đã đăng**: tạo trang `pages` với đúng phần của trang đó và đặt trạng thái đã đăng.
  - Nếu bản nháp mới nhất của global **có phần của trang này khác bản đã đăng**: lưu thêm phần đó thành bản nháp của trang. Khi so khác, bỏ qua `id` của các dòng. Trang không đổi thì không có nháp.
  - Global chưa từng đăng thì mọi trang được tạo dưới dạng bản nháp.
  - Chép ảnh dụng cụ từ ô `tool-n` vào dòng dụng cụ thứ n.
  - Bỏ qua kiểm nguồn của trang (mục 6.1) bằng cờ `req.context`. Dữ liệu được chép nguyên như đang có, kể cả khi lệch quy tắc. Những câu trích nguồn ngoài `pageSources` được **liệt kê trong báo cáo**, để người duyệt sửa sau. Bản public vẫn y hệt trước khi chuyển.
  - Không ghi đè trang đã tồn tại. Chạy lại lệnh thì bỏ qua trang đã có. Thêm cờ `--replace` để xoá và chép lại cả 8 trang khi cần.
  - In báo cáo theo trang: trang nào được tạo, đã đăng hay nháp, mỗi trang có bao nhiêu dòng và bao nhiêu chú thích, cộng các chỗ lệch nguồn.
- Lệnh có chế độ `--check`: so dữ liệu từng trang giữa global và `pages` và báo khác biệt. Không ghi gì.

**Đợt 2a: đổi chỗ đọc, gỡ global khỏi code**
- `lib/content` chuyển sang đọc `pages`, và hiện `pages` trong admin với quyền như mục 6.1.
- Gỡ hẳn global `page-intros` khỏi config, cùng mọi code đọc nó lúc chạy: `PAGE_MEDIA_SLOTS` cũ, phần quét global trong hook chặn xoá Nguồn, lệnh `migrate:pages`.
- **Đợt này không tạo migration.** Bảng cũ vẫn nằm trong DB nhưng không còn code nào đọc. Nhờ vậy, khi đợt 2b xoá bảng, code đang chạy không đụng tới bảng bị xoá.
- Trước khi deploy đợt này, chạy `migrate:pages --check` bằng code đợt 1. Không báo khác biệt mới deploy.

**Đợt 2b: dọn bảng cũ**
- Deploy sau khi đợt 2a đã chạy ổn trên prod.
- Chỉ gồm migration xoá các bảng `page_intros*`, `_page_intros_v*` cùng các bảng `lh_*`, `_lh_*`, `ndc_*`, `_ndc_*` cũ, cộng enum của chúng. Snapshot migration (`src/migrations/*.json`) vẫn còn các bảng này, nên `migrate:create` sinh đúng lệnh xoá.
- Lịch sử phiên bản cũ của global không được chép sang; lịch sử mới bắt đầu từ lúc chuyển. Lịch sử cũ chỉ có vài ngày, toàn là bản nhập máy.

**Code nào chạy trên DB nào**

Vercel chạy migration của bản mới trong lúc bản cũ vẫn phục vụ người xem. Nếu build hỏng sau khi migration đã chạy, bản cũ tiếp tục chạy trên DB mới. Vì vậy mỗi cặp dưới đây đều phải chạy được:

| Lúc | Code đang chạy | DB | Vì sao chạy được |
|---|---|---|---|
| Build đợt 1 | main hiện tại | đã thêm bảng `pages*`, `pg_*` và cột `pages_id` trong `payload_locked_documents_rels` | Chỉ thêm. Code cũ không biết và không đụng tới bảng, cột mới |
| Build đợt 2a | đợt 1 | như đợt 1 | Đợt 2a không có migration |
| Build đợt 2b | đợt 2a | đã xoá bảng cũ | Code đợt 2a không còn đọc global |
| Quay từ 2a về 1 | đợt 1 | còn bảng cũ | Chạy được. Nhưng sửa đổi làm trong "Trang" sau khi lên 2a **không có** ở bản cũ, nên chỉ quay lại ngay sau khi lên 2a |
| Quay từ 2b về trước | đợt 2a | đã xoá bảng cũ | Code 2a chạy được. Quay về đợt 1 thì không được nữa nếu không khôi phục DB |

Test int và e2e dùng `push` (schema luôn khớp code), nên không kiểm được các cặp lệch này. Diễn tập (mục 7) phải chạy đúng các cặp lệch.

**Sao lưu:** trước khi push đợt 1 và đợt 2b (hai đợt có migration), tạo bản sao DB prod (branch hoặc điểm khôi phục của Neon) và ghi lại tên.

**Điểm push lên main:** mỗi đợt là một lần push riêng, theo thứ tự 1, rồi 2a, rồi 2b. Chỉ push đợt sau khi đợt trước đã chạy xong trên prod: với đợt 1 là đã chạy `migrate:pages` và `--check`, với đợt 2a là web đã kiểm ổn. Code của cả ba đợt có thể làm xong trước trên nhánh, nhưng phải tách commit theo đợt.

**Quy tắc trong lúc chuyển:** từ lúc chạy `migrate:pages` đến lúc đợt 2a lên, không ai sửa "Phần mở đầu trang". Nếu lỡ có người sửa, `--check` sẽ báo khác biệt; khi đó chạy `migrate:pages --replace` rồi kiểm lại.

Hướng dẫn chạy ba đợt ghi vào `docs/DEPLOY.md`, mục mới "Chuyển Phần mở đầu trang sang Trang". Việc ghi mục này đi theo quy tắc riêng về `docs/DEPLOY.md` ở mục 8.

### 6.7 Admin và hướng dẫn

- Menu admin đổi từ "Phần mở đầu trang" thành "Trang", mở ra danh sách 8 trang.
- Sửa lời trong `src/admin/guide/sections.ts`, `shots.ts` và các test nhãn, rồi chụp lại ảnh hướng dẫn.
- Mục hướng dẫn cho người duyệt thêm hai ý:
  - "Đăng trang nào chỉ đổi trang đó."
  - "Không xoá được nguồn đang được trích."

## 7. Cách biết là xong

- Toàn bộ e2e trang công khai (`public`, `a11y-public`, `chromium`) qua mà **không sửa kỳ vọng nào** về chữ, ảnh hay số chú thích. Test admin và hướng dẫn được phép đổi.
- Test int mới:
  - Đăng trang `lang-hoi` không đổi bản công khai của `nghe-det-chieu`, khi `nghe-det-chieu` đang có nháp chưa đăng.
  - Ở đợt 1, người dùng admin không sửa được `pages`.
  - Xoá sạch DB trong test (`resetDb`, `wipe`) vẫn chạy được khi có nguồn đang được trích.
  - Không tạo được trang thứ 9, không tạo được trang trùng `slug`, không xoá được trang (kể cả với người duyệt).
  - Lưu trang `home` kèm dữ kiện Làng Hới thì dữ kiện đó bị bỏ.
  - Xoá nguồn đang được trích bị từ chối, và lời báo nêu nơi trích. Xoá nguồn không ai trích thì được.
  - Đăng trang có câu trích nguồn ngoài `pageSources` bị từ chối. Lưu nháp thì được.
  - Đổi thứ tự dụng cụ thì ảnh đi theo đúng dụng cụ.
  - `migrate:pages`:
    - Từ một global có cả bản đã đăng và bản nháp, tạo đúng 8 trang và giữ đúng trạng thái từng trang. Trang không đổi trong nháp thì không có nháp.
    - Câu trích nguồn ngoài `pageSources` vẫn được chép và đăng, và có tên trong báo cáo.
    - Chạy lại thì không đổi gì.
    - `--check` không báo khác biệt.
- Diễn tập trên bản sao DB prod (hoặc `chieuhoi_staging`, theo mục 8 của `docs/DEPLOY.md`), làm đúng thứ tự:
  1. Chạy migration đợt 1, rồi chạy **code main hiện tại** trên DB đó: trang công khai không khác, admin vẫn sửa và đăng được "Phần mở đầu trang".
  2. Chạy code đợt 1, rồi `migrate:pages` và `--check`, không báo khác biệt.
  3. Chạy code đợt 2a: so ảnh chụp trang công khai trước và sau, không khác.
  4. Chạy migration đợt 2b, rồi để **code đợt 2a** chạy trên DB đó: trang công khai không khác, xoá một Nguồn (được và bị chặn) đều chạy đúng, các trang admin mở được.
  5. Chạy code đợt 2b. Trang công khai vẫn không khác.
- Số bảng của phần trang giảm từ 56 xuống khoảng 40.
- `lint`, `tsc`, `build`, unit, int, e2e đều qua.

## 8. Để người làm tự quyết

- Tên `dbName` cụ thể của các bảng mảng lồng, miễn dưới 63 ký tự và đọc hiểu được.
- Cách viết hook xoá trường lạc chỗ và hàm kiểm nguồn, miễn đặt ở `src/collections`, `src/access` hoặc `src/hooks` theo đúng kiến trúc.
- Cách `migrate:pages` đọc global cũ: API của Payload hoặc truy vấn trực tiếp, miễn có test.
- Chia commit và chia task trong kế hoạch.
- Có thêm trường `workflow` (Bản nháp / Chờ duyệt / Đã đăng) như các collection nội dung khác hay không. Gợi ý: thêm, để biên tập viên đánh dấu "Chờ duyệt" và người duyệt lọc được trong danh sách.
- **Về `docs/DEPLOY.md`:** người làm không tự commit file này. Nội dung mục mới đưa cho người dùng để họ tự ghi và tự commit.
