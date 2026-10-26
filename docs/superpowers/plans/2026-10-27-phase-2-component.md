# Chiếu Hới — Phase 2: Component — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng bộ component giao diện dùng chung (nút, link, tiêu đề section, nhãn di sản, chú thích nguồn, các loại thẻ, bộ lọc, tab, trạng thái phản hồi) nhận view model của `src/lib/content`, cùng trang nội bộ `/styleguide` để xem mọi component ở 1440 và 390px.

**Architecture:** Component đặt trong `src/components/ui` (nguyên tố, không biết dữ liệu) và `src/components/content` (nhận view model, đổi `flags` thành nhãn). Phần lớn là server component. Chỉ `FilterChips` và `Tabs` là client component, và cả hai là component có kiểm soát (controlled): trang cha giữ state. `/styleguide` dùng dữ liệu mẫu cứng (fixture) lấy nguyên văn từ artboard, không gọi Payload, và trả 404 khi `APP_ENV === 'production'`.

**Tech Stack:** Node 22.23.4, Next 16.4 (App Router), React 19, Tailwind CSS 4.3 (token trong `@theme`), Vitest + @testing-library/react (jsdom), Playwright + @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-10-26-chieu-hoi-web-design.md`. Đọc kèm `CLAUDE.md`, `docs/HANDOFF.md` (mục "Danh mục component"), `design/source/Components.dc.html`, `design/screens/Components.jpg`.

## Global Constraints

- Mọi quy tắc trong `CLAUDE.md` áp dụng. Copy tiếng Việt lấy nguyên văn từ artboard. Không tự viết câu mới, trừ các chỗ ghi "Ruling" trong plan này.
- Màu, font, cỡ chữ chỉ dùng token Tailwind đã có trong `src/app/(frontend)/globals.css` (ví dụ `bg-accent`, `text-text-meta`, `font-display`, `text-h4`). Mã màu chỉ được viết thẳng khi artboard dùng một giá trị không có token (ghi rõ ở bước tương ứng).
- Bo góc 0 (trừ điểm hoa văn `rounded-full`), không bóng đổ, không gradient trang trí. Ngoại lệ là các hoạ tiết sợi cói đã có sẵn: `.threads` và `.check`.
- Chữ ≥ 12px. `font-display` (Noto Serif Display) chỉ dùng cho cỡ ≥ 20px. `decor-straw` không dùng cho chữ.
- Vùng chạm ≥ 44×44px (`min-h-11`). Focus dùng `:focus-visible` toàn cục đã có. Trên nền tối, đặt component trong `.bg-bg-inverse`, `.bg-bg-deep` hoặc `.bg-bg-ink` để viền focus đổi sang vàng.
- Chuyển động dùng `duration-[var(--dur-micro)]` hoặc `duration-[var(--dur-ui)]` với `ease-[var(--ease-weave)]`. Các token này đã về 0 khi người dùng bật giảm chuyển động. Skeleton dùng `motion-safe:animate-…`.
- Thẻ thật: `<a>`/`Link` cho điều hướng, `<button type="button">` cho hành động. Bộ lọc dùng `aria-pressed`. Tab dùng `role="tablist"`/`tab`/`tabpanel` và `aria-selected`.
- Component nội dung chỉ nhận kiểu từ `@/lib/content` (`ImageView`, `PersonView`, `StoryCardView`, `ProductCardView`, `SourceView`, `Flag`). Không import Payload trong `src/components`.
- Ảnh hiển thị qua `next/image`, `alt` lấy từ `ImageView.alt`. Ảnh trang trí dùng `alt=""`.
- Mỗi task kết thúc bằng `npm run lint`, `npm run test:unit` và một commit. Commit message kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Lệnh chạy qua `fnm exec --using=22.23.4 -- npm run …`.
- Làm trên nhánh `phase-2-component` tách từ `main`.

## Review Focus

1. **Thẻ của người chưa đồng ý hiện tên, `name === null`.** Thẻ vẫn có tên truy cập (accessible name) và không hiện chuỗi rỗng hay `null`. Nhãn "Chờ đồng ý" hiện ra. → Task 4, test `PortraitCard`.
2. **Thẻ có `image === null` / `cover === null` ở chế độ public.** Ô ảnh không vỡ bố cục. Sản phẩm hiện khung "ẢNH CẦN CHỤP", câu chuyện ẩn hẳn khối ảnh. → Task 4, Task 5.
3. **Bàn phím trên Tabs:** mũi tên trái/phải chuyển tab và đưa focus theo, Home/End nhảy về đầu/cuối, chỉ tab đang chọn có `tabIndex=0`. → Task 6.
4. **`/styleguide` khi `APP_ENV=production` hoặc biến bị thiếu/viết sai.** Trả 404. Chỉ `development` và `staging` mở được trang. → Task 8, test `isStyleguideEnabled`.
5. **Mobile 390px:** dải bộ lọc vuốt ngang được và không làm trang cuộn ngang. Mọi nút ≥ 44px. → Task 6 (class) và Task 8 (e2e kiểm `scrollWidth`).

---

## Cấu trúc file

```
src/components/ui/Button.tsx           Button (primary | secondary | outline-dark), dạng link hoặc nút
src/components/ui/LinkArrow.tsx        link "… →" nền sáng / nền tối
src/components/ui/SectionHeading.tsx   eyebrow + h2 + ghi chú phải
src/components/ui/FilterChips.tsx      'use client' — nhóm nút aria-pressed
src/components/ui/Tabs.tsx             'use client' — tablist gạch chân / chia ô
src/components/ui/Feedback.tsx         Skeleton, EmptyState, ErrorState, SuccessState
src/components/content/labels.ts       hàm thuần: flag → nhãn
src/components/content/Tag.tsx         nhãn nhỏ (dashed | filled | overlay)
src/components/content/DocumentLabel.tsx  DocumentLabel, ArchiveChip
src/components/content/VerifyNote.tsx
src/components/content/ShotNeeded.tsx
src/components/content/Sources.tsx     FootnoteRef, SourceList
src/components/content/ContentImage.tsx
src/components/content/PortraitCard.tsx
src/components/content/StoryCard.tsx   featured | grid | compact
src/components/content/ObjectCard.tsx  ExhibitCard, ProductCard
src/components/styleguide/fixtures.ts  view model mẫu (nguyên văn artboard)
src/components/styleguide/enabled.ts   isStyleguideEnabled(env)
src/app/(frontend)/styleguide/page.tsx
src/app/(frontend)/styleguide/Demos.tsx 'use client' — demo FilterChips/Tabs có state
tests/unit/components/*.test.tsx
tests/e2e/styleguide.e2e.spec.ts
```

---

### Task 1: Nguyên tố — Button, LinkArrow, SectionHeading

**Files:**
- Modify: `vitest.config.mts` (thêm `tests/unit/**/*.test.tsx` vào `include`)
- Create: `src/components/ui/{Button,LinkArrow,SectionHeading}.tsx`
- Test: `tests/unit/components/primitives.test.tsx`

**Interfaces:**
- Produces:
  - `Button(props: { variant?: 'primary' | 'secondary' | 'outline-dark'; href?: string; icon?: 'play'; disabled?: boolean; type?: 'button' | 'submit'; onClick?: () => void; children: ReactNode })`. Có `href` thì render `next/link`, không có thì render `<button>` (mặc định `type="button"`). `disabled` chỉ áp cho `<button>`.
  - `LinkArrow(props: { href: string; tone?: 'light' | 'dark'; children: ReactNode })`. Mũi tên ` →` nằm trong component, `children` không chứa mũi tên.
  - `SectionHeading(props: { eyebrow?: string; title: ReactNode; note?: ReactNode; as?: 'h2' | 'h3'; id?: string; tone?: 'light' | 'dark' })`

- [ ] **Step 1: Viết test hỏng**

```tsx
it('Button có href render thẻ a, không có href render button type=button', () => {
  render(<><Button href="/lang-hoi">Khám phá làng nghề</Button><Button>Gửi</Button></>)
  expect(screen.getByRole('link', { name: 'Khám phá làng nghề' }).getAttribute('href')).toBe('/lang-hoi')
  expect(screen.getByRole('button', { name: 'Gửi' }).getAttribute('type')).toBe('button')
})
it('Button disabled', () => {
  render(<Button disabled>Đang gửi...</Button>)
  expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
})
it('Button secondary có icon play aria-hidden', () => {
  const { container } = render(<Button variant="secondary" icon="play" href="#">Nghe chuyện làng Hới</Button>)
  expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
})
it('LinkArrow thêm mũi tên', () => {
  render(<LinkArrow href="/lang-hoi">Đọc về làng Hới</LinkArrow>)
  expect(screen.getByRole('link').textContent).toBe('Đọc về làng Hới →')
})
it('SectionHeading: eyebrow, h2, ghi chú', () => {
  render(<SectionHeading eyebrow="LÀNG HỚI" title="Có một làng Hới..." note="Ghi chú" />)
  expect(screen.getByRole('heading', { level: 2, name: 'Có một làng Hới...' })).toBeTruthy()
  expect(screen.getByText('LÀNG HỚI')).toBeTruthy()
  expect(screen.getByText('Ghi chú')).toBeTruthy()
})
```

- [ ] **Step 2:** Chạy `npm run test:unit -- tests/unit/components/primitives.test.tsx`. Kết quả mong đợi: FAIL vì chưa có module.

- [ ] **Step 3: Viết component.** Giá trị lấy từ `Components.dc.html`, mục "Nút & link":
  - primary: `min-h-[52px] px-7 bg-accent text-on-accent text-[15px] font-medium`, hover `bg-accent-hover`, active `bg-accent-press`, disabled `bg-[#D9CDB8] text-[#3E3B35]` (artboard dùng giá trị không có token).
  - secondary: `min-h-11 gap-3 text-[15px] font-medium text-text-primary`, icon tròn 36px (SVG `circle r=17` + tam giác play, nét 1.2) lấy nguyên từ artboard.
  - outline-dark: `min-h-12 px-[22px] border border-text-on-dark text-text-on-dark text-[15px]`.
  - LinkArrow: `min-h-11 inline-flex items-center text-[15px] font-medium`. Nền sáng dùng `text-accent`, hover `text-accent-hover underline decoration-2 underline-offset-4`. Nền tối dùng `text-accent-on-dark`.
  - SectionHeading: eyebrow `text-eyebrow font-semibold tracking-[.24em] text-accent` (nền tối dùng `text-accent-on-dark`), tiêu đề `font-display font-normal text-h2 leading-[1.1]`, ghi chú `text-small text-text-muted max-w-[340px] md:text-right`. Desktop: tiêu đề bên trái, ghi chú bên phải, căn đáy (`md:flex md:justify-between md:items-end`). Mobile: xếp dọc.

- [ ] **Step 4:** Chạy lại test, kết quả mong đợi: PASS. Chạy `npm run lint`.
- [ ] **Step 5:** Commit `feat(ui): Button, LinkArrow, SectionHeading`.

---

### Task 2: Nhãn di sản — labels, Tag, DocumentLabel, ArchiveChip, VerifyNote, ShotNeeded

**Files:**
- Create: `src/components/content/{labels.ts,Tag.tsx,DocumentLabel.tsx,VerifyNote.tsx,ShotNeeded.tsx}`
- Modify: `src/app/(frontend)/globals.css` (thêm lớp `.weave`)
- Ghi chú: các nhãn preview không cần prop `mode`. Lớp `lib/content` chỉ gắn flag `unpublished`, `idea`, `rights-not-permitted`, `unverified` ở chế độ preview, nên ở public `flags` rỗng và component không hiện gì thêm.
- Test: `tests/unit/components/labels.test.tsx`

**Interfaces:**
- Consumes: `Flag`, `StoryCardView`, `ProductCardView` từ `@/lib/content` (`typeConfirmed` trên `ProductCardView` được thêm ở Task 4; ở task này viết hàm theo field đó và đặt kiểu tham số là `Pick<ProductCardView, 'image'> & { typeConfirmed: boolean }`).
- Produces:
  - `storyStatus(flags: Flag[]): 'Bản nháp' | 'Chủ đề đề xuất' | null`. Có `'idea'` thì trả "Chủ đề đề xuất", ngược lại có `'unpublished'` thì trả "Bản nháp", còn lại trả `null`.
  - `productTag(p: { image: unknown | null; typeConfirmed: boolean }): { text: 'Ảnh cần xác nhận loại' | 'Chưa có ảnh'; style: 'filled' | 'dashed' } | null`. Không có ảnh thì trả "Chưa có ảnh"/dashed. Có ảnh mà chưa xác nhận thì trả "Ảnh cần xác nhận loại"/filled. Có ảnh và đã xác nhận thì trả `null`.
  - `previewNotes(flags: Flag[]): string[]`. Nhãn phụ chỉ dùng ở chế độ preview: `'rights-not-permitted'` → "Ảnh chưa được phép đăng", `'unverified'` → "[cần xác minh]". **Ruling (Claude):** artboard không có chữ cho trường hợp ảnh chưa được phép. Câu này chỉ hiện ở bản preview, không bao giờ hiện ở public. Người dùng có thể đổi.
  - `Tag(props: { variant: 'dashed' | 'filled' | 'overlay'; children: ReactNode })`
  - `DocumentLabel(props: { code: string; title: string; meta: string })`. `code` hiển thị theo mẫu `TƯ LIỆU · 001`.
  - `ArchiveChip(props: { code: string; category: string })`. Hiển thị `TL · 021 · LÀNG QUÊ`.
  - `VerifyNote(props: { children: ReactNode; size?: 'md' | 'sm' })`
  - `ShotNeeded(props: { description: string; tone?: 'light' | 'dark'; className?: string })`

- [ ] **Step 1: Viết test hỏng**

```tsx
it('storyStatus', () => {
  expect(storyStatus(['unpublished', 'idea'])).toBe('Chủ đề đề xuất')
  expect(storyStatus(['unpublished'])).toBe('Bản nháp')
  expect(storyStatus([])).toBeNull()
})
it('productTag', () => {
  expect(productTag({ image: null, typeConfirmed: false })).toEqual({ text: 'Chưa có ảnh', style: 'dashed' })
  expect(productTag({ image: {}, typeConfirmed: false })).toEqual({ text: 'Ảnh cần xác nhận loại', style: 'filled' })
  expect(productTag({ image: {}, typeConfirmed: true })).toBeNull()
})
it('previewNotes', () => {
  expect(previewNotes(['rights-not-permitted', 'unverified', 'unpublished'])).toEqual(['Ảnh chưa được phép đăng', '[cần xác minh]'])
})
it('ArchiveChip in hoa chủ đề', () => {
  render(<ArchiveChip code="021" category="Làng quê" />)
  expect(screen.getByText('TL · 021 · LÀNG QUÊ')).toBeTruthy()
})
it('ShotNeeded có tiêu đề ẢNH CẦN CHỤP và mô tả', () => {
  render(<ShotNeeded description="Chiếu trơn chụp phẳng" />)
  expect(screen.getByText('ẢNH CẦN CHỤP')).toBeTruthy()
  expect(screen.getByText('Chiếu trơn chụp phẳng')).toBeTruthy()
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ artboard:
  - Tag dashed: `text-[12px] px-2 py-[3px] border border-dashed border-text-muted text-text-secondary`. Tag filled: `bg-bg-secondary` thay cho viền. Tag overlay ("Chờ đồng ý" trên ảnh): `bg-[rgba(243,235,221,.94)] px-2.5 py-[5px] text-[12px] font-semibold text-text-secondary`, có chấm tròn 8px viền `1.5px dashed` (`rounded-full`, `aria-hidden`).
  - DocumentLabel: `bg-bg-raised border border-border-subtle px-4 py-3.5`. Mã `text-[12px] tracking-[.2em] font-semibold text-text-muted`, tiêu đề `font-serif text-[16px]`, meta `text-[13px] text-text-secondary leading-[1.45]`.
  - ArchiveChip: `bg-bg-deep text-text-on-dark px-3 py-2.5 text-[12px] tracking-[.12em]`.
  - VerifyNote md: `border border-dashed border-border-dashed px-[18px] py-3.5 text-[14px] leading-[1.6] text-text-secondary`. Bản sm: `px-3.5 py-3 text-[13px] leading-[1.55]`. Đây là khung `<p>`, chữ bên trong do nơi gọi truyền vào (ví dụ "[CẦN XÁC MINH] Đoạn giới thiệu lịch sử làng Hới.").
  - ShotNeeded light (ô ảnh sản phẩm): nền hoạ tiết sợi `.weave`, thêm vào `globals.css` cạnh `.threads` và chép nguyên giá trị từ `ProductsIndex.dc.html`: `background-color:#D7C59E; background-image: repeating-linear-gradient(90deg, rgba(40,39,36,.10) 0 2px, transparent 2px 9px), repeating-linear-gradient(0deg, rgba(243,235,221,.35) 0 3px, transparent 3px 7px)`. Bên trong có ô `bg-bg-primary px-3.5 py-2.5 text-[13px] leading-[1.5]`, dòng đầu `<strong>` "ẢNH CẦN CHỤP" (`font-semibold tracking-[.1em]`), xuống dòng rồi tới mô tả. ShotNeeded dark (sân khấu công đoạn): `border border-dashed border-[rgba(243,235,221,.45)]`, eyebrow "ẢNH CẦN CHỤP" `text-accent-on-dark`, mô tả `font-display text-[28px] leading-[1.3] max-w-[440px]`. Cả hai biến thể đều là khối `role="img"` có `aria-label` = `Ảnh cần chụp: ${description}`.
- [ ] **Step 4:** Chạy test, kết quả mong đợi: PASS. Chạy lint.
- [ ] **Step 5:** Commit `feat(content): nhãn di sản và trạng thái`.

---

### Task 3: Chú thích nguồn — FootnoteRef, SourceList

**Files:**
- Create: `src/components/content/Sources.tsx`
- Test: `tests/unit/components/sources.test.tsx`

**Interfaces:**
- Consumes: `SourceView` (`id`, `publisher`, `title`, `url`, `date`).
- Produces:
  - `sourceNumbers(sources: SourceView[]): Map<string, number>`. Đánh số 1..n theo thứ tự mảng.
  - `FootnoteRef(props: { n: number })`. Render `<a href="#nguon-${n}" class="fn" aria-label="Nguồn ${n}">${n}</a>` (chữ lên cao: `align-super`).
  - `SourceList(props: { sources: SourceView[]; headingId?: string; title?: string })`. Mặc định `title = 'Nguồn tham khảo'`. Render `<section aria-labelledby>` + `<h2>` + `<ol>`. Mỗi `<li id="nguon-${n}">` gồm số `[n]` và dòng nội dung `publisher · <a href=url>title</a> · date`. Phần nào `null` thì bỏ cả phần đó lẫn dấu ` · ` đi kèm. `url` null thì title là chữ thường, không phải link.

- [ ] **Step 1: Viết test hỏng**

```tsx
const S: SourceView[] = [
  { id: 'vnp', publisher: 'Vietnam+', title: 'Giữ hồn nghề dệt chiếu cói làng Hới giữa nhịp sống hiện đại', url: 'https://www.vietnamplus.vn/x', date: '14/08/2026' },
  { id: 'nourl', publisher: null, title: 'Lời kể người làng', url: null, date: null },
]
it('SourceList đánh số và id neo', () => {
  const { container } = render(<SourceList sources={S} />)
  expect(screen.getByRole('heading', { level: 2, name: 'Nguồn tham khảo' })).toBeTruthy()
  expect(container.querySelector('#nguon-1')?.textContent).toBe('[1]Vietnam+ · Giữ hồn nghề dệt chiếu cói làng Hới giữa nhịp sống hiện đại · 14/08/2026')
  expect(container.querySelector('#nguon-2')?.textContent).toBe('[2]Lời kể người làng')
  expect(screen.queryAllByRole('link')).toHaveLength(1)
})
it('FootnoteRef trỏ tới nguồn', () => {
  render(<FootnoteRef n={2} />)
  const a = screen.getByRole('link', { name: 'Nguồn 2' })
  expect(a.getAttribute('href')).toBe('#nguon-2')
})
it('sourceNumbers', () => {
  expect(sourceNumbers(S).get('nourl')).toBe(2)
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ `VillagePage.dc.html` và `StoryDetail.dc.html`:
  - Desktop: lưới 12 cột, tiêu đề `col-span-3 font-display text-h4`, `<ol>` `col-start-5 col-span-8 text-[15px] leading-[1.6]`. Mỗi `<li>` là lưới `40px 1fr` với `py-3.5`. Mục đầu có `border-t border-border-strong`, các mục sau `border-t border-[rgba(40,39,36,.2)]`. Số `[n]` `text-text-meta font-semibold`.
  - Mobile: tiêu đề `text-[24px]`, `<li>` dạng `<p>` với `py-3 text-[14px] leading-[1.55]` (xếp dọc, không chia lưới).
  - `.fn`: `font-sans text-[13px] font-semibold text-text-meta no-underline align-super ml-1`, có `min-w` đủ để bấm.

    **Ruling (Claude):** chữ 13px nằm trên dòng không thể đạt 44px. Để vùng chạm đủ 44px, dùng pseudo-element `before:absolute before:-inset-3` và đặt `relative` trên thẻ. Giao diện nhìn thấy không đổi.
- [ ] **Step 4:** Chạy test, kết quả mong đợi: PASS. Chạy lint.
- [ ] **Step 5:** Commit `feat(content): chú thích nguồn`.

---

### Task 4: ContentImage, PortraitCard, `typeConfirmed` trên thẻ sản phẩm

**Files:**
- Create: `src/components/content/{ContentImage,PortraitCard}.tsx`
- Modify: `src/lib/content/types.ts` (chuyển `typeConfirmed: boolean` từ `ProductView` sang `ProductCardView`), `src/lib/content/queries.ts` (thẻ sản phẩm trả `typeConfirmed`), `next.config.ts` (thêm `localPatterns` `{ pathname: '/images/reference/**' }` cho styleguide ở dev)
- Test: `tests/unit/components/portrait.test.tsx`, bổ sung một assertion vào test int content hiện có cho `getProducts` (mỗi thẻ có `typeConfirmed` kiểu boolean)

**Interfaces:**
- Consumes: `ImageView`, `PersonView`, `ProductCardView`.
- Produces:
  - `ContentImage(props: { image: ImageView; size?: 'thumb' | 'card' | 'wide' | 'full'; sizes?: string; className?: string; priority?: boolean; objectPosition?: string })`. Lấy `src = image.sizes[size] ?? image.url`, dùng `next/image` với `width`/`height` của ảnh. Có `className` thì đặt `object-cover w-full`. Ở chế độ preview: nếu `previewNotes(image.flags)` khác rỗng thì phủ một `Tag variant="overlay"` ở góc dưới trái ảnh.
  - `PortraitCard(props: { person: PersonView; href: string; size?: 'lg' | 'sm' })`
  - `ProductCardView.typeConfirmed: boolean`

- [ ] **Step 1: Viết test hỏng**

```tsx
const base: PersonView = { slug: 'nghe-nhan-1', category: 'Nghệ nhân', role: 'Dệt chiếu tay', name: null, portrait: null, quote: null, consentPending: true, flags: [] }
it('chưa đồng ý: có nhãn Chờ đồng ý, không in null, link vẫn có tên', () => {
  const { container } = render(<PortraitCard person={base} href="/con-nguoi/nghe-nhan-1" />)
  expect(screen.getAllByText('Chờ đồng ý').length).toBeGreaterThan(0)
  expect(container.textContent).not.toContain('null')
  const link = screen.getByRole('link')
  expect(link.getAttribute('href')).toBe('/con-nguoi/nghe-nhan-1')
  expect(link.textContent).toContain('Xem chân dung →')
  expect(link.textContent).toContain('NGHỆ NHÂN')
})
it('đã đồng ý: hiện tên, không có nhãn', () => {
  render(<PortraitCard person={{ ...base, name: 'Bà A', consentPending: false }} href="#" />)
  expect(screen.getByText('Bà A')).toBeTruthy()
  expect(screen.queryByText('Chờ đồng ý')).toBeNull()
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ `PeopleIndex.dc.html` và `PeopleMobile.dc.html`:
  - Cả thẻ là một `<Link>` (`flex flex-col gap-3 text-text-primary no-underline`). Khi hover, ảnh mờ còn 88% (`group-hover:opacity-[.88]`, `transition-opacity`) và CTA gạch chân `underline-offset-4`.
  - Ảnh cao 380px (lg) hoặc 220px (sm). `objectPosition` lấy từ prop.
  - `portrait === null`: hiện khung `bg-bg-secondary` cùng chiều cao, `aria-hidden`. **Ruling (Claude):** artboard luôn có ảnh. Với trường hợp không có ảnh, dùng khung trống và giữ nhãn "Chờ đồng ý".
  - `consentPending` thì hiện `Tag variant="overlay"` "Chờ đồng ý" ở `left-3 top-3` (sm: `left-1.5 top-1.5`, không có chấm).
  - Eyebrow là `category.toUpperCase()` (`text-[12px] tracking-[.16em] font-semibold text-text-meta`). Tên dùng `font-display text-[24px] leading-[1.2]` (sm: 19px). Dòng ghi chú là `role` (`text-[14px] leading-[1.55] text-text-secondary`). CTA "Xem chân dung →" `text-[15px] font-medium text-accent`, chỉ có ở lg.
  - `name === null`: không render dòng tên. **Ruling (Claude):** không in placeholder kiểu "[Tên nghệ nhân]" ở bản công khai. Tên truy cập của link vẫn có nhờ eyebrow, vai trò và CTA.
  - Preview: hiện thêm `previewNotes(person.flags)` dưới dạng `Tag variant="dashed"`.
- [ ] **Step 4:** Chạy `npm run test:unit` (PASS) và `npm run test:int` (PASS, gồm cả assertion `typeConfirmed`). Chạy lint và `npm run build` (đổi `next.config.ts` và type nên cần build để kiểm).
- [ ] **Step 5:** Commit `feat(content): ContentImage, PortraitCard; typeConfirmed trên thẻ sản phẩm`.

---

### Task 5: StoryCard và ObjectCard

**Files:**
- Create: `src/components/content/{StoryCard,ObjectCard}.tsx`
- Test: `tests/unit/components/cards.test.tsx`

**Interfaces:**
- Consumes: `StoryCardView`, `ProductCardView` (đã có `typeConfirmed`), `ContentImage`, `Tag`, `ShotNeeded`, `storyStatus`, `productTag`.
- Produces:
  - `StoryCard(props: { story: StoryCardView; href: string; variant: 'featured' | 'grid' | 'compact' })`
  - `ProductCard(props: { product: ProductCardView; href: string })`
  - `ExhibitCard(props: { index: number; name: string; href?: string; active?: boolean })`. Thẻ "HIỆN VẬT 0n".

- [ ] **Step 1: Viết test hỏng**

```tsx
const story: StoryCardView = { slug: 'chuyen-ve-trang-chieu', title: 'Chuyện về Trạng Chiếu', sapo: 'Mô tả ngắn', category: 'Lịch sử', cover: null, readingMinutes: null, hasDetail: true, flags: ['unpublished'] }
it('StoryCard grid: nhãn Bản nháp, CTA Đọc bài →, không có ảnh thì không có img', () => {
  const { container } = render(<StoryCard story={story} href="/cau-chuyen/chuyen-ve-trang-chieu" variant="grid" />)
  expect(screen.getByText('Bản nháp')).toBeTruthy()
  expect(screen.getByText('LỊCH SỬ')).toBeTruthy()
  expect(screen.getByText('Đọc bài →')).toBeTruthy()
  expect(container.querySelector('img')).toBeNull()
})
it('StoryCard chủ đề đề xuất: CTA Xem đề cương →', () => {
  render(<StoryCard story={{ ...story, hasDetail: false, flags: ['unpublished', 'idea'] }} href="#" variant="grid" />)
  expect(screen.getByText('Chủ đề đề xuất')).toBeTruthy()
  expect(screen.getByText('Xem đề cương →')).toBeTruthy()
})
it('StoryCard featured có số phút đọc khi có', () => {
  render(<StoryCard story={{ ...story, readingMinutes: 6, flags: [] }} href="#" variant="featured" />)
  expect(screen.getByText('LỊCH SỬ · 6 PHÚT ĐỌC')).toBeTruthy()
})
const product: ProductCardView = { slug: 'chieu-tron', code: 'HIỆN VẬT 01', name: 'Chiếu trơn', group: 'traditional', summary: null, image: null, typeConfirmed: false, flags: [] }
it('ProductCard không ảnh: khung ẢNH CẦN CHỤP + nhãn Chưa có ảnh', () => {
  render(<ProductCard product={product} href="/san-pham/chieu-tron" />)
  expect(screen.getByText('ẢNH CẦN CHỤP')).toBeTruthy()
  expect(screen.getByText('Chưa có ảnh')).toBeTruthy()
  expect(screen.getByRole('link').getAttribute('href')).toBe('/san-pham/chieu-tron')
})
it('ExhibitCard active', () => {
  const { container } = render(<ExhibitCard index={4} name="Chiếu cạp điều" active />)
  expect(screen.getByText('HIỆN VẬT 04')).toBeTruthy()
  expect(container.firstElementChild?.className).toContain('border-accent')
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ `Components.dc.html`, `StoriesIndex.dc.html`, `ProductsIndex.dc.html`:
  - Cả ba loại thẻ đều là một link, hover giống PortraitCard.
  - Eyebrow câu chuyện là `category.toUpperCase()`, cộng thêm ` · ${readingMinutes} PHÚT ĐỌC` khi `readingMinutes` khác null (`text-[12px] tracking-[.16em] font-semibold text-text-meta`). Nhãn trạng thái: "Bản nháp" dùng Tag dashed, "Chủ đề đề xuất" dùng Tag filled, đặt cạnh eyebrow.
  - featured: ảnh cao 260px, tiêu đề `font-display text-[32px] leading-[1.2]`, sapo `font-serif text-[16px] leading-[1.65] text-text-secondary`.
  - grid: ảnh cao 280px, tiêu đề `text-[28px]`, sapo `text-[15px] leading-[1.6]`. CTA là "Đọc bài →" khi `hasDetail`, ngược lại "Xem đề cương →".
  - compact: lưới `120px 1fr`, `gap-4 pb-5 border-b border-border-subtle`, ảnh 120×150, tiêu đề `text-[24px] leading-[1.25]`, CTA "Đọc bài →" `text-[14px]`.
  - `cover === null` thì bỏ khối ảnh (compact thu về một cột).
  - ProductCard: ảnh cao 340px, `image === null` thì dùng `ShotNeeded` light với mô tả `${name} chụp phẳng, ánh sáng tự nhiên, kèm cận cảnh mặt dệt` (nguyên văn artboard). Dưới ảnh là hàng `pt-1 border-t border-border-strong`, bên trái mã (`text-[12px] tracking-[.2em] font-semibold text-text-muted-alt`), bên phải `productTag`. Tên dùng `font-display text-[24px]`, hover chuyển `text-accent`.
  - ExhibitCard: `pt-4 border-t border-border-strong`, active `border-t-[3px] border-accent` và tên `text-accent`. Nhãn `HIỆN VẬT ${String(index).padStart(2,'0')}` (`text-[12px] tracking-[.2em] font-semibold text-text-muted`), tên `font-display text-[24px]`.
  - Preview: mỗi thẻ hiện `previewNotes(flags)`.
- [ ] **Step 4:** Chạy test, kết quả mong đợi: PASS. Chạy lint.
- [ ] **Step 5:** Commit `feat(content): StoryCard, ProductCard, ExhibitCard`.

---

### Task 6: FilterChips và Tabs (client component)

**Files:**
- Create: `src/components/ui/{FilterChips,Tabs}.tsx`
- Test: `tests/unit/components/interactive.test.tsx`

**Interfaces:**
- Produces:
  - `FilterChips<K extends string>(props: { label: string; options: { key: K; label: string }[]; value: K; onChange: (k: K) => void; tone?: 'light' | 'dark' })`. Render `<div role="group" aria-label={label}>` gồm các `<button type="button" aria-pressed>`.
  - `Tabs<K extends string>(props: { label: string; tabs: { key: K; label: string; panel: ReactNode }[]; value: K; onChange: (k: K) => void; variant?: 'underline' | 'segmented' | 'responsive' })`. `responsive` (mặc định) nghĩa là segmented dưới 768px và underline từ 768px trở lên. `id` của tab và panel tạo bằng `useId()`. Chỉ panel đang chọn được render. Panel có `role="tabpanel"`, `aria-labelledby` và `tabIndex={0}`.

- [ ] **Step 1: Viết test hỏng**

```tsx
it('FilterChips: aria-pressed và gọi onChange', async () => {
  const onChange = vi.fn()
  render(<FilterChips label="Lọc theo chủ đề" options={[{ key: 'all', label: 'Tất cả' }, { key: 'ls', label: 'Lịch sử' }]} value="all" onChange={onChange} />)
  expect(screen.getByRole('group', { name: 'Lọc theo chủ đề' })).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Tất cả' }).getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(screen.getByRole('button', { name: 'Lịch sử' }))
  expect(onChange).toHaveBeenCalledWith('ls')
})
function TabsHarness() {
  const [v, setV] = useState<'hand' | 'machine' | 'compare'>('hand')
  return <Tabs label="Cách dệt" value={v} onChange={setV} tabs={[
    { key: 'hand', label: 'Dệt thủ công', panel: <p>P1</p> },
    { key: 'machine', label: 'Dệt bằng máy', panel: <p>P2</p> },
    { key: 'compare', label: 'So sánh', panel: <p>P3</p> }]} />
}
it('Tabs: roving tabindex, mũi tên, Home/End, panel liên kết', () => {
  render(<TabsHarness />)
  const tabs = screen.getAllByRole('tab')
  expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1])
  fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
  expect(screen.getByRole('tab', { name: 'Dệt bằng máy' }).getAttribute('aria-selected')).toBe('true')
  expect(document.activeElement?.textContent).toBe('Dệt bằng máy')
  expect(screen.getByRole('tabpanel').textContent).toBe('P2')
  fireEvent.keyDown(document.activeElement!, { key: 'End' })
  expect(document.activeElement?.textContent).toBe('So sánh')
  fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
  expect(document.activeElement?.textContent).toBe('Dệt thủ công')
  const panel = screen.getByRole('tabpanel')
  expect(panel.getAttribute('aria-labelledby')).toBe(document.activeElement?.id)
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ `Components.dc.html`, `StoriesIndex.dc.html`, `CraftMobile.dc.html`:
  - Chip: `min-h-11 px-[18px] text-[14px] inline-flex items-center`.
    - Nền sáng: đang chọn `bg-text-primary text-bg-primary border border-text-primary font-semibold`; mặc định `border border-[rgba(40,39,36,.35)]`, hover `border-text-primary`.
    - Nền tối: đang chọn `bg-bg-primary text-bg-deep font-semibold`; mặc định `border border-[rgba(243,235,221,.4)] text-text-on-dark`, hover `border-text-on-dark`. Container nền tối do nơi gọi đặt (`bg-bg-deep`).
    - Dưới 768px, nhóm chip là một dải vuốt ngang: `flex-nowrap overflow-x-auto`, chip `shrink-0`, nhóm có `max-w-full`. Từ 768px trở lên thì `flex-wrap`.
  - Tab underline: `role="tablist"` `flex gap-7 border-b border-border-subtle`. Tab `py-3 text-[15px] min-h-11`, đang chọn `font-semibold border-b-[3px] border-accent -mb-px`, chưa chọn `text-text-secondary`.
  - Tab segmented: tablist `flex border border-border-strong`, mỗi tab `flex-1 min-h-11 text-[14px] font-medium`, đang chọn `bg-text-primary text-bg-primary`.

    **Ruling (Claude):** artboard không ghi style cho ô đang chọn. Lấy theo chip đang chọn trên nền sáng cho thống nhất.
  - Bàn phím theo mẫu APG "tabs with automatic activation": ArrowLeft/ArrowRight vòng quanh, Home/End nhảy về đầu/cuối, chọn xong thì focus chuyển sang tab mới.
- [ ] **Step 4:** Chạy test, kết quả mong đợi: PASS. Chạy lint.
- [ ] **Step 5:** Commit `feat(ui): FilterChips, Tabs`.

---

### Task 7: Trạng thái phản hồi — Skeleton, EmptyState, ErrorState, SuccessState

**Files:**
- Create: `src/components/ui/Feedback.tsx`
- Modify: `src/app/(frontend)/globals.css` (thêm `@keyframes weave-pulse` cùng utility `--animate-weave-pulse` trong `@theme`)
- Test: `tests/unit/components/feedback.test.tsx`

**Interfaces:**
- Produces:
  - `Skeleton(props: { lines?: number; imageHeight?: number })`. Có `aria-hidden="true"`. Nơi dùng tự thêm chữ đọc màn hình "Đang tải" khi cần.
  - `EmptyState(props: { title: string; body: string; action?: { href: string; label: string } })`
  - `ErrorState(props: { title: string; body: string; retry?: { label: string; onClick?: () => void; href?: string } })`. Bọc trong `role="alert"`.
  - `SuccessState(props: { title: string; body: string })`. Bọc trong `role="status"`.

- [ ] **Step 1: Viết test hỏng**

```tsx
it('EmptyState với link hành động', () => {
  render(<EmptyState title="Chưa có tư liệu trong nhóm này" body="Nếu gia đình bạn còn giữ ảnh cũ của làng, hãy góp cùng chúng tôi." action={{ href: '/ket-noi', label: 'Góp một ký ức' }} />)
  expect(screen.getByRole('link', { name: 'Góp một ký ức →' }).getAttribute('href')).toBe('/ket-noi')
})
it('ErrorState role=alert, SuccessState role=status', () => {
  render(<><ErrorState title="Không tải được ảnh" body="x" /><SuccessState title="Cảm ơn bạn" body="y" /></>)
  expect(screen.getByRole('alert').textContent).toContain('Không tải được ảnh')
  expect(screen.getByRole('status').textContent).toContain('Cảm ơn bạn')
})
it('Skeleton ẩn khỏi trình đọc màn hình và dùng motion-safe', () => {
  const { container } = render(<Skeleton lines={3} />)
  const root = container.firstElementChild!
  expect(root.getAttribute('aria-hidden')).toBe('true')
  expect(root.innerHTML).toContain('motion-safe:animate-weave-pulse')
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ `Components.dc.html`, mục "Trạng thái phản hồi":
  - Skeleton: khối `bg-[#E3D7C1]` (artboard dùng giá trị không có token), cao `imageHeight ?? 200`. Các dòng cao 14 / 24 / 24px, rộng 40% / 85% / 60% (dòng thứ tư trở đi lặp lại 60%). Animation `weave-pulse` 1.6s ease-in-out vô hạn, opacity .55 → 1 → .55.
  - EmptyState: `border border-dashed border-border-dashed p-6 flex flex-col gap-3`, tiêu đề `font-display text-[24px]`, nội dung `text-[14px] leading-[1.6] text-text-secondary`, hành động dùng `LinkArrow`.
  - ErrorState: `border-t-[3px] border-accent bg-bg-raised p-6`. Tiêu đề `text-[17px] font-semibold text-accent`, có icon tròn có dấu chấm than (SVG lấy nguyên từ artboard, `aria-hidden`). Retry render thành link nếu có `href`, thành `<button>` nếu có `onClick`, kiểu chữ `text-[15px] font-medium`.
  - SuccessState: `bg-bg-inverse text-text-on-dark p-6`. Tiêu đề `font-display text-[24px]` kèm icon dấu tích `stroke` màu `--accent-on-dark`, nội dung `text-[14px] leading-[1.6] text-text-on-dark-muted`.
- [ ] **Step 4:** Chạy test, kết quả mong đợi: PASS. Chạy lint.
- [ ] **Step 5:** Commit `feat(ui): trạng thái phản hồi`.

---

### Task 8: Trang `/styleguide`, e2e và so ảnh chụp

**Files:**
- Create: `src/components/styleguide/{fixtures.ts,enabled.ts}`, `src/app/(frontend)/styleguide/{page.tsx,Demos.tsx}`
- Test: `tests/unit/styleguide-enabled.test.ts`, `tests/e2e/styleguide.e2e.spec.ts`

**Interfaces:**
- Consumes: mọi component của Task 1–7.
- Produces: `isStyleguideEnabled(env: string | undefined): boolean`. Trả `true` chỉ khi `env` là `'development'` hoặc `'staging'`.

- [ ] **Step 1: Viết test hỏng**

```ts
it('isStyleguideEnabled', () => {
  expect(isStyleguideEnabled('development')).toBe(true)
  expect(isStyleguideEnabled('staging')).toBe(true)
  for (const v of ['production', undefined, '', 'Production', 'dev']) expect(isStyleguideEnabled(v)).toBe(false)
})
```

Các test e2e (`tests/e2e/styleguide.e2e.spec.ts`), chạy ở 1440×900 và 390×844:
  - `GET /styleguide` trả 200. Trang có h1 "Component" và đủ các h2 "Nút & link", "Điều hướng", "Thẻ nội dung", "Thành phần di sản", "Bộ lọc, tab & phân trang", "Trạng thái phản hồi".
  - Axe không có vi phạm mức `serious` hoặc `critical` (`new AxeBuilder({ page }).analyze()`).
  - Bấm chip "Lịch sử" thì chip đó có `aria-pressed="true"`. Focus tab "Dệt thủ công" rồi nhấn `ArrowRight` thì tab "Dệt bằng máy" có `aria-selected="true"` và đang được focus.
  - Ở 390px: `document.documentElement.scrollWidth <= 390`, và mọi `a, button` nhìn thấy trong `main` có `getBoundingClientRect().height >= 44`. Bỏ qua thẻ `.fn` (đã nới vùng chạm bằng pseudo-element) và link nằm trong đoạn văn.
  - Có `<meta name="robots" content="noindex, nofollow">`.

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.**
  - `page.tsx`: `export const dynamic = 'force-dynamic'`. Nếu `!isStyleguideEnabled(process.env.APP_ENV)` thì gọi `notFound()`. `metadata.robots = { index: false, follow: false }`. Bố cục dùng breadcrumb "Trang chủ / Component", rồi tới tiêu đề nguyên văn artboard: eyebrow "HỆ THỐNG THIẾT KẾ · v0.1", h1 "Component" và đoạn mở đầu. Các section theo đúng thứ tự artboard, ngăn bằng `<div class="threads" aria-hidden>`. Mỗi mẫu có nhãn trạng thái (`MẶC ĐỊNH`, `VÔ HIỆU`…) và dòng token `font-mono text-[12px]` y như artboard.
    - Các trạng thái hover, focus, đang nhấn được vẽ tĩnh bằng class hiển thị trạng thái, giống artboard (ví dụ Button có `className` ép `bg-accent-hover`). Để làm được việc này, Button và LinkArrow nhận thêm prop `className?: string`, chỉ dùng cho styleguide.
    - Mục "Điều hướng" tái dùng `Breadcrumb` có sẵn. Mẫu header lấy từ ảnh chụp, không cần import `DesktopNav`.
    - Mục "Bộ lọc, tab & phân trang": phần phân trang và "Xem thêm" chưa có component. Hiện `VerifyNote` sm ghi "Phân trang và Xem thêm làm ở Phase 5." **Ruling (Claude):** chưa trang nào cần, theo YAGNI.
    - Không đưa "Thành phần di sản → Bước công đoạn / Điểm hoa văn", "Form góp tư liệu", "Lightbox" vào Phase 2 (chúng thuộc Phase 4–5). Hiện mỗi mục bằng `VerifyNote` sm: "Làm ở Phase 4." hoặc "Làm ở Phase 5."
    - Thêm một mục "Thẻ khi thiếu dữ liệu": `PortraitCard` không tên không ảnh, `StoryCard` "Chủ đề đề xuất", `ProductCard` không ảnh. Mục này để người duyệt xem đúng giao diện của bản public lúc mới dựng.
  - `fixtures.ts`: view model mẫu lấy nguyên văn từ `Components.dc.html` ("Chuyện về Trạng Chiếu", "Một ngày ở làng Hới", "Chiếu trơn", "Chiếu cạp điều", "TƯ LIỆU · 001", "In hoa văn lên chiếu bằng khuôn"…). Ảnh trỏ `/images/reference/nkc10.webp`, `nkc9.webp`, `hc9.webp`. `width`/`height` lấy từ file thật (đọc bằng `sharp` một lần lúc viết rồi ghi cứng). `flags: []`.
  - `Demos.tsx` (`'use client'`) giữ state cho hai demo:
    - FilterChips nền sáng và nền tối, với options `Tất cả`, `Lịch sử`, `Nghề truyền thống`, `Con người`, `Đời sống hôm nay` (nguyên văn StoriesIndex);
    - Tabs với `Dệt thủ công`, `Dệt bằng máy`, `So sánh`. Panel chỉ ghi tên tab, không bịa nội dung.
- [ ] **Step 4:** Chạy `npm run test:unit`, `npm run lint`, `npm run build`, `npm run test:e2e`. Kết quả mong đợi: tất cả PASS.
- [ ] **Step 5:** Chụp `/styleguide` toàn trang ở 1440 và 390 (Playwright, `fullPage: true`), lưu vào scratchpad. Đặt cạnh `design/screens/Components.jpg` và ghi lại chỗ lệch vào ledger. Lệch về khoảng cách hoặc cỡ chữ thì sửa ngay. Lệch do phạm vi (các mục để Phase 4–5) thì ghi chú lại.
- [ ] **Step 6:** Commit `feat: trang /styleguide nội bộ`.
- [ ] **Step 7:** Dừng lại và gửi người dùng: tóm tắt, hai ảnh chụp so sánh, danh sách Ruling, cách xem (`npm run dev`, mở `http://localhost:3000/styleguide`).

---

## Ngoài phạm vi Phase 2 (ghi lại để plan sau dùng)

| Việc | Phase | Lý do |
| --- | --- | --- |
| CraftStep/CraftJourney, Timeline | 4 | HANDOFF mục đặc tả tương tác 1–2, gắn với trang |
| PatternExplorer, Lightbox, Form góp tư liệu, ConsentPanel, phân trang / Xem thêm | 5 | Chỉ một trang dùng, làm cùng trang đó |
| Render `cite` trong rich text thành `FootnoteRef` | 5 | Dùng `FootnoteRef` + `sourceNumbers` của Task 3, bỏ cite trỏ tới nguồn đã bị loại |
