# Chiếu Hới — Phase 5a: Câu chuyện + Con người — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng bốn route `/cau-chuyen`, `/cau-chuyen/[slug]`, `/con-nguoi`, `/con-nguoi/[slug]`, desktop 1440 và mobile 390. Gồm:
- lọc theo chủ đề/nhóm, tìm kiếm, xem thêm, trạng thái trống;
- bài đọc dài có mục lục, tiến độ đọc, chú thích nguồn, chia sẻ;
- trang chân dung ẩn/hiện theo đồng ý, có khung trạng thái đồng ý.

**Phạm vi:** Phase 5 trong roadmap có 8 route và 16 artboard (gấp 4 Phase 4), nên tách làm hai plan:
- **5a** (plan này): Câu chuyện và Con người.
- **5b** (plan sau): Sản phẩm (PatternExplorer), Thư viện (lightbox, `?anh=`), Kết nối (form minh hoạ).

Hết 5a vẫn dừng để người dùng xem như mọi phase.

**Architecture:**
- Mỗi trang có một view model do `lib/content` dựng:
  - `getStoriesPage(mode)` và `getStoryPage(slug, mode)`;
  - `getPeoplePage(mode)` và `getPersonPage(slug, mode)`.
- `page.tsx` chỉ gọi `getMode()` và `get*Page()`, rồi truyền view model xuống `components/stories/*` và `components/people/*`.
- Rich text đi qua `sanitizeRich` ở lib. Lib gắn sẵn:
  - `anchor` cho tiêu đề;
  - ảnh đã kiểm quyền cho khối `figure`;
  - số chú thích cho `cite`.
- Component `content/RichText` chỉ render cây đã lọc.
- Phần tương tác là client component chung: `FilterableList`, `SearchField`, `ReadingProgress`, `TableOfContents`, `ShareButtons`.

**Tech Stack:** Node 22.23.4, Next 16.4, React 19, Payload 3.92 (Postgres), Tailwind 4.3, Vitest + @testing-library/react, Playwright + @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-10-26-chieu-hoi-web-design.md`. Đọc kèm:
- `CLAUDE.md`, nhất là mục "Kiến trúc" và "Component dùng chung";
- `docs/HANDOFF.md`, mục "Đặc tả tương tác" 5, "Mô hình nội dung" và checklist khả năng truy cập;
- `docs/superpowers/backlog.md`, mục B và C Phase 4;
- artboard `design/source/{StoriesIndex,StoriesMobile,StoryDetail,StoryMobile,PeopleIndex,PeopleMobile,PersonDetail,PersonMobile}.dc.html`;
- ảnh chụp tương ứng trong `design/screens/`.

## Global Constraints

- Mọi quy tắc trong `CLAUDE.md` áp dụng.
  - Phụ thuộc một chiều: `app` → `components` → `lib/content` → Payload.
  - Component chỉ `import type` từ `@/lib/content` (lint chặn).
  - Mẫu giao diện xuất hiện lần thứ hai thì lên `ui`/`content`.
  - Giá trị lặp lại thành token. Không viết cứng `tracking-[…]` hay `rgba(...)` mới.
  - Vi phạm là lỗi phải sửa, không phải lỗi nhỏ.
- **Dùng lại component Phase 2–4 trước khi viết mới:**
  - `PageHeader`, `Eyebrow`, `SectionHeading`, `FilterChips`, `EmptyState`;
  - `StoryCard`, `PortraitCard`, `ReadNext`, `Sources` (`FootnoteRef`, `SourceList`);
  - `Callout`, `VerifyNote`, `Tag`, `FactList`, `ContentImage`, `PreviewNotes`, `ThreadsDivider`, `Button`, `LinkArrow`.
- **Copy nguyên văn từ artboard.**
  - Chuỗi khác nhau giữa desktop và mobile lưu thành `Variant` `{ desktop, mobile }` trong `src/lib/content/copy/{stories,people}.ts`, lọc bằng `applyMode` như Phase 4.
  - Nhánh `preview` của copy là ghi chú quy trình, thành `null` ở public.
- **Dữ liệu CMS thắng chữ vẽ trên artboard** (ruling Phase 3):
  - tiêu đề, sapo, chủ đề, ảnh bìa, biên tập, nội dung bài;
  - tên, vai trò, ghi chú, câu chuyện, lời trích của người.
- **Ở public:**
  - chuỗi có dấu chưa xác minh (`UNVERIFIED_MARK`) không render;
  - ghi chú quy trình chỉ render ở preview;
  - section không còn dữ liệu thì không render, kể cả tiêu đề;
  - tên, ảnh, lời trích và các mô tả nhận ra được người chỉ hiện khi có đúng loại đồng ý (spec mục 7);
  - **không có tên, ảnh, `alt` hay chú thích chân dung nào của người chưa đồng ý trong HTML/RSC.**
- **Không có JavaScript:**
  - danh sách hiện đủ mọi thẻ của trang đầu (chip "Tất cả" được chọn);
  - bài đọc đầy đủ, mục lục là link neo;
  - nút chia sẻ, tiến độ đọc và "Xem thêm" chỉ hoạt động khi có JS.
- **Tương tác:**
  - Chip lọc dùng `aria-pressed`.
  - Đếm kết quả nằm trong `role="status"`.
  - Ô tìm kiếm có `<label>` thật.
  - Tiến độ đọc là `role="progressbar"`, `aria-valuenow` 0–100, `position: sticky`, không gây khựng khi cuộn.
  - Mục lục đánh dấu mục đang đọc bằng `aria-current="true"`.
  - Khi giảm chuyển động: bỏ transition.
- **Token và chữ:**
  - Màu chữ chỉ lấy từ token; chữ tối thiểu 12px; `font-display` chỉ dùng từ 20px trở lên.
  - Vùng chạm ≥ 44px.
  - Focus 2px: xanh làng trên nền sáng, vàng trên nền tối.
  - Bo góc 0, trừ chấm tròn trạng thái đồng ý.
- **Ảnh:**
  - Mọi ảnh là ArchiveAsset, render qua `ContentImage`.
  - Ảnh đầu trang dùng `priority`.
  - Ảnh thẻ "Đọc tiếp"/"Liên quan" lấy từ slot `media` trong `page-intros` (R2 Phase 4).
- **Schema đổi** thì chạy `npm run migrate:create <tên>` và commit `src/migrations`.
- **Mỗi task kết thúc bằng:**
  - `npm run lint` (0 lỗi);
  - `npm run test:unit`, và `npm run test:int` nếu task có test int;
  - commit có dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Lệnh chạy qua `fnm exec --using=22.23.4 -- npm run …`. Shell là fish nên lệnh ghép phải bọc trong `bash -c`.
- **Làm trên nhánh `phase-5a-cau-chuyen-con-nguoi`**, tách từ `main` @ `02f2b15`.

## Review Focus

1. **Người chưa đồng ý ở public.** Seed để `name: null` và mọi consent `false`, nhưng bản ghi đã đăng.
   - `/con-nguoi/mau-nghe-nhan` ở public vẫn trả 200.
   - h1 là "Chờ đồng ý".
   - Không có thẻ `img` chân dung hay phóng sự ảnh.
   - Không có `alt` mô tả người, không có câu chuyện, ghi chú, xóm thôn hay lời trích.
   - Khung "Trạng thái đồng ý" vẫn hiện "Chưa có".
   - → Task 2 (int), Task 8 (e2e).
2. **Bài có `cite` trỏ tới nguồn bị ẩn hoặc đã xoá.**
   - Số chú thích liên tục 1..n theo danh sách "Ghi chú nguồn".
   - Chỗ trích nguồn mất thì không để lại số trống.
   - Ở public, đoạn văn mà mọi cite đều mất thì bị bỏ (cùng luật R-T4e Phase 4).
   - → Task 1 (unit `rich.test.ts` + int).
3. **Ảnh trong bài (`figure`) chưa được phép.**
   - Ở public, khối ảnh và chú thích biến mất, không còn `<figure>` rỗng.
   - Ở preview, ảnh hiện kèm nhãn.
   - → Task 1, Task 3.
4. **Chủ đề/nhóm không còn bài nào, hoặc tìm kiếm không khớp.**
   - Hiện khung trống đúng copy.
   - Đếm "0 bài" trong `role="status"`.
   - Tìm "trang chieu" (không dấu) vẫn ra "Chuyện về Trạng Chiếu".
   - → Task 4, Task 5.
5. **Slug không tồn tại, slug của bài `idea`, hoặc bài nháp ở public.**
   - Trả 404 qua `notFound()`.
   - `generateStaticParams` chỉ gồm bản ghi đủ điều kiện public.
   - Preview vẫn mở được bài nháp.
   - → Task 6, Task 8.

## Ruling của Claude trong plan (báo người dùng khi hết phase)

- **R1. Tách Phase 5 thành 5a và 5b** (xem Phạm vi).
  - Cái giá: thêm một lần dừng xem giữa phase.
- **R2. Trạng thái bài lên view model.** `StoryCardView.status` có giá trị `'Bản nháp' | 'Chủ đề đề xuất' | null`, tính ở lib, rồi xoá `storyStatus` khỏi `components/content/labels.ts` (backlog C Phase 4).
  - Bài `idea` hiện nhãn "Chủ đề đề xuất" **ở cả public**, theo HANDOFF ("status = idea thì hiện 'Chủ đề đề xuất'"). Trước nay nhãn này chỉ hiện ở preview, là lỗi.
  - "Bản nháp" chỉ có ở preview.
  - `productTag` chuyển sang lib ở 5b. `previewNotes` vẫn để trong backlog.
- **R3. Khối ảnh trong rich text** (backlog B "Rich text chưa có khối ảnh"). Thêm block `figure` có hai trường:
  - `image`: relationship `archive-assets`, bắt buộc;
  - `caption`: text, localized.

  `sanitizeRich` đổi khối này thành `{ type: 'figure', image: ImageView, caption }` qua `toImageView`. Ảnh không được phép ở public thì bỏ cả khối.
- **R4. Đánh số chú thích theo lần trích đầu tiên trong bài.** Nguồn trong `sources` của bài mà không được trích thì xếp sau.
  - Cite trỏ tới nguồn không còn (đã xoá, hoặc tiêu đề chưa xác minh ở public) thì bị bỏ. Đây là backlog B "Renderer rich text bỏ cite trỏ tới nguồn đã xoá".
  - Ở public, đoạn văn có cite mà mọi cite đều bị bỏ thì bỏ cả đoạn.
- **R5. Mục lục** lấy từ các heading `h2` của bài. `anchor` là slug không dấu của chữ tiêu đề, trùng thì thêm `-2`, `-3`. Mobile không có mục lục, theo artboard.
- **R6. Trường mới của Story:**
  - `coverCaption`: chú thích ảnh bìa. Desktop thêm "Ảnh: {photographer}" nếu có; mobile dùng cùng chú thích nhưng không có phần tác giả, theo artboard.
  - `publishedAt`: text `YYYY-MM-DD`, hiện dạng dd/mm/yyyy.
  - `reviewChecklist`: mảng `{ item }`, khung "CẦN THẨM ĐỊNH TRƯỚC KHI ĐĂNG". Chỉ hiện ở preview vì là việc biên tập.
    - Cái giá: mobile hiện danh sách gạch đầu dòng thay vì câu nối "…; …" của artboard.
- **R7. Một nội dung bài cho cả hai bản.** Bài mobile trên artboard là bản rút gọn của desktop; site dùng nội dung CMS cho cả hai (cùng tinh thần R-T4b Phase 4).
  - Cái giá: bài mobile dài hơn artboard.
- **R8. "Đọc tiếp" của bài:**
  - Hai thẻ cố định là "Dòng thời gian làng Hới" (`/lang-hoi`) và "Một tấm chiếu, muôn công đoạn" (`/nghe-det-chieu`). Ảnh lấy từ slot `next-village`, `next-craft` của `cau-chuyen`.
  - Thẻ thứ ba là bài khác đầu tiên trong danh sách (không phải bài đang đọc). Eyebrow là "CHỦ ĐỀ · nhãn trạng thái", ảnh là ảnh bìa. Bài có trang chi tiết thì link tới trang đó, không thì link `/cau-chuyen`.
  - Mobile chỉ hiện hai thẻ cố định, theo artboard.
- **R9. Chia sẻ:**
  - "Sao chép đường dẫn" dùng `navigator.clipboard`, báo "Đã sao chép đường dẫn" trong vùng `aria-live`.
  - "Facebook" mở `https://www.facebook.com/sharer/sharer.php?u=<url>` trong tab mới.
  - "Zalo" không có URL chia sẻ công khai không cần app id. Nút này dùng `navigator.share` nếu trình duyệt có, nếu không thì sao chép link và báo "Đã sao chép đường dẫn, dán vào Zalo để chia sẻ".
  - Cái giá: chưa phải chia sẻ thẳng vào Zalo.
- **R10. Tìm kiếm và "Xem thêm":**
  - Tìm trên trình duyệt trong tiêu đề, sapo và chủ đề, không phân biệt dấu và hoa thường. Hàm chuẩn hoá là `normalizeSearch` ở `src/lib/search.ts`, util thuần ngoài `lib/content`.
  - "Xem thêm câu chuyện" hiện thêm 9 thẻ mỗi lần. Hết bài thì nút `aria-disabled` kèm dòng "Đã hiện hết các bài hiện có".
  - Chỉ trang Câu chuyện có tìm kiếm và "Xem thêm", theo artboard.
- **R11. Đếm kết quả:**
  - Desktop: "N bài · M bản nháp"; phần "· M bản nháp" bỏ khi M = 0 (luôn bỏ ở public).
  - Mobile: "N bài".
  - Con người: "N chân dung · tất cả đang chờ đồng ý" (mobile "· đang chờ đồng ý") khi mọi thẻ đang hiện đều chờ đồng ý, còn không thì "N chân dung".
- **R12. Mở đầu trang:**
  - `/cau-chuyen` desktop không có lead (artboard đặt ô tìm kiếm ở đó).
  - Seed `page-intros.cau-chuyen.lead` = "Ký ức, lịch sử và đời sống hôm nay của làng Hới." (bản mobile), chỉ hiện ở mobile.
  - `con-nguoi.title` thêm ngắt dòng "Những bàn tay\ngiữ hồn làng.".
  - Lead mobile của `/con-nguoi` dùng lead CMS như desktop (R-T4b).
- **R13. Trường mới của Person:**
  - `intro`: câu giới thiệu.
  - `hamlet`: xóm, thôn.
  - `recordedBy`, `recordedAt`: "Ghi lại bởi".
  - `gallery`: mảng `{ image, caption }`, mục "Phóng sự ảnh".
  - `relatedStep`: relationship `craft-steps`.
  - `relatedProduct`: relationship `products`.

  Ở public, `intro`, `hamlet`, `recordedBy`/`recordedAt` và `story` chỉ hiện khi có đồng ý tên (như `note`/`yearsInCraft` hiện nay). `gallery` chỉ hiện khi có đồng ý ảnh.
- **R14. Placeholder gợi ý phỏng vấn** của artboard ("[Đoạn kể dựa trên phỏng vấn…]", "“[Trích nguyên văn lời kể]”", "[Một câu giới thiệu ngắn…]") là chỉ dẫn biên tập, không phải nội dung.
  - Lưu trong copy `people.ts`, nhánh `preview`.
  - Chỉ hiện ở preview, kiểu chữ mờ `.ph`, khi trường tương ứng trống.
  - Không seed vào CMS, vì chúng không chứa dấu "cần/chờ" nên sẽ lọt qua bộ lọc public.
- **R15. Lời trích trong câu chuyện** đặt sau mục đầu tiên của câu chuyện, như artboard. Lib tách `story` thành `storyParts: [trước, sau]` tại heading thứ hai.
  - Chú thích lời trích ở public là "Nguồn: {publisher (dd/mm/yyyy)}". Ở preview thêm "Chỉ hiển thị khi có ghi âm hoặc ghi chép gốc · " phía trước.
- **R16. Tên chưa được đồng ý:**
  - Ở public, h1 và mục cuối breadcrumb là "Chờ đồng ý".
  - h2 "Câu chuyện của {tên}" thành "Câu chuyện" khi không có tên.
  - Thẻ "Liên quan" hiện vật lấy tên sản phẩm. Không dùng "Chiếu do [tên] làm", vì câu này gắn người với sản phẩm.
- **R17. Seed mẫu `mau-nghe-nhan`:**
  - `gallery` gồm `nkc5` và `nkc14`, chú thích nguyên văn artboard.
  - `relatedStep` = công đoạn 05: ảnh chân dung là cảnh dệt, khớp ghi chú "Dệt chiếu tay".
  - **Không** seed `relatedProduct`. Gắn người với một hiện vật cụ thể là dữ kiện bịa.
  - Cái giá: thẻ "Hiện vật" không hiện ở preview.
- **R18. Khung trạng thái đồng ý (`ConsentPanel`)** hiện ở cả public, theo HANDOFF component `ConsentPanel`.
  - Ba mức: "Chưa có" (chấm nét đứt), "Một phần" (vòng liền), "Đã có" (chấm đặc). Chữ luôn đi kèm, không chỉ dựa vào hình.
  - Dòng "Cần: đồng ý đăng …" liệt kê các loại còn thiếu.
  - Thẻ "Người được kể đã duyệt bài" lấy từ `reviewedBySubject`.
- **R19. Ghi chú "Mẫu trang chân dung…"** (băng `role="note"` đầu trang) và câu "Ảnh dưới đây lấy từ bộ ảnh tham khảo…" trong khung "Nguyên tắc chân dung" chỉ hiện ở preview.
  - Băng chỉ hiện khi người đó còn chờ đồng ý.
- **R21. Thẻ bài `idea` trên `/cau-chuyen` không phải link** và không có CTA "Xem đề cương →". HANDOFF không cho bài idea có trang chi tiết, và link về chính `/cau-chuyen` thì vô nghĩa. Trang chủ vẫn link thẻ idea về `/cau-chuyen` như Phase 3.
  - Cái giá: khác artboard một dòng CTA.
- **R20. Trang chi tiết là dynamic.**
  - `generateStaticParams` trả các slug đủ điều kiện public: đã đăng, và với Story thì `workflow ≠ idea`.
  - `dynamicParams` giữ mặc định `true`, để preview mở được bản nháp.
  - Vấn đề chốt mode lúc build vẫn là backlog A, xử lý ở Phase 6–7.

---

## Cấu trúc file

```
src/collections/Stories.ts                    coverCaption, publishedAt, reviewChecklist, block figure (Task 1)
src/collections/People.ts                     intro, hamlet, recordedBy, recordedAt, gallery, relatedStep, relatedProduct (Task 2)
src/globals/pageMedia.ts                      slot cho 'cau-chuyen' và 'con-nguoi' (Task 1, 2)
src/migrations/*_phase5a_stories.ts           (Task 1)   *_phase5a_people.ts (Task 2)
src/lib/search.ts                             normalizeSearch (Task 4)
src/lib/content/rich.ts                       figure, anchor, cite đánh số, bỏ đoạn mồ côi, toc, splitAtHeading (Task 1, 2)
src/lib/content/stories.ts                    getStoriesPage, getStoryPage, storySlugs (Task 1)
src/lib/content/people.ts                     getPeoplePage, getPersonPage, personSlugs (Task 2)
src/lib/content/copy/{stories,people}.ts      chữ cố định (Task 1, 2)
src/lib/content/{types,queries,visibility,index}.ts
src/components/content/labels.ts             bỏ storyStatus (Task 1)
src/components/content/{RichText,ConsentPanel,PhotoEssay,StatusDot}.tsx   (Task 3)
src/components/content/ReadNext.tsx           thêm title/action/mobileLimit/imageClassName (Task 3)
src/components/ui/{PullQuote,BackLink,NoteBanner}.tsx; Callout tone="dark"; EmptyState size="lg"  (Task 3)
src/components/ui/{SearchField,ReadingProgress,TableOfContents,ShareButtons,FilterableList}.tsx  (Task 4)
src/components/stories/{StoriesView,StoryView}.tsx      (Task 5, 6)
src/components/people/{PeopleView,PersonView}.tsx       (Task 7, 8)
src/app/(frontend)/cau-chuyen/{page.tsx,[slug]/page.tsx}
src/app/(frontend)/con-nguoi/{page.tsx,[slug]/page.tsx}
src/app/(frontend)/styleguide/*               thêm mọi component mới (Task 3, 4)
src/seed/{index.ts,citations.ts,data/*}       figure token, checklist, media slot, mẫu người (Task 1, 2)
tests/unit/**, tests/int/{stories,people}.int.spec.ts, tests/e2e/{stories,people}.e2e.spec.ts
```

---

### Task 1: Lib cho Câu chuyện (schema, rich text, view model, seed)

**Files:**
- Modify: `src/collections/Stories.ts`, `src/globals/pageMedia.ts`, `src/globals/PageIntros.ts` (chỉ nếu cần đăng ký slot), `src/lib/content/{rich,types,queries,index}.ts`, `src/components/content/{labels,StoryCard}.ts(x)`, `src/seed/{index,citations}.ts`, `src/seed/data/{extras,site}.ts`, `src/seed/data/chuyen-ve-trang-chieu.md`
- Create: `src/lib/content/stories.ts`, `src/lib/content/copy/stories.ts`, `src/migrations/<ts>_phase5a_stories.ts`, `tests/int/stories.int.spec.ts`
- Test: `tests/unit/rich.test.ts`, `tests/unit/copy.test.ts`, `tests/unit/components/labels.test.tsx`, `tests/int/stories.int.spec.ts`

**Interfaces:**
- Produces (types.ts):

```ts
export type RichNode = Record<string, unknown>          // cây Lexical đã lọc
export type Rich = { root: RichNode }
// Nút đặc biệt trong cây đã lọc:
//   heading: thêm `anchor: string` khi tag là h2 (R5)
//   { type: 'cite', n: number }                         (R4, thay inlineBlock cite)
//   { type: 'figure', image: ImageView, caption: string | null }   (R3)
export interface StoryCardView { /* như cũ */ status: 'Bản nháp' | 'Chủ đề đề xuất' | null; sourceCount: number }
export interface StoryView extends StoryCardView {
  body: Rich | null
  toc: { id: string; title: string }[]
  sources: SourceView[]                 // đã đánh số theo R4, date dd/mm/yyyy
  editor: string | null
  publishedAt: string | null            // dd/mm/yyyy
  coverCaption: string | null
  reviewChecklist: string[] | null      // null ở public
}
export interface StoriesPageView { intro: PageIntroView; stories: StoryCardView[]; filters: { key: string; label: string }[]; copy: StoriesCopyView }
// filters: chip "Tất cả" (key all) + STORY_CATEGORY_OPTIONS theo thứ tự. StoriesCopyView = ApplyMode<typeof storiesCopy> (như CraftCopyView).
export interface StoryPageView {
  story: StoryView
  readNext: ReadNextItem[]              // 3 mục, R8; mục 3 có `mobile: false`
  copy: StoriesCopyView
}
export type ReadNextItem = { href: string; eyebrow: string; title: string; cta: string; image: ImageView | null; mobile?: boolean }
```

  `CraftPageView['readNext']` đổi sang `ReadNextItem[]`.

- Produces (`index.ts`):
  - `getStoriesPage(mode)` và `getStoryPage(slug, mode)`, đều bọc `cache()`;
  - `getStorySlugs(): Promise<string[]>`, trả các slug public, dùng cho `generateStaticParams`.
- Produces (`pageMedia.ts`):
  - `'cau-chuyen': ['next-village', 'next-craft']`;
  - nhãn admin "Tiếp theo: Làng Hới", "Tiếp theo: Nghề dệt chiếu".

- [ ] **Step 1: Test unit cho `sanitizeRich`** (`tests/unit/rich.test.ts`, thêm vào file có sẵn). Hàm nhận thêm tham số:

  ```ts
  sanitizeRich(node, ctx: {
    sources: Map<number, string>
    visibleSourceIds: string[]                                   // thứ tự sẽ đánh số
    assets: Map<number, ImageView | null>                        // asset id → ImageView đã áp mode
    mode: Mode
    anchors?: boolean
  }): { rich: Rich | null; citedOrder: string[]; toc: { id: string; title: string }[] }
  ```

  Các test:
  - `cite → { type: 'cite', n }`: số theo `citedOrder` (lần xuất hiện đầu). Hai cite cùng nguồn có cùng `n`.
  - Cite có `sourceId` không nằm trong `visibleSourceIds` thì bị bỏ, không để lại nút nào.
  - Public: một paragraph có 2 cite đều bị bỏ thì paragraph đó bị bỏ. Preview: paragraph còn, cite bị bỏ.
  - Paragraph không có cite nào không bị ảnh hưởng.
  - Block `figure` có asset `null` trong map (ảnh bị loại ở public) thì bị bỏ hẳn. Có ImageView thì ra `{ type:'figure', image, caption }`. Caption chưa xác minh ở public thì `caption: null`.
  - `anchors: true` (giá trị mặc định nên là `true` cho h2):
    - h2 "Một Tam nguyên của làng Hải Triều" có `anchor` `mot-tam-nguyen-cua-lang-hai-trieu`;
    - hai h2 trùng chữ cho ra `x` và `x-2`;
    - `toc` có đúng thứ tự.
  - Giữ nguyên test cũ (lọc nút lạ, link ngoài, ẩn cả trường khi có dấu `[cần xác minh]` ở public).
- [ ] **Step 2: Chạy test, thấy FAIL.**

  ```
  fnm exec --using=22.23.4 -- npx vitest run tests/unit/rich.test.ts
  ```

- [ ] **Step 3: Viết lại `src/lib/content/rich.ts` theo chữ ký trên.**
  - Hàm slug dùng chung với `People.ts`. Chuyển `slugify` sang `src/lib/slugify.ts` (util thuần) để cả collection và lib import được.
  - `splitAtHeading` để Task 2 viết.
- [ ] **Step 4: Test labels/copy.**
  - Trong `tests/unit/components/labels.test.tsx`, bỏ ca `storyStatus`.
  - Trong `tests/unit/copy.test.ts`, thêm ca: `applyMode(storiesCopy, 'public')` làm mọi nhánh `preview` thành `null`.
- [ ] **Step 5: Schema.**
  - `Stories.ts`:
    - thêm `coverCaption` (text, localized), `publishedAt` (text, validate `^\d{4}-\d{2}-\d{2}$` hoặc trống), `reviewChecklist` (array `{ item: text localized }`);
    - thêm block `figure` (`image`: relationship `archive-assets` required; `caption`: text localized) vào `BlocksFeature({ blocks: [figure], inlineBlocks: [cite] })`.
  - `pageMedia.ts`: thêm slot `cau-chuyen` như Interfaces.
  - Chạy `npm run migrate:create phase5a_stories` và kiểm SQL chỉ thêm cột/bảng.
- [ ] **Step 6: Copy** `src/lib/content/copy/stories.ts`, nguyên văn artboard. Khoá bắt buộc:

```ts
export const storiesCopy = {
  breadcrumb: { home: 'Trang chủ', current: 'Câu chuyện' },
  search: { label: 'Tìm trong câu chuyện', placeholder: { desktop: 'Ví dụ: khung dệt, Trạng Chiếu', mobile: 'Ví dụ: Trạng Chiếu' } },
  filter: { label: { desktop: 'Lọc theo chủ đề', mobile: 'Lọc' }, all: 'Tất cả' },
  count: { stories: '{n} bài', drafts: ' · {d} bản nháp' },
  featured: { eyebrow: 'BÀI NỔI BẬT', meta: '{s} nguồn báo chí · khoảng {m} phút đọc' },
  cta: { read: 'Đọc bài →', outline: 'Xem đề cương →' },
  empty: {
    title: 'Chưa có bài trong chủ đề này',
    body: { desktop: 'Câu chuyện về người làng chỉ được viết khi chính họ đồng ý kể. Nếu bạn muốn kể về một người thân làm nghề chiếu, hãy liên hệ với chúng tôi.',
            mobile: 'Câu chuyện về người làng chỉ được viết khi chính họ đồng ý kể.' },
    action: { href: '/ket-noi', label: 'Góp một câu chuyện →' },
  },
  more: { label: 'Xem thêm câu chuyện', done: 'Đã hiện hết các bài hiện có' },
  detail: {
    back: 'Câu chuyện',
    draftTag: 'Bản nháp — cần thẩm định',
    meta: { editor: 'Biên tập: ', published: 'Ngày đăng: ', minutes: 'Khoảng {m} phút đọc', sources: '{s} nguồn' },
    photoPrefix: 'Ảnh: ',
    share: { label: 'CHIA SẺ', copy: { desktop: 'Sao chép đường dẫn', mobile: 'Sao chép link' }, facebook: { desktop: 'Chia sẻ qua Facebook', mobile: 'Facebook' },
             zalo: { desktop: 'Chia sẻ qua Zalo', mobile: 'Zalo' }, copied: 'Đã sao chép đường dẫn', zaloFallback: 'Đã sao chép đường dẫn, dán vào Zalo để chia sẻ' },
    toc: { label: 'Mục lục', title: 'TRONG BÀI' },
    progress: 'Tiến độ đọc',
    quoteNote: 'Trích từ bài viết',
    notesTitle: 'Ghi chú nguồn',
    readNext: { title: 'Đọc tiếp', eyebrow: 'ĐỌC TIẾP', all: 'Tất cả câu chuyện →' },
    preview: { checklistTitle: 'CẦN THẨM ĐỊNH TRƯỚC KHI ĐĂNG' },
  },
}
export const storiesReadNext = [
  { href: '/lang-hoi', slot: 'next-village', eyebrow: 'LÀNG HỚI', title: 'Dòng thời gian làng Hới', cta: 'Xem các mốc →' },
  { href: '/nghe-det-chieu', slot: 'next-craft', eyebrow: 'NGHỀ DỆT CHIẾU', title: 'Một tấm chiếu, muôn công đoạn', cta: 'Đi theo hành trình →' },
] as const
```

  Khoá `filter.label` lấy đúng `aria-label` của artboard, "Lọc theo chủ đề" và "Lọc". Desktop là nhãn của nhóm chip.
- [ ] **Step 7: Test int** (`tests/int/stories.int.spec.ts`), seed bằng helper của `tests/int/helpers.ts`.

  `getStoriesPage`:
  - public có 6 bài;
  - bài `idea` có `status: 'Chủ đề đề xuất'` và `hasDetail: false`;
  - không bài nào có `status: 'Bản nháp'`;
  - preview: "chuyen-ve-trang-chieu" có `status: 'Bản nháp'`.

  `getStoryPage`:
  - public trả `null` cho bài nháp, bài `idea` và slug lạ;
  - preview "chuyen-ve-trang-chieu":
    - `toc` có 4 mục, đúng thứ tự artboard;
    - `sources` đánh số vietnamplus=1, danviet=2, daidoanket=3;
    - `reviewChecklist` có 3 mục;
    - có đúng một nút `figure`;
    - `readNext` có 3 mục, mục 3 là bài khác với `mobile: false`.

  Bài đã đăng có cite tới một nguồn có tiêu đề `[cần xác minh]`:
  - ở public, nguồn đó không có trong `sources`;
  - đoạn chỉ trích nguồn đó không còn trong `body`.

  Bài đã đăng có `figure` với asset `rights: 'unknown'`: ở public không có nút `figure` nào.

  `getStorySlugs()` chỉ gồm bài đã đăng có `workflow ≠ idea`.
- [ ] **Step 8: Cài đặt.**
  - **`queries.ts`:**
    - `storyCard` tính `status`: idea thì "Chủ đề đề xuất" ở mọi mode; preview + chưa đăng thì "Bản nháp".
    - `sourceCount` = số nguồn nhìn thấy được.
    - `getStory` nạp asset của các khối `figure` (depth đủ, hoặc một `find` theo id), dựng map `assets` qua `toImageView(…, mode)`, rồi gọi `sanitizeRich`.
    - Thứ tự `sources` theo R4: lấy `citedOrder` trước, rồi các nguồn còn lại của `d.sources`, sau đó định dạng ngày.
  - **`stories.ts`:**
    - `createStories(payload, content)` trả `getStoriesPage`, `getStoryPage` và `getStorySlugs`.
    - `getStoriesPage` dùng `getPageIntro('cau-chuyen')`.
    - `getStoryPage` dùng `getPageMedia('cau-chuyen')` cho R8.
  - **`index.ts`:** export các hàm trên, thêm `cache()` cho hai hàm page.
  - **Component:** xoá `storyStatus` khỏi `labels.ts`. `StoryCard` dùng `story.status`, tag `dashed` cho "Bản nháp" và `filled` cho "Chủ đề đề xuất".
- [ ] **Step 9: Seed.**
  - **`chuyen-ve-trang-chieu.md`:** chèn dòng token `[[figure:nkc14.webp|Đôi tay trên khung dệt. Ảnh: [tác giả — cần xác minh] · Quyền dùng: [cần xác minh]]]` vào sau đoạn "Vì vậy, bài viết này giữ hai lớp kể song song…", đúng vị trí trên artboard.
    - `citations.ts` thêm `injectFigures(root, assetIdByFile)`, thay **paragraph chỉ chứa token đó** bằng block `{ type: 'block', fields: { blockType: 'figure', image, caption } }`.
    - Token trỏ tới file không có thì ném lỗi, giống `injectCitations`.
  - **`storyExtras`** của "chuyen-ve-trang-chieu":
    - `coverCaption`: "Khung dệt thủ công ngày nay. Ảnh minh hoạ cho bài, không phải khung dệt thời Lê.";
    - `reviewChecklist`: ba dòng nguyên văn `<li>` của artboard;
    - `publishedAt` để trống.
  - **`site.ts`:**
    - `pageIntros['cau-chuyen'].lead` = "Ký ức, lịch sử và đời sống hôm nay của làng Hới." (R12);
    - `pageMedia['cau-chuyen']` = `[{ slot: 'next-village', file: 'hc9.webp' }, { slot: 'next-craft', file: 'nkc5.webp' }]`;
    - `mediaFor` nhận thêm `'cau-chuyen'`.
  - Thêm assert vào `tests/int/seed.int.spec.ts`: bài có 1 khối `figure` và slot `cau-chuyen` có 2 ảnh.
- [ ] **Step 10: Chạy test.** Lint, `test:unit` và `test:int` phải PASS. Sửa test cũ đang assert `storyStatus` hoặc kiểu `readNext` cũ.
- [ ] **Step 11: Commit**

  ```
  git commit -m "feat(content): view model Câu chuyện, rich text có ảnh/mục lục/đánh số nguồn"
  ```

### Task 2: Lib cho Con người (schema, view model, seed)

**Files:**
- Modify: `src/collections/People.ts`, `src/globals/pageMedia.ts`, `src/lib/content/{rich,types,visibility,queries,index}.ts`, `src/seed/index.ts`, `src/seed/data/{extras,site}.ts`
- Create: `src/lib/content/people.ts`, `src/lib/content/copy/people.ts`, `src/migrations/<ts>_phase5a_people.ts`, `tests/int/people.int.spec.ts`
- Test: `tests/unit/visibility.test.ts`, `tests/unit/rich.test.ts`, `tests/int/people.int.spec.ts`

**Interfaces:**
- Consumes:
  - `sanitizeRich`, `Rich`, `ReadNextItem` từ Task 1;
  - `slugify` ở `src/lib/slugify.ts`.
- Produces:

```ts
export interface PersonView { /* như cũ */ note: string | null }   // public: chỉ khi có đồng ý tên
export type ConsentState = 'none' | 'partial' | 'full'
export interface PersonDetailView extends PersonView {
  intro: string | null; yearsInCraft: string | null; hamlet: string | null
  recorded: string | null                         // "recordedBy · dd/mm/yyyy" ghép, null nếu cả hai trống
  storyParts: [Rich | null, Rich | null]          // R15
  quote: { text: string; sourceLine: string | null } | null
  gallery: { image: ImageView; caption: string | null }[]
  consent: { state: ConsentState; missing: ('tên' | 'ảnh' | 'lời trích')[]; reviewedBySubject: boolean }
  portraitCaption: { label: string; photographer: string | null; consentLine: string | null }   // consentLine chỉ ở preview
}
export interface PeoplePageView { intro: PageIntroView; people: PersonView[]; filters: { key: string; label: string }[]; copy: PeopleCopyView }
export interface PersonPageView { person: PersonDetailView; related: ReadNextItem[]; copy: PeopleCopyView }
```

  - `filters`: chip "Tất cả" (key `all`), rồi mọi option của `PERSON_CATEGORY_OPTIONS` theo thứ tự.
  - `PeopleCopyView = ApplyMode<typeof peopleCopy>`.
  - Index có `getPeoplePage`, `getPersonPage` (đều `cache()`) và `getPersonSlugs()`.
  - `pageMedia.ts` thêm `'con-nguoi': ['related-people']`, nhãn admin "Liên quan: Con người".

- [ ] **Step 1: Test unit.**
  - `splitAtHeading(rich, 2)` (`rich.test.ts`):
    - cây có 3 heading cho ra phần trước heading thứ hai và phần từ heading thứ hai trở đi;
    - cây không có heading thứ hai cho `[rich, null]`;
    - `null` cho `[null, null]`.
  - `toPersonView` (`visibility.test.ts`): `note` ở public là `null` khi `consent.name` false, và là chuỗi khi true.
- [ ] **Step 2: Chạy test, thấy FAIL.**
- [ ] **Step 3: Schema `People.ts`.**
  - Thêm các trường của R13:
    - `intro` (textarea, localized);
    - `hamlet` (text);
    - `recordedBy` (text);
    - `recordedAt` (text `YYYY-MM-DD`);
    - `gallery` (array `{ image: upload archive-assets, caption: text localized }`, `maxRows: 6`);
    - `relatedStep` (relationship `craft-steps`);
    - `relatedProduct` (relationship `products`).
  - `import { slugify } from '@/lib/slugify'`.
  - Chạy `migrate:create phase5a_people`.
- [ ] **Step 4: Copy** `src/lib/content/copy/people.ts`, nguyên văn artboard:

```ts
export const peopleCopy = {
  breadcrumb: { home: 'Trang chủ', current: 'Con người' },
  principles: {
    title: 'NGUYÊN TẮC CHÂN DUNG', label: 'Nguyên tắc chân dung',
    items: { desktop: ['Tên, tuổi, vai trò chỉ đăng khi người được kể đồng ý.', 'Lời trích chỉ đăng khi có ghi âm hoặc ghi chép gốc.', 'Người được kể có quyền xem lại và rút bài bất cứ lúc nào.'],
             mobile: ['Tên, lời trích chỉ đăng khi có đồng ý và nguồn gốc. Người được kể có quyền rút bài.'] },
    preview: { note: { desktop: 'Ảnh dưới đây lấy từ bộ ảnh tham khảo, chưa có sự đồng ý của người trong ảnh.', mobile: 'Ảnh hiện tại chưa có sự đồng ý.' } },
  },
  filter: { label: { desktop: 'Lọc theo nhóm', mobile: 'Lọc' }, all: 'Tất cả' },
  count: { people: '{n} chân dung', allPending: { desktop: ' · tất cả đang chờ đồng ý', mobile: ' · đang chờ đồng ý' } },
  card: { pending: 'Chờ đồng ý', cta: 'Xem chân dung →' },
  empty: { title: 'Chưa có chân dung trong nhóm này',
           body: { desktop: 'Nếu bạn là người trẻ đang làm nghề chiếu, hoặc biết một người như vậy, chúng tôi muốn được nghe kể.', mobile: null },
           action: { href: '/ket-noi', label: 'Giới thiệu một người →' } },
  invite: { title: 'Bạn biết một người giữ nghề?', body: 'Ông bà, cha mẹ, hàng xóm từng ngồi bên khung dệt. Giới thiệu với chúng tôi, và chúng tôi sẽ hỏi ý họ trước khi ghi lại bất cứ điều gì.',
            action: { href: '/ket-noi', label: 'Giới thiệu một người' } },
  detail: {
    back: 'Con người', pendingName: 'Chờ đồng ý',
    facts: { role: 'Vai trò', years: 'Năm làm nghề', hamlet: 'Xóm, thôn', recorded: 'Ghi lại bởi' },
    portraitLabel: 'CHÂN DUNG', photoPrefix: 'Ảnh: ', consentLine: 'Đồng ý của người trong ảnh: [chưa có]',
    story: { eyebrow: 'ĐỜI VÀ NGHỀ', title: 'Câu chuyện của {name}', titleNoName: 'Câu chuyện' },
    quoteSource: 'Nguồn: ',
    gallery: { title: 'Phóng sự ảnh' },
    consent: { title: 'TRẠNG THÁI ĐỒNG Ý', states: { none: 'Chưa có', partial: 'Một phần', full: 'Đã có' }, need: 'Cần: đồng ý đăng {list}',
               reviewed: { title: 'NGƯỜI ĐƯỢC KỂ ĐÃ DUYỆT BÀI', yes: 'Đã duyệt', no: 'Chưa', hint: 'Gửi bản nháp cho người được kể đọc trước khi đăng' },
               request: { title: 'YÊU CẦU CHỈNH SỬA', body: 'Liên hệ để sửa hoặc gỡ bài', action: { desktop: 'Gửi yêu cầu →', mobile: 'Yêu cầu sửa hoặc gỡ bài →' }, href: '/ket-noi' },
               mobileSummary: '{state} · Người được kể {reviewed}' },
    related: { title: 'Liên quan', eyebrow: 'LIÊN QUAN' },
    preview: {
      banner: { desktop: { strong: 'Mẫu trang chân dung.', text: 'Người trong ảnh chưa được hỏi ý. Tên, tiểu sử và lời kể để trống cho đến khi có sự đồng ý bằng văn bản.' },
                mobile: { strong: 'Mẫu trang.', text: 'Người trong ảnh chưa được hỏi ý; tên và lời kể để trống.' } },
      intro: '[Một câu giới thiệu ngắn, do chính người được kể duyệt.]',
      sections: [
        { title: 'Tuổi thơ bên khung dệt', body: { desktop: '[Đoạn kể dựa trên phỏng vấn. Gợi ý câu hỏi: lần đầu ngồi vào khung dệt là khi nào, ai dạy?]', mobile: '[Đoạn kể dựa trên phỏng vấn.]' } },
        { title: 'Một ngày làm chiếu', body: { desktop: '[Gợi ý: một ngày bắt đầu lúc nào, công đoạn nào mất nhiều thời gian nhất?]', mobile: '[Đoạn kể dựa trên phỏng vấn.]' } },
        { title: 'Điều muốn giữ lại', body: { desktop: '[Gợi ý: điều gì của nghề mà người được kể mong thế hệ sau còn giữ?]', mobile: '[Đoạn kể dựa trên phỏng vấn.]' } },
      ],
      quote: '“[Trích nguyên văn lời kể]”',
      quoteNote: { desktop: 'Chỉ hiển thị khi có ghi âm hoặc ghi chép gốc · Nguồn: [mã ghi âm, ngày]', mobile: 'Chỉ hiện khi có ghi âm gốc' },
      quoteNotePrefix: 'Chỉ hiển thị khi có ghi âm hoặc ghi chép gốc · ',
      galleryNote: { desktop: 'Ảnh cùng buổi chụp · cần xác minh tác giả và quyền dùng', mobile: 'Ảnh cùng buổi chụp · cần xác minh tác giả' },
    },
  },
}
export const peopleRelated = { step: { eyebrow: 'CÔNG ĐOẠN', cta: 'Xem công đoạn →', href: '/nghe-det-chieu' },
  product: { eyebrow: 'HIỆN VẬT', cta: 'Xem hiện vật →' },
  people: { href: '/con-nguoi', slot: 'related-people', eyebrow: 'CON NGƯỜI', title: 'Những chân dung khác', cta: 'Xem tất cả →' } }
```

  Nhánh `preview` không bị `showText` xoá ở preview. Nhánh này luôn là `null` ở public.
- [ ] **Step 5: Test int** (`tests/int/people.int.spec.ts`).

  Public `getPersonPage('mau-nghe-nhan')` với seed:
  - `name`, `portrait`, `intro`, `hamlet`, `recorded`, `quote` đều `null`;
  - `storyParts` là `[null, null]`;
  - `gallery` là `[]`;
  - `consent` là `{ state: 'none', missing: ['tên','ảnh','lời trích'], reviewedBySubject: false }`;
  - `related` có thẻ công đoạn "05 · {tiêu đề công đoạn 5}" và thẻ "Những chân dung khác".
  - Không chuỗi nào trong `JSON.stringify(view)` chứa alt chân dung của seed.

  Public, người có `consent: { name: true, photo: false, quote: false }`, `intro` và `gallery` 1 ảnh `rights: 'permitted'`:
  - có `name` và `intro`;
  - `gallery` là `[]` (cần đồng ý ảnh);
  - `state` là `'partial'`, `missing` là `['ảnh','lời trích']`.

  Thêm `consent.photo: true`: `gallery` có 1 ảnh.

  Preview `mau-nghe-nhan`:
  - `gallery` có 2 ảnh;
  - `portraitCaption.consentLine` là chuỗi `consentLine` của copy.

  `getPeoplePage(public)`:
  - có 8 người;
  - `filters` có 6 chip, đúng thứ tự artboard.

  `getPersonSlugs()` chỉ gồm người đã đăng.
- [ ] **Step 6: Cài đặt `people.ts`, `queries.ts` và `visibility.ts`.**
  - `toPersonView` thêm `note`, gated như `name`.
  - `getPerson` mở rộng theo R13–R16.
  - `related` dựng như sau:
    - **Công đoạn:** href `/nghe-det-chieu`, title `"{nn} · {title}"` (n hai chữ số), ảnh là ảnh công đoạn. Chỉ khi công đoạn đã đăng hoặc đang ở preview.
    - **Hiện vật:** href `/san-pham/{slug}`, title là tên hiện vật, ảnh là ảnh đầu. Chỉ khi có.
    - **Con người:** cố định, ảnh từ slot.
    - Mobile chỉ hiện hai thẻ đầu (`mobile: false` cho thẻ cố định), theo artboard.
  - `recorded` ghép `recordedBy` và ngày bằng " · ".
  - Quote `sourceLine` dùng `formatDate`.
- [ ] **Step 7: Seed.**
  - `peopleSamples` của `mau-nghe-nhan` thêm:
    - `gallery`: `[{ file:'nkc5.webp', caption:'Hai người cùng làm trên một khung. [Chú thích cần người trong ảnh duyệt]' }, { file:'nkc14.webp', caption:'Đôi tay trên khung dệt.' }]`;
    - `relatedStep: 5` (R17).
  - `pageIntros['con-nguoi'].title` = "Những bàn tay\ngiữ hồn làng.".
  - `pageMedia['con-nguoi']` = `[{ slot: 'related-people', file: 'kn2.webp' }]`.
- [ ] **Step 8: Chạy test.** Lint, unit và int phải PASS.
- [ ] **Step 9: Commit**

  ```
  git commit -m "feat(content): view model Con người, đồng ý theo từng phần, phóng sự ảnh"
  ```

### Task 3: Component chung tĩnh

**Files:**
- Create:
  - `src/components/content/RichText.tsx`, `ConsentPanel.tsx`, `PhotoEssay.tsx`, `StatusDot.tsx`;
  - `src/components/ui/PullQuote.tsx`, `BackLink.tsx`, `NoteBanner.tsx`.
- Modify: `src/components/ui/Callout.tsx`, `src/components/ui/Feedback.tsx`, `src/components/content/ReadNext.tsx`, `src/app/(frontend)/styleguide/*`, `src/components/styleguide/fixtures.ts`, `src/app/(frontend)/globals.css` (token nếu cần)
- Test: `tests/unit/content/rich-text.test.tsx`, `tests/unit/content/consent.test.tsx`, `tests/unit/ui/common.test.tsx`, `tests/e2e/styleguide.e2e.spec.ts`

**Interfaces:**
- Consumes: `Rich`, `ReadNextItem`, `PersonDetailView['consent']` (Task 1–2).
- Produces:

```tsx
<RichText value={Rich} variant="article" | "story" dropCap?: boolean />
  // article: p serif 18/20 lh1.8, h2 display 26/34 (id = anchor), blockquote = PullQuote variant="article"
  // story (chân dung): h3 display 22/26, p serif 17/19 lh1.75; cite -> FootnoteRef; figure -> <figure> ContentImage + figcaption 14
<PullQuote variant="article" | "testimony" note?: ReactNode>{text}</PullQuote>
  // article: viền trên/dưới text-primary, chữ display nghiêng 26/36 màu accent (StoryDetail)
  // testimony: viền trái 3px decor-straw, chữ display nghiêng 26/32 màu text-muted (PersonDetail)
<ConsentPanel consent={...} copy={PeopleCopyView['detail']['consent']} />   // desktop 3 cột; mobile một khối gọn (mobileSummary)
<StatusDot state="none" | "partial" | "full" size?: 8 | 10 | 12 />          // nét đứt / vòng liền / chấm đặc
<PhotoEssay items={gallery} note?: string | null title: string />          // desktop 8/4, mobile ảnh tràn viền xếp dọc
<BackLink href label />                                                     // "← {label}", min-h-11, chỉ hiện < md
<NoteBanner strong text />                                                  // role="note", nền bg-secondary, StatusDot none
<Callout tone="light" | "dark" ...>                                         // dark: nền bg-deep(xanh làng), eyebrow vàng (PeopleIndex)
<EmptyState size="md" | "lg" ...>                                           // lg: padding 56, tiêu đề 32 (desktop artboard)
<ReadNext items eyebrow title?: string action?: {href,label} imageClassName?: string />
  // có title: desktop h2 40px + action bên phải, mobile eyebrow; mục có mobile:false ẩn < md
```

- [ ] **Step 1: Test unit.** Mỗi component một `describe`:
  - **RichText:**
    - `h2` có `id` = anchor.
    - `cite` render ra `FootnoteRef` với `href="#nguon-n"`.
    - `figure` render `<figure>` có `img` và `figcaption`.
    - `dropCap` thêm class `first-letter:` cho đoạn đầu.
    - Nút lạ bị bỏ qua mà không lỗi.
  - **ConsentPanel:** đủ 3 trạng thái. Chữ "Chưa có/Một phần/Đã có" luôn có. Dòng "Cần: đồng ý đăng tên, ảnh, lời trích" nối danh sách `missing` bằng ", ".
  - **PullQuote:** cả hai variant.
  - **BackLink:** có chữ và href.
  - **NoteBanner:** có `role="note"`.
  - **ReadNext:** có `title` thì có h2 và action. Mục `mobile:false` có class `max-md:hidden`.
- [ ] **Step 2: Chạy test, thấy FAIL.**
- [ ] **Step 3: Cài đặt.**
  - Kiểu chữ và khoảng cách lấy từ artboard: `.prose` của StoryDetail và StoryMobile, `.ph` và `blockquote` của PersonDetail.
  - Màu như `#8C857A`, `#C3A46C` là trang trí/viền thì dùng token có sẵn. Nếu thiếu thì thêm token vào `@theme`.
  - `ReadNext` giữ nguyên hành vi trang Nghề dệt chiếu khi không truyền `title`.
- [ ] **Step 4: `/styleguide`.** Thêm mục cho mọi component mới và biến thể mới, fixture ở `fixtures.ts`. Cập nhật e2e styleguide nếu e2e kiểm danh sách mục.
- [ ] **Step 5: Chạy test.** Lint, unit và e2e styleguide phải PASS.
- [ ] **Step 6: Commit**

  ```
  git commit -m "feat(ui): RichText, PullQuote, ConsentPanel, PhotoEssay và các khối chung cho bài đọc/chân dung"
  ```

### Task 4: Component chung tương tác

**Files:**
- Create:
  - `src/lib/search.ts`;
  - `src/components/ui/SearchField.tsx`, `ReadingProgress.tsx`, `TableOfContents.tsx`, `ShareButtons.tsx`, `FilterableList.tsx`.
- Modify: styleguide
- Test: `tests/unit/search.test.ts`, `tests/unit/ui/interactive-5a.test.tsx`

**Interfaces:**

```ts
// src/lib/search.ts — util thuần
export function normalizeSearch(s: string): string    // NFD bỏ dấu, đ→d, lower, gộp khoảng trắng, trim
```

```tsx
<SearchField id label placeholder: Variant value onChange />        // <label for>, input type="search", icon kính lúp desktop, min-h-12
<ReadingProgress label targetId />                                   // sticky top-0, 3px accent, role=progressbar, rAF, cập nhật theo vị trí của #targetId
<TableOfContents label title items={{id,title}[]} />                 // nav aria-label; IntersectionObserver đánh dấu aria-current="true"; viền trái 2px accent
<ShareButtons copy={StoriesCopyView['detail']['share']} />          // desktop: 3 nút vuông 44 (icon link, "Fb", "Zl", aria-label); mobile: 3 nút flex-1 min-h-12 có chữ; vùng aria-live báo kết quả (R9)
<FilterableList<T>
  items={T[]} getKey getCategory: (t)=>string|null getSearchText?: (t)=>string
  filters={{key,label}[]} filterLabel: Variant
  search?: { id, label, placeholder: Variant }
  pageSize?: number  more?: { label, done }
  status: (shown: T[]) => Variant                                     // chữ của role="status"
  empty: ReactNode  renderItem: (t, index) => ReactNode  listClassName
/>
```

- [ ] **Step 1: Test unit.**
  - **`normalizeSearch`:** `normalizeSearch('Chuyện về TRẠNG Chiếu ')` ra `'chuyen ve trang chieu'`; `'Đồng'` ra `'dong'`.
  - **FilterableList:**
    - mặc định hiện hết, giới hạn bởi `pageSize`;
    - bấm chip đổi `aria-pressed` và lọc;
    - gõ "trang chieu" chỉ còn bài khớp;
    - 0 kết quả hiện `empty`;
    - `role="status"` cập nhật;
    - "Xem thêm" thêm `pageSize` mục, hết thì `aria-disabled="true"` kèm chữ `done`.
  - **TableOfContents:** mock `IntersectionObserver`; mục giao cắt nhận `aria-current`.
  - **ReadingProgress:** đặt `scrollY` và kích thước mock thì `aria-valuenow` đúng (0, 50, 100, kẹp trong khoảng).
  - **ShareButtons:**
    - mock `navigator.clipboard.writeText`; bấm Sao chép gọi hàm với `location.href` và hiện chữ `copied`;
    - Facebook gọi `window.open` với URL `sharer.php?u=` đã encode;
    - Zalo: không có `navigator.share` thì sao chép và hiện `zaloFallback`.
- [ ] **Step 2: Chạy test, thấy FAIL.**
- [ ] **Step 3: Cài đặt.**
  - `FilterableList` dùng `FilterChips` cho chip và `EmptyState` cho trạng thái trống do nơi gọi truyền vào. Không tự viết lại chip.
  - Mobile: chip là dải vuốt ngang (FilterChips đã có).
  - Không có JS: server render mọi mục của trang đầu với chip "Tất cả".
- [ ] **Step 4: `/styleguide`.** Thêm mục cho cả 5 component.
- [ ] **Step 5: Chạy test.** Lint và unit phải PASS.
- [ ] **Step 6: Commit**

  ```
  git commit -m "feat(ui): FilterableList, SearchField, ReadingProgress, TableOfContents, ShareButtons"
  ```

### Task 5: Trang `/cau-chuyen`

**Files:**
- Create: `src/app/(frontend)/cau-chuyen/page.tsx`, `src/components/stories/StoriesView.tsx`, `tests/unit/stories/stories-view.test.tsx`, `tests/e2e/stories.e2e.spec.ts`
- Modify: `src/components/content/StoryCard.tsx` (nếu cần biến thể `hero` cho bài nổi bật)

**Interfaces:** Consumes `StoriesPageView` (Task 1), `FilterableList`/`SearchField` (Task 4), `PageHeader`, `StoryCard`, `ThreadsDivider`.

Bố cục theo artboard:
- **Đầu trang:** `PageHeader` với eyebrow có gạch, h1 76/38.
  - Desktop đặt ô tìm kiếm ở cột phải, `aside` rộng 360.
  - Mobile: lead (chỉ mobile, R12), rồi ô tìm kiếm phía trên chip.
- **Bài nổi bật (desktop):** bài đầu tiên có `hasDetail`. Thẻ lưới 7/4:
  - ảnh cao 520;
  - eyebrow "BÀI NỔI BẬT · {CHỦ ĐỀ}" cùng tag trạng thái;
  - tiêu đề 52px;
  - sapo serif 19px;
  - dòng meta theo `featured.meta`, chỉ khi có `sourceCount` và `readingMinutes`;
  - CTA.

  Mobile không có khối này. Không có bài nào có trang chi tiết thì không render khối này.
- **`ThreadsDivider`.**
- **`FilterableList`:**
  - lưới 3 cột, khoảng cách hàng 56 (mobile 1 cột, khoảng cách 28);
  - thẻ `StoryCard variant="grid"`: ảnh 280 (mobile 210), tiêu đề 28 (mobile 24), mobile không có CTA;
  - `pageSize` 9.
- **Link thẻ:** `hasDetail` thì `/cau-chuyen/{slug}`. Thẻ idea theo R21: `StoryCard` thêm prop `href?: string`; không có `href` thì render `<article>` và bỏ CTA.

- [ ] **Step 1: Test unit `StoriesView`.**
  - Có h1.
  - Bài nổi bật là bài `hasDetail` đầu tiên.
  - Thẻ idea không phải `<a>`.
  - Đếm "6 bài" ở public. Preview có "· 1 bản nháp".
  - Không có bài nào thì hiện `EmptyState`.
- [ ] **Step 2: Chạy test, thấy FAIL.** Sau đó cài đặt `StoriesView` và `page.tsx`:
  - `generateMetadata` lấy title từ intro;
  - `getMode()` rồi `getStoriesPage()`.
- [ ] **Step 3: E2E `tests/e2e/stories.e2e.spec.ts`** (preview login theo helper, cộng một ca public ở :3100):
  - bấm chip "Lịch sử" chỉ còn 1 thẻ, đổi `aria-pressed`;
  - gõ "trang chieu" ra 1 kết quả;
  - gõ "zzz" hiện "Chưa có bài trong chủ đề này";
  - 390px không cuộn ngang;
  - axe không có lỗi serious/critical.
- [ ] **Step 4: Kiểm tra.** Lint, unit, e2e trang này và `npm run build` phải PASS. Chụp 1440 và 390, so với `StoriesIndex.jpg` và `StoriesMobile.jpg`.
- [ ] **Step 5: Commit**

  ```
  git commit -m "feat(stories): trang danh sách Câu chuyện"
  ```

### Task 6: Trang `/cau-chuyen/[slug]`

**Files:**
- Create: `src/app/(frontend)/cau-chuyen/[slug]/page.tsx`, `src/components/stories/StoryView.tsx`, `tests/unit/stories/story-view.test.tsx`
- Modify: `tests/e2e/stories.e2e.spec.ts`

**Interfaces:** Consumes `StoryPageView`, `getStorySlugs`, `RichText`, `ReadingProgress`, `TableOfContents`, `ShareButtons`, `PullQuote`, `ReadNext`, `SourceList`, `Callout`/`VerifyNote`, `BackLink`, `Breadcrumb`.

Bố cục theo artboard StoryDetail và StoryMobile:
- `ReadingProgress` dính dưới header.
- **Đầu bài:**
  - desktop có breadcrumb ba cấp, mobile có `BackLink`;
  - chủ đề và tag "Bản nháp — cần thẩm định" (chỉ khi preview và chưa đăng);
  - h1 72/40, căn giữa trên desktop;
  - sapo serif nghiêng 22/18;
  - dòng meta, phần nào `null` thì bỏ cả dấu "·" đi kèm.
- **Ảnh bìa:** `priority`, cao 600/260. Chú thích theo R6.
- **Thân bài (desktop):**
  - lưới 12 cột: `aside` cột 1–2 (CHIA SẺ + mục lục), bài ở cột 4–9;
  - `RichText variant="article" dropCap`;
  - khung checklist preview (R6) ở cuối bài, dùng khung nét đứt chung (`VerifyNote` hoặc `Callout`; chọn một, không viết khung mới).
- **Thân bài (mobile):**
  - không có mục lục;
  - CHIA SẺ đặt sau khung checklist, trước "Ghi chú nguồn".
- **"Ghi chú nguồn":** `SourceList`, id `#nguon-n`, đặt ở cột 4–9.
  - Kiểu số "1." như artboard. Nếu khác `[n]` của `SourceList` thì thêm prop `numberStyle`, không viết khối mới.
- **`ReadNext`:** title "Đọc tiếp", action "Tất cả câu chuyện →" tới `/cau-chuyen`.
- **Route:**
  - `generateStaticParams` trả về `getStorySlugs()`.
  - `notFound()` khi view null.
  - `generateMetadata` lấy title và sapo. Ảnh OG chỉ đặt khi `cover` có, và ảnh đó đã qua lọc mode.

- [ ] **Step 1: Test unit `StoryView`.**
  - Có đúng một h1.
  - Mục lục có 4 link `#anchor`.
  - Dòng meta bỏ phần `null`.
  - Ở public (`reviewChecklist: null`) không có chữ "CẦN THẨM ĐỊNH".
  - Thẻ đọc tiếp thứ ba có `max-md:hidden`.
- [ ] **Step 2: Chạy test, thấy FAIL.** Sau đó cài đặt.
- [ ] **Step 3: E2E.**
  - Preview `/cau-chuyen/chuyen-ve-trang-chieu`:
    - bấm chú thích "2" nhảy tới `#nguon-2`;
    - cuộn xuống 50% thì `aria-valuenow` lớn hơn 0;
    - bấm mục lục "Truyền khẩu và sử liệu" thì heading vào khung nhìn và nhận `aria-current`;
    - nút Sao chép báo "Đã sao chép đường dẫn" (cấp quyền clipboard trong context).
  - Public (:3100): `/cau-chuyen/chuyen-ve-trang-chieu` và `/cau-chuyen/mot-ngay-o-lang-hoi` trả 404.
  - axe sạch ở 1440 và 390.
- [ ] **Step 4: Kiểm tra.** Lint, unit, e2e và build phải PASS. Chụp 1440 và 390, so với `StoryDetail.jpg` và `StoryMobile.jpg`.
- [ ] **Step 5: Commit**

  ```
  git commit -m "feat(stories): trang bài đọc có mục lục, tiến độ đọc, chú thích nguồn, chia sẻ"
  ```

### Task 7: Trang `/con-nguoi`

**Files:**
- Create: `src/app/(frontend)/con-nguoi/page.tsx`, `src/components/people/PeopleView.tsx`, `tests/unit/people/people-view.test.tsx`, `tests/e2e/people.e2e.spec.ts`
- Modify: `src/components/content/PortraitCard.tsx`

**Interfaces:** Consumes `PeoplePageView`, `FilterableList`, `PortraitCard`, `Callout tone="dark"`, `PageHeader`, `ThreadsDivider`, `EmptyState`, `Button`.

- **Đầu trang:** `PageHeader` với cột phải hẹp là `Callout tone="dark"` "NGUYÊN TẮC CHÂN DUNG".
  - Desktop là danh sách 3 ý, mobile là một đoạn.
  - Câu preview nằm dưới.
  - Mobile đặt khung này sau phần mở đầu, theo artboard.
- **`ThreadsDivider`.**
- **`FilterableList`:**
  - lưới 4 cột (mobile 2 cột, khoảng cách 12/24);
  - thẻ thứ 2 và thứ 4 của mỗi hàng desktop lùi xuống 48px (`md:mt-12` theo `index % 4`);
  - không có tìm kiếm và "Xem thêm".
- **`PortraitCard`:**
  - thêm prop `detail?: 'role' | 'note'` (mặc định `'role'`, giữ trang chủ); trang này dùng `'note'`;
  - nhãn "Chờ đồng ý" desktop có `StatusDot none` phía trước, theo artboard.
- **Khối mời** "Bạn biết một người giữ nghề?": nền `bg-secondary`, h2 44px, `Button` primary tới `/ket-noi`. Mobile không có khối này, theo artboard.

- [ ] **Step 1: Test unit `PeopleView`.**
  - Có 6 chip.
  - Lọc "Thế hệ trẻ" (seed không có ai) hiện "Chưa có chân dung trong nhóm này".
  - Đếm "8 chân dung · tất cả đang chờ đồng ý".
  - Public không có tên nào.
  - Thẻ index 1 và 3 có `md:mt-12`.
- [ ] **Step 2: Chạy test, thấy FAIL.** Sau đó cài đặt `page.tsx` và view.
- [ ] **Step 3: E2E.**
  - Lọc theo chip.
  - Trạng thái trống.
  - 390 không cuộn ngang.
  - axe sạch.
  - Public: không có `img` nào có `alt` khác rỗng trong lưới.
- [ ] **Step 4: Kiểm tra.** Lint, unit, e2e và build phải PASS. Chụp so với `PeopleIndex.jpg` và `PeopleMobile.jpg`.
- [ ] **Step 5: Commit**

  ```
  git commit -m "feat(people): trang danh sách Con người"
  ```

### Task 8: Trang `/con-nguoi/[slug]`

**Files:**
- Create: `src/app/(frontend)/con-nguoi/[slug]/page.tsx`, `src/components/people/PersonView.tsx`, `tests/unit/people/person-view.test.tsx`
- Modify: `tests/e2e/people.e2e.spec.ts`

**Interfaces:** Consumes `PersonPageView`, `NoteBanner`, `BackLink`, `Breadcrumb`, `FactList`, `RichText variant="story"`, `PullQuote variant="testimony"`, `PhotoEssay`, `ConsentPanel`, `ReadNext`, `ContentImage`, `DocumentLabel` (nếu khớp nhãn "CHÂN DUNG · 001"; nếu không thì dùng `Eyebrow`).

Bố cục theo artboard PersonDetail và PersonMobile:
1. `NoteBanner` (chỉ preview, R19).
2. Breadcrumb (desktop) hoặc `BackLink` (mobile).
3. **Ảnh chân dung:** cột 1–7, cao 760 (mobile tràn viền 440), `object-position` 22% 50%. Chú thích đè ở góc dưới trái theo `portraitCaption`.
4. **Cột 9–12:**
   - eyebrow là nhóm;
   - h1 (R16);
   - `FactList`: desktop 4 dòng, mobile 2 dòng (Vai trò, Năm làm nghề); dòng `null` thì bỏ ở public;
   - câu giới thiệu: `intro`, hoặc placeholder preview.
5. **Section "ĐỜI VÀ NGHỀ":**
   - desktop: tiêu đề ở cột 1–3, nội dung ở cột 5–10;
   - `storyParts[0]`, rồi `PullQuote` (lời trích, hoặc placeholder preview), rồi `storyParts[1]`;
   - khi không có story ở preview thì render ba mục placeholder của copy;
   - ở public, không có story và không có quote thì bỏ cả section.
6. **"Phóng sự ảnh":** `PhotoEssay`; không có ảnh thì bỏ.
7. `ConsentPanel`.
8. **`ReadNext`:** title "Liên quan", eyebrow mobile "LIÊN QUAN".

`generateStaticParams` trả về `getPersonSlugs()`. `generateMetadata` title là tên, hoặc "Chờ đồng ý" khi không có tên. **Không** đặt ảnh OG khi chân dung là `null`.

- [ ] **Step 1: Test unit `PersonView`.**
  - Public fixture không tên: h1 "Chờ đồng ý"; không có `img`; không có chữ "Mẫu trang"; có "Chưa có"; không có h2 "Câu chuyện" khi không có story và quote.
  - Preview fixture: có banner, có 3 placeholder mục, có "Phóng sự ảnh".
- [ ] **Step 2: Chạy test, thấy FAIL.** Sau đó cài đặt.
- [ ] **Step 3: E2E.**
  - **Public `/con-nguoi/mau-nghe-nhan`:**
    - trả 200;
    - h1 "Chờ đồng ý";
    - `page.content()` không chứa `nkc10` và không chứa alt của seed;
    - có "Trạng thái đồng ý".
  - Public `/con-nguoi/khong-co` trả 404.
  - **Preview:** có 2 ảnh phóng sự và thẻ "05 · …".
  - axe sạch ở 1440 và 390.
- [ ] **Step 4: Kiểm tra.** Lint, unit, e2e và build phải PASS. Chụp so với `PersonDetail.jpg` và `PersonMobile.jpg`.
- [ ] **Step 5: Commit**

  ```
  git commit -m "feat(people): trang chân dung ẩn/hiện theo đồng ý"
  ```

### Task 9: Rà soát cuối phase

**Files:** `tests/e2e/public-pages.e2e.spec.ts`, `docs/superpowers/backlog.md`, các file cần sửa nhỏ

- [ ] **Step 1: Cập nhật `public-pages.e2e.spec.ts`.**
  - Bỏ các giả định cũ "bài seed chưa có trang chi tiết" (backlog C Phase 3).
  - Thêm 4 route mới vào vòng kiểm "public không có ảnh chưa được phép" (regex ảnh tham khảo).
- [ ] **Step 2: Kiểm link trang chủ.**
  - Link `/cau-chuyen`, `/con-nguoi` và `/con-nguoi/{slug}` từ trang chủ không còn 404.
  - Thẻ idea ở trang chủ nay có nhãn "Chủ đề đề xuất" ở public (R2). Cập nhật test home nếu có assert ngược.
- [ ] **Step 3: Chạy đủ bộ kiểm.**

  ```
  lint, test:unit, test:int, build, test:e2e
  migrate trên DB trống
  ```

  Chụp 1440 và 390 cho 4 route, cả public lẫn preview, lưu vào scratchpad `phase5a-shots/`.
- [ ] **Step 4: Cập nhật backlog.**
  - Đánh dấu xong:
    - B "Renderer rich text bỏ cite…";
    - B "Rich text chưa có khối ảnh";
    - A "link 404" cho `/cau-chuyen` và `/con-nguoi`;
    - C Phase 4 `storyStatus`.
  - Thêm các mục còn mở của 5a.
- [ ] **Step 5: Commit**

  ```
  git commit -m "test(e2e): rà soát public cho Câu chuyện/Con người; backlog sau Phase 5a"
  ```
