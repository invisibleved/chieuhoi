# Chiếu Hới — Thiết kế triển khai web app (website công khai + admin Payload)

Ngày: 26/10/2026 · Trạng thái: chờ người dùng duyệt

Tài liệu này bổ sung cho gói bàn giao (`CLAUDE.md`, `docs/HANDOFF.md`, `docs/KICKOFF_PROMPT.md`). Phần giao diện, token, component, đặc tả tương tác, mô hình nội dung và checklist a11y **giữ nguyên như HANDOFF**. Tài liệu này chỉ chốt những gì gói bàn giao còn để ngỏ hoặc đã thay đổi: có admin, dùng CMS nào, ai được làm gì, dữ liệu đi ra trang công khai thế nào, và chạy ở đâu.

Mục ghi *(quyết định của Claude)* là lựa chọn mình tự đưa ra, người dùng chưa xác nhận. Có thể đổi được.

## 1. Mục đích

Website di sản số cho nghề dệt chiếu làng Hới. Thiết kế đã hoàn tất. Việc còn lại là dựng web đúng thiết kế, cộng thêm một trang quản trị để 2–3 người cập nhật nội dung lâu dài mà không cần dev.

Điểm khác của dự án này: phần lớn nội dung hiện **chưa đủ điều kiện công khai** (chưa xác minh, chưa có quyền dùng ảnh, nhân vật chưa ký đồng ý). Vì vậy hệ thống phải bảo đảm, ở tầng dữ liệu chứ không chỉ ở giao diện, rằng chỉ những gì đã duyệt và đủ điều kiện mới ra trang công khai.

## 2. Mục tiêu / Ngoài phạm vi / Thất bại

**Mục tiêu**
- 11 route theo HANDOFF, desktop và mobile, đúng ảnh chụp trong `design/screens/`.
- Admin Payload tại `/admin` với hai vai trò (biên tập viên, người duyệt) và quy trình nháp → duyệt → đăng.
- Nội dung đăng xong hiện lên trang công khai ngay, không cần build lại.
- Người duyệt xem trước được bản "preview" (có nhãn `[cần xác minh]`) trước khi đăng.

**Ngoài phạm vi (đợt này)**
- Đăng nhập cho người xem, giỏ hàng, thanh toán.
- Nhận đóng góp thật qua form "Kết nối". Form vẫn chỉ là minh hoạ, giữ dòng "minh hoạ", không có backend.
- Bản tiếng Anh (`/en/...`). Nút EN để ở trạng thái vô hiệu.
- Tự viết admin. Dùng giao diện có sẵn của Payload, chỉ cấu hình.

**Coi là thất bại dù code chạy được**
- Một bản ghi chưa duyệt, ảnh có `rights ≠ permitted`, hoặc tên/ảnh/lời trích của người chưa đồng ý lọt ra trang công khai, kể cả qua API, sitemap, thẻ OG hay ảnh tối ưu của `next/image`.
- Biên tập viên tự đăng được, hoặc tự bật consent/rights được.
- Giao diện lệch rõ so với ảnh chụp, hoặc nội dung bị "điền cho đủ" bằng dữ kiện bịa.

## 3. Ràng buộc

- Mọi quy tắc trong `CLAUDE.md` (nội dung, giao diện, a11y) vẫn áp dụng.
- Riêng mục "Stack" và "KHÔNG làm… backend" trong `CLAUDE.md` được thay bằng tài liệu này: dự án **có** backend, nhưng chỉ phục vụ admin và nội dung.
- Khi bắt đầu Phase 1, cập nhật `CLAUDE.md` cho khớp tài liệu này.
- Mục tiêu hiệu năng và a11y giữ nguyên HANDOFF: Android tầm trung, 4G; WCAG 2.2 AA; Lighthouse Accessibility ≥ 95; CLS < 0.1.

## 4. Kiến trúc (đã chốt với người dùng)

- **Một app duy nhất:** Next.js (App Router) + TypeScript strict + Tailwind, có **Payload CMS (bản 3.x) nhúng trong cùng app**. Website công khai và `/admin` dùng chung codebase và cùng lần deploy.
- **Database:** Postgres, dùng adapter Postgres của Payload.
- Dùng phiên bản ổn định hiện hành của Next/Payload/Tailwind. Kiểm tra lại tài liệu API thay vì đoán.

### Hạ tầng
- Người dùng chốt: dự án **phi lợi nhuận, ưu tiên chi phí thấp nhất**.
- Vì vậy dùng gói miễn phí: Vercel Hobby (cho phép dự án phi thương mại), Postgres trên Neon (gói free), ảnh trên Cloudflare R2 (gói free), qua storage adapter tương thích S3 của Payload. *(Chọn nhà cung cấp cụ thể là quyết định của Claude.)*
- Phải giữ trong giới hạn gói free:
  - Ảnh tối ưu bằng `next/image` có giới hạn số lượt biến đổi trên Vercel Hobby. Builder kiểm tra hạn mức hiện hành và chọn cách phù hợp, ví dụ tạo sẵn các cỡ ảnh khi upload qua Payload `imageSizes` thay vì tối ưu khi người xem tải trang.
  - Neon free có thể "ngủ" khi không dùng. Trang công khai được cache nên ít bị ảnh hưởng.
- Tài khoản và tên miền chưa có. Staging dùng tên miền con `*.vercel.app`. Tên miền thật tính khi ra mắt.
- Giữ khả năng chuyển sang VPS: không dùng tính năng chỉ Vercel mới có. App phải chạy được bằng `next start` với biến môi trường cho DB và S3.
- Dev local: Postgres qua Docker Compose. Có `.env.example`.
- **Môi trường** *(quyết định của Claude)*:
  - Phase 7 dựng một môi trường **staging** để người dùng và các bên liên quan xem. Staging có DB và bucket riêng, được nạp ảnh tham khảo, có mật khẩu và `noindex`.
  - **Production** (tên miền thật) chỉ dựng khi danh sách "Cần xác minh trước khi ra mắt" đã xong. Production không bao giờ chạy script seed ảnh tham khảo. Script seed phải từ chối chạy khi biến môi trường cho biết đang ở production.

## 5. Vai trò và quyền

Collection `Users`, chỉ dùng cho admin. Chỉ người duyệt tạo được tài khoản mới. Không có đăng ký công khai.

| Hành động | Biên tập viên (`editor`) | Người duyệt (`reviewer`) |
| --- | --- | --- |
| Tạo, sửa nội dung, lưu nháp | ✓ | ✓ |
| Chuyển trạng thái sang "chờ duyệt" | ✓ | ✓ |
| Đăng, gỡ đăng, xoá | ✗ | ✓ |
| Sửa trường kiểm soát | ✗ (chỉ xem) | ✓ |
| Quản lý tài khoản | ✗ | ✓ |

**Trường kiểm soát** (chỉ người duyệt sửa được, áp bằng field-level access của Payload):
- Person: `consent.name`, `consent.photo`, `consent.quote`, `reviewedBySubject`
- ArchiveAsset: `rights`, `subjectConsent`
- TimelineEvent: `confidence`
- Product: `typeConfirmed`
- CraftStep: `verifiedBy`
- Maker: `verified`, `publicConsent`

Quyền phải được kiểm tra **trên server** (access control của Payload), không chỉ ẩn nút trên giao diện admin.

Giao diện admin dùng tiếng Việt (Payload hỗ trợ sẵn). Nhãn trường viết bằng tiếng Việt.

## 6. Mô hình nội dung

Theo đúng bảng "Mô hình nội dung cho CMS" trong HANDOFF, một collection cho mỗi kiểu: Story, Person, CraftStep, TimelineEvent, Product, ArchiveAsset, Maker, SourceRef. Không tạo collection `Contribution` trong đợt này. Các điểm cần chốt:

- **Ảnh = ArchiveAsset.** Mọi ảnh dùng trên site (bìa bài, chân dung, ảnh công đoạn, ảnh sản phẩm) đều là bản ghi ArchiveAsset kèm `rights` và metadata. ArchiveAsset là upload collection của Payload. *(Quyết định của Claude.)* Như vậy quy tắc quyền ảnh chỉ cần kiểm ở một chỗ.
- **Thư viện `/thu-vien`** chỉ hiện các ArchiveAsset bật cờ `inArchive`. Asset có cờ này bắt buộc có mã TL, nhóm và thời kỳ. Ảnh bìa, chân dung, ảnh sản phẩm không tự vào thư viện. Seed thư viện lấy mã TL, tiêu đề và nhóm từ `ArchivePage.dc.html`, vì không có file seed riêng. *(Quyết định của Claude.)*
- **Consent của Person** là ba cờ boolean riêng (tên, ảnh, lời trích), như trong seed. Không dùng một trường none/partial/full. *(Quyết định của Claude. HANDOFF nêu cả hai cách, seed dùng cờ riêng nên chọn theo seed.)*
- **Trạng thái biên tập:** mỗi collection nội dung dùng drafts/versions của Payload cho việc đăng (`_status`). Thêm trường `workflow`: `idea` / `draft` / `in_review` / `published`, để biên tập viên báo "chờ duyệt" và để giao diện hiện nhãn (Bản nháp, Chủ đề đề xuất). Builder tự chọn cách đồng bộ hai trường này, miễn đúng bảng quyền ở mục 5.
- **Story `idea`** được hiện trên trang công khai dưới dạng thẻ "Chủ đề đề xuất", **không có trang chi tiết** (đúng quy tắc HANDOFF). Muốn vậy, bản ghi `idea` cần được người duyệt "đăng" ở dạng thẻ. *(Quyết định của Claude.)*
- **Rich text** của Story có tham chiếu tới SourceRef, để render chú thích số (SourceNote).
- **Toạ độ điểm** (`focus` của CraftStep, `annotations[].x/y` của Product) lưu dưới dạng phần trăm 0–100.
- **Mốc thời gian** là chuỗi tự do ("1457", "Thời Lê", "[?]"), sắp xếp theo trường `order` riêng.
- **Nội dung trang sửa được trong admin.** Người dùng chọn phương án kết hợp: chỉ một phần chữ cố định sửa được trong admin, phần còn lại viết cứng nguyên văn theo artboard. Dùng Payload Globals:
  - `SiteSettings`: email, số điện thoại, địa chỉ, thông tin tham quan làng, nội dung chân trang. Các giá trị này còn nằm trong danh sách "cần xác minh" của HANDOFF.
  - `PageIntros`: phần mở đầu của từng trang (eyebrow, tiêu đề, sapo), gồm cả hero trang chủ. Builder chọn cấu trúc: một Global có nhóm theo route, hoặc mỗi trang một Global.
  - Mọi chữ khác (tiêu đề section, nhãn, nút, đoạn so sánh thủ công/máy…) viết cứng nguyên văn theo artboard. *(Ranh giới cụ thể là quyết định của Claude.)*
  - Globals đi theo cùng quy tắc như collection: có nháp và đăng, chỉ người duyệt được đăng, tuân theo quy tắc `[cần xác minh]` và trường trống ở mục 7. Giá trị khởi đầu lấy nguyên văn từ artboard.
- **Bản địa hoá:** bật localization của Payload với một locale `vi` ngay từ đầu, để thêm `en` sau không phải chuyển đổi dữ liệu. *(Quyết định của Claude.)*

## 7. Dữ liệu đi ra trang công khai

Toàn bộ trang công khai đọc dữ liệu qua **một lớp duy nhất** (`lib/content`) dùng Local API của Payload. Component không gọi Payload trực tiếp.

Lớp này nhận chế độ `public` hoặc `preview` và áp quy tắc:

| Quy tắc | `public` | `preview` |
| --- | --- | --- |
| Bản ghi chưa đăng | loại bỏ | hiện, kèm nhãn trạng thái |
| ArchiveAsset `rights ≠ permitted` | loại bỏ. Chỗ dùng ảnh hiện khung "Ảnh cần chụp" hoặc ẩn, theo thiết kế | hiện, kèm nhãn |
| Person thiếu consent tên/ảnh/lời trích | ẩn đúng phần đó, hiện nhãn "Chờ đồng ý" | như public, kèm ghi chú phần bị ẩn |
| Lời trích không có `quoteSourceId` | ẩn | hiện kèm `[cần xác minh]` |
| Trường trống | ẩn | hiện `[cần xác minh]` |
| Maker chưa `publicConsent` | ẩn liên hệ và liên kết từ Product | hiện kèm nhãn |

- Quy tắc lọc phải nằm ở **truy vấn và lớp dữ liệu**, không chỉ ở JSX. Như vậy dữ liệu bị loại không bao giờ có mặt trong HTML/RSC payload gửi về trình duyệt.
- **File ảnh:** ảnh `rights ≠ permitted` không được truy cập công khai qua URL file. Access `read` của ArchiveAsset kiểm tra `rights`, và người chưa đăng nhập không đọc được.
- REST/GraphQL API của Payload: người chưa đăng nhập chỉ đọc được đúng những gì trang công khai được hiện. Hoặc tắt API công khai nếu không cần. Builder tự chọn.
- **Preview** dùng Draft Mode của Next.js, chỉ bật cho người đã đăng nhập admin. Trong admin có nút "Xem trước" trên từng bản ghi.
- **Cập nhật:** trang công khai render tĩnh hoặc cache. Hook `afterChange`/`afterDelete` của Payload gọi `revalidatePath`/`revalidateTag` cho các trang liên quan. Không cần webhook vì cùng app.
- **Dấu `[cần xác minh]` nằm trong câu chữ** (seed và artboard có nhiều chỗ, ví dụ "Cách may và tên gọi: [cần xác minh]"): trường nào chứa dấu này được coi là chưa xác minh. Chế độ `public` ẩn cả trường, chế độ `preview` hiện nguyên văn. Không cắt dấu ra khỏi câu. *(Quyết định của Claude.)*
- Bộ test tự động cho các quy tắc ở bảng trên là **bắt buộc**. Đây là phần rủi ro cao nhất của dự án.

## 8. Dữ liệu khởi đầu

- Viết script seed, nạp `content/seed/*.json` và ảnh trong `design/reference-images/` vào Payload.
- Mọi ảnh tham khảo nạp với `rights = unknown`. Mọi consent nạp là `false`.
- Nội dung bài nháp "Chuyện về Trạng Chiếu" lấy nguyên văn từ `design/source/StoryDetail.dc.html`.
- Tạo sẵn một tài khoản người duyệt từ biến môi trường.
- Hệ quả đã biết và chấp nhận: lúc mới dựng, chế độ `public` sẽ gần như không có ảnh và nhiều chỗ trống. Phải xem bằng `preview` mới thấy giống ảnh chụp thiết kế. Việc này đúng với quy tắc. Ra mắt công khai bị chặn bởi danh sách "Cần xác minh trước khi ra mắt" trong HANDOFF, không bị chặn bởi code.
- Ảnh tham khảo không được đưa lên storage production. Seed ảnh chỉ chạy ở môi trường dev/preview.

## 9. Lộ trình (thay cho phase trong KICKOFF_PROMPT)

Hết mỗi phase thì dừng lại để người dùng xem, kèm ảnh chụp so sánh 1440/390.

1. **Nền móng:** Next + Payload + Postgres (Docker), token, font, `CLAUDE.md` cập nhật, các collection + Users + bảng quyền, lớp `lib/content` có chế độ public/preview kèm test quy tắc, script seed, layout chung (SiteHeader, MobileMenu, SiteFooter, Breadcrumb).
2. **Component** + trang `/styleguide` nội bộ (đúng Phase 2 của KICKOFF).
3. **Trang chủ.**
4. **`/nghe-det-chieu` và `/lang-hoi`** (CraftJourney, Timeline).
5. **Các trang còn lại:** câu chuyện, con người, sản phẩm (PatternExplorer), thư viện (lightbox, `?anh=`), kết nối (form minh hoạ).
6. **Admin hoàn thiện:** nhãn tiếng Việt, xem trước, revalidate, kiểm thử quy trình hai vai trò từ đầu đến cuối.
7. **Deploy staging và kiểm tra:** dựng staging trên Vercel/Neon/R2 (có mật khẩu, `noindex`), axe/Lighthouse, bàn phím, giảm chuyển động, so ảnh chụp, liệt kê điểm lệch.

## 10. Để builder tự quyết

Cấu trúc thư mục, tên file, cách tổ chức component, chọn thư viện test (unit và Playwright), cách đồng bộ `workflow` với `_status`, chi tiết cache/revalidate, bật hay tắt REST/GraphQL công khai, cách dựng bố cục tablet 768 (theo lưới 8 cột trong token).
