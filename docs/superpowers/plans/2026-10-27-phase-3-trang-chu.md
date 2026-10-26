# Chiếu Hới — Phase 3: Trang chủ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng trang chủ `/` cho desktop 1440 và mobile 390 đúng `Home.jpg` và `HomeMobile.jpg`. Mọi dữ liệu đọc qua `src/lib/content`, và trang tuân theo quy tắc public/preview.

**Architecture:** `src/app/(frontend)/page.tsx` là server component. Nó gọi `getMode()` và các hàm của `lib/content` rồi ghép các section trong `src/components/home/`. Mỗi section nhận view model và tự quyết bố cục desktop và mobile bằng class responsive (`md:` = 768px). Ba phần tương tác là client component:
- `CraftTeaser`: chọn công đoạn.
- `PatternTeaser`: điểm hoa văn.
- `ArchiveTeaser`: lọc ảnh.

Ảnh và chú thích của hero và section "Làng Hới" được lưu thêm vào global `page-intros`, trong nhóm `home`. Nhờ vậy mọi ảnh đều là ArchiveAsset và được kiểm tra quyền ảnh.

**Tech Stack:** Node 22.23.4, Next 16.4, React 19, Payload 3.92 (Postgres), Tailwind 4.3, Vitest + @testing-library/react, Playwright + @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-10-26-chieu-hoi-web-design.md`. Đọc kèm:
- `CLAUDE.md`;
- `docs/HANDOFF.md`, mục "Đặc tả tương tác" 1, 3, 5 và mục "Ghi chú triển khai";
- `design/source/Home.dc.html`, `design/source/HomeMobile.dc.html`;
- `design/screens/Home.jpg`, `design/screens/HomeMobile.jpg`.

## Global Constraints

- Mọi quy tắc trong `CLAUDE.md` áp dụng. Copy tiếng Việt lấy nguyên văn từ artboard. Desktop lấy từ `Home.dc.html`, mobile lấy từ `HomeMobile.dc.html`. Hai bản khác chữ thì render cả hai và ẩn/hiện theo breakpoint (`md:hidden` / `hidden md:block`).
- Dữ liệu chỉ đọc qua `@/lib/content`. Component trong `src/components` không import Payload. Chữ cố định (tiêu đề section, eyebrow, ghi chú, nút) viết cứng nguyên văn, theo spec mục 4: "Mọi chữ khác… viết cứng nguyên văn theo artboard".
- Dữ liệu CMS thắng dữ liệu vẽ trên artboard. Tên công đoạn, tên sản phẩm, mã TL, người, bài viết lấy từ CMS, không lấy chuỗi minh hoạ trên artboard (ví dụ artboard Home vẽ 6 công đoạn, CMS có 7). **Ruling (Claude):** artboard Home là bản minh hoạ dữ liệu, nguồn thật là CMS (spec mục 4).
- Placeholder kiểu `[CẦN XÁC MINH] …`, `[cần xác minh]` viết cứng trên artboard chỉ render khi `mode === 'preview'`, không bao giờ render ở public.
- Section không có dữ liệu ở chế độ hiện tại thì không render, kể cả tiêu đề. Ngoại lệ là hero, "Có một làng Hới..." và section kết "Làng vẫn còn đó.", vì đó là chữ cố định. Hero không có ảnh thì bỏ khối `figure`, phần chữ vẫn giữ.
- Tái dùng component Phase 2 (`src/components/ui`, `src/components/content`). Chỉ được thêm prop tuỳ chọn. Không đổi hành vi mặc định của chúng, và test Phase 2 phải vẫn qua.
- Token, cỡ chữ, focus, 44px, giảm chuyển động: như Global Constraints của Phase 2. Ảnh hero dùng `priority`, ảnh khác lazy. Luôn có `width`/`height` hoặc `aspect-ratio`.
- Nội dung đọc được đầy đủ khi không có JavaScript (HANDOFF mục Đặc tả tương tác). Client component phải render sẵn trạng thái đầu tiên ở server.
- Schema đổi thì chạy `npm run migrate:create home_media` và commit `src/migrations`.
- Mỗi task kết thúc bằng `npm run lint`, `npm run test:unit` (thêm `test:int` nếu task có test int) và một commit. Commit message kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Lệnh chạy qua `fnm exec --using=22.23.4 -- npm run …`.
- Làm trên nhánh `phase-3-trang-chu` tách từ `main`.

## Review Focus

1. **Public khi view model rỗng hoặc chỉ có dữ liệu kiểu public** (không flag, story idea `hasDetail: false`, chú thích có dấu bị null). Trang vẫn render, không có tiêu đề section mồ côi, không có chuỗi `cần xác minh`/`chờ xác minh`/`cần xin phép`, không có link tới trang 404. → Task 8, test `HomeView`.
2. **Ảnh hero hoặc ảnh làng chưa được phép đăng.** Public không có thẻ `img` nào trỏ tới asset đó. Chú thích chứa `[cần xác minh]` bị ẩn. → Task 2 (int), Task 3 (unit).
3. **Công đoạn không có ảnh (CMS có bước 3 thiếu ảnh).** Khi chọn công đoạn đó, sân khấu hiện khung "ẢNH CẦN CHỤP" kèm `shotNeeded`, không vỡ bố cục. → Task 4.
4. **Bàn phím:** chọn công đoạn bằng Enter/Space trên nút, chọn điểm hoa văn bằng nút `aria-pressed`, lọc ảnh bằng chip. Focus nhìn thấy trên nền tối. → Task 4, Task 6, Task 7, Task 8 (axe).
5. **Mobile 390:** các dải vuốt ngang (người, chip, nút công đoạn) không làm trang cuộn ngang, mọi nút ≥ 44px. → Task 8, e2e.


## Sửa đổi sau review plan (ràng buộc mọi task)

- **Một cây DOM hay hai:** mỗi section là một cây DOM duy nhất, bố cục desktop/mobile đổi bằng class responsive. Riêng các chuỗi chữ khác nhau giữa desktop và mobile thì render cả hai bản, ẩn/hiện bằng `hidden md:block` / `md:hidden`. Test trong plan dùng `getBy…` cho chuỗi có ở cả hai bản thì phải đổi sang `getAllBy…`/`[0]` hoặc `within(…)`. Đó là sửa test, không phải đổi yêu cầu.
- **Ghi chú xác minh chỉ hiện ở preview.** Ruling (Claude): các câu là ghi chú quy trình, không phải nội dung, chỉ render khi `mode === 'preview'`: "Trình tự và tên gọi các công đoạn sẽ được xác minh với nghệ nhân trước khi đăng." (Task 4) và "Danh mục đang xác minh với cơ sở dệt." (mobile, Task 6, `HomeMobile.dc.html:164`). Section nào cần biết `mode` thì nhận thêm prop `mode: Mode`.
- **Không có JavaScript.** Ruling (Claude): các teaser tương tác (công đoạn, điểm hoa văn, lọc ảnh) chỉ cần hiện trạng thái đầu khi không có JS. Nội dung đầy đủ nằm ở trang chi tiết mà mỗi teaser đều link tới. Đây là chấp nhận một phần HANDOFF "đọc được đầy đủ khi không có JS" ở mức trang chủ.
- **Màu chữ chỉ dùng token.** Không dùng `#C4BFB1` (dùng `text-text-on-dark-muted`) và không dùng `#3E3B35` (dùng `text-text-secondary`).
- **`.threads` trang chủ cao 14px** (`h-[14px]`) theo artboard Home. Lớp toàn cục vẫn giữ 12px.
- **`Reveal` luôn render `div`.** Không bọc `section` trong `section`.

---

## Cấu trúc file

```
src/globals/PageIntros.ts                 thêm trường ảnh trang chủ vào nhóm home
src/migrations/<ts>_home_media.ts
src/seed/data/site.ts, src/seed/index.ts  seed ảnh/chú thích trang chủ
src/lib/content/{types,queries,index}.ts  HomeMediaView, getHomeMedia
src/components/home/Hero.tsx
src/components/home/VillageIntro.tsx
src/components/home/CraftTeaser.tsx       'use client'
src/components/home/PeopleTeaser.tsx
src/components/home/StoriesTeaser.tsx
src/components/home/PatternTeaser.tsx     'use client'
src/components/home/ProductsTeaser.tsx
src/components/home/ArchiveTeaser.tsx     'use client'
src/components/home/Closing.tsx
src/components/ui/Reveal.tsx              'use client' — hiện dần bằng IntersectionObserver
src/app/(frontend)/page.tsx
tests/unit/home/*.test.tsx
tests/int/home-media.int.spec.ts
tests/e2e/home.e2e.spec.ts
```

---

### Task 1: Test hồi quy cho chú thích nguồn đứng sát nhau (việc còn treo từ Phase 2)

**Files:**
- Modify: `src/app/(frontend)/styleguide/page.tsx`: thêm một dòng demo có `<FootnoteRef n={1} /><FootnoteRef n={2} />` đứng sát nhau, đặt ngay dưới câu demo nguồn hiện có, với nhãn mẫu `<Lab>CHÚ THÍCH LIỀN NHAU</Lab>`.

  **Ruling (Claude):** đây là nhãn nội bộ của styleguide, không hiện cho người xem.
- Modify: `tests/e2e/styleguide.e2e.spec.ts`

- [ ] **Step 1: Viết test.** Lấy cặp `a.fn` liền nhau trong khối demo mới. Với mỗi cặp, lấy `getBoundingClientRect()` của `span` chữ số rồi dùng `document.elementFromPoint` dò 3 điểm:
  - tâm số 1, mong đợi `closest('a')` có `href` là `#nguon-1`;
  - điểm (`right - 1`, giữa chiều cao) của số 1, mong đợi `#nguon-1`;
  - tâm số 2, mong đợi `#nguon-2`.
- [ ] **Step 2:** Chứng minh test bắt được lỗi. Tạm đổi `Sources.tsx` về `before:-inset-x-[18px] before:-inset-y-[13px]` và bỏ `z-[1]`, chạy `npm run test:e2e -- styleguide`: kết quả mong đợi FAIL. Hoàn tác thay đổi tạm, chạy lại: PASS. Ghi cả hai kết quả vào báo cáo. Không commit bản tạm.
- [ ] **Step 3:** Commit `test: hồi quy chú thích nguồn đứng sát nhau`.

**Bổ sung sau review:**
- Test mới đặt trong khối `desktop 1440` của `styleguide.e2e.spec.ts`.
- Bản tạm để chứng minh RED phải đưa `FootnoteRef` về đúng code cũ trước `bb861fb`. Bỏ cả `before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2` lẫn `span z-[1]`, rồi dùng lại `before:-inset-x-[18px] before:-inset-y-[13px]`.

---

### Task 2: Dữ liệu ảnh trang chủ — `getHomeMedia`

**Files:**
- Modify: `src/globals/PageIntros.ts`. Nhóm `home` thêm các trường sau. Chúng là `upload` tới `archive-assets` và không `localized`, trừ caption:
  - `heroImage` (upload), nhãn "Ảnh hero";
  - `heroInset` (upload), nhãn "Ảnh nhỏ cạnh hero";
  - `heroCaption` (text, localized), nhãn "Chú thích ảnh hero";
  - `villageImages` (array, `maxRows: 2`, nhãn "Ảnh mục Làng Hới"), mỗi phần tử gồm `image` (upload, bắt buộc) và `caption` (text, localized).
- Create: migration `npm run migrate:create home_media`.
- Modify: `src/seed/data/site.ts`, `src/seed/index.ts`. Gán asset theo `sourceFile` đã seed: `heroImage` = `kn14.webp`, `heroInset` = `kn5.webp`, `villageImages` = [`hc8.webp`, `kn11.webp`]. Caption lấy nguyên văn từ `Home.dc.html`:
  - `heroCaption`: `Ảnh: [tác giả — cần xác minh] · Địa điểm: [cần xác minh]`
  - `villageImages[0].caption`: `Chiếu trải phơi trên bãi đất trống. Địa điểm và thời gian chụp: [cần xác minh].`
  - `villageImages[1].caption`: `Gấp chiếu thành phẩm. [Nhân vật — cần xin phép trước khi đăng]`
- Modify: `src/lib/content/{types,queries,index}.ts`
- Test: `tests/int/home-media.int.spec.ts`

**Interfaces:**
- Produces:
  - `interface HomeMediaView { hero: { image: ImageView; title: string | null; caption: string | null } | null; heroInset: ImageView | null; village: { image: ImageView; caption: string | null }[] }`. `hero.title` là `title` của asset hero, đi qua `showText`. Mã TL nằm trong `image.code`.
  - `getHomeMedia(mode: Mode): Promise<HomeMediaView>` trong `createContent`, export kèm wrapper ở `src/lib/content/index.ts` giống các hàm khác.
- Consumes: `toImageView`, `showText`, `readGlobal` có sẵn trong `queries.ts`/`visibility.ts`. Ảnh nào `toImageView` trả `null` thì phần tử đó bị loại: `hero` thành `null`, ảnh làng bị bỏ khỏi mảng.

- [ ] **Step 1: Viết test int hỏng**

```ts
it('public: ảnh chưa được phép thì hero null, làng rỗng; caption có dấu bị ẩn', async () => {
  await seedHomeMedia({ rights: 'unknown' })   // helper trong file test: tạo 4 asset + publish page-intros
  const m = await content.getHomeMedia('public')
  expect(m.hero).toBeNull()
  expect(m.heroInset).toBeNull()
  expect(m.village).toEqual([])
})
it('preview: hiện ảnh kèm flag và caption nguyên văn', async () => {
  await seedHomeMedia({ rights: 'unknown' })
  const m = await content.getHomeMedia('preview')
  expect(m.hero?.image.flags).toContain('rights-not-permitted')
  expect(m.hero?.caption).toBe('Ảnh: [tác giả — cần xác minh] · Địa điểm: [cần xác minh]')
  expect(m.village).toHaveLength(2)
})
it('public: ảnh được phép thì hiện, caption có dấu vẫn ẩn', async () => {
  await seedHomeMedia({ rights: 'permitted', subjectConsent: 'not_applicable' })
  const m = await content.getHomeMedia('public')
  expect(m.hero?.image.url).toBeTruthy()
  expect(m.hero?.caption).toBeNull()
  expect(m.village.map((v) => v.caption)).toEqual([null, null])
})
it('global chưa đăng: public trả rỗng, không lỗi', async () => {
  const m = await content.getHomeMedia('public')
  expect(m).toEqual({ hero: null, heroInset: null, village: [] })
})
```

- [ ] **Step 2:** Chạy `npm run test:int -- home-media`, kết quả mong đợi: FAIL.
- [ ] **Step 3:** Thêm trường, tạo migration, viết `getHomeMedia`. Đọc global với `depth: 1` để populate upload, rồi đổi qua `toImageView(asset, mode)`. Cập nhật seed. Chạy `npm run generate:types` để cập nhật `payload-types.ts`.
- [ ] **Step 4:** Chạy `npm run test:int` (PASS hết, gồm test seed hiện có), `npm run lint`, `npm run build`.
- [ ] **Step 5:** Commit `feat(content): ảnh trang chủ trong page-intros và getHomeMedia`.

**Bổ sung sau review:**
- **Mở rộng dấu chưa xác minh (chặn lỗi lộ placeholder).** Trong `src/lib/content/visibility.ts`, đổi `UNVERIFIED_MARK` thành `/\[[^\]]*(?:cần|chờ)\s[^\]]*\]/iu`. Mọi cặp ngoặc vuông chứa "cần …" hoặc "chờ …" đều tính là chưa xác minh, ví dụ `[cần xác minh]`, `[tác giả — cần xác minh]`, `[Nhân vật — cần xin phép trước khi đăng]`, `[chờ xác minh với cơ sở dệt]`, `[Cần nguồn]`.
  - Thêm test unit vào `tests/unit/visibility.test.ts` cho 5 ví dụ này: tất cả bị ẩn ở public, hiện nguyên văn ở preview.
  - Thêm test cho các chuỗi không được khớp: `[X] PHÚT ĐỌC`, `[1]`.
  - Chạy lại toàn bộ `test:unit` và `test:int`. Nếu test Phase 1 nào đổi kết quả thì ghi vào báo cáo.
  - Ruling (Claude): mở rộng dấu cho toàn site. CLAUDE.md yêu cầu ẩn mọi phần thiếu dữ liệu ở production. Cái giá: một câu chính thức có chứa "[… cần …]" cũng sẽ bị ẩn.
- **`readGlobal`:** `readGlobal` trong `queries.ts` đang cố định `depth: 0`. Thêm tham số tuỳ chọn `depth = 0`, `getHomeMedia` gọi với `depth: 1`, `getPageIntro` giữ nguyên.
- **Test int:**
  - Đầu file đặt `// @vitest-environment node`.
  - Thêm `beforeEach` gồm `resetDb(payload)` và `makeUser(payload, 'reviewer')`, rồi `updateGlobal('page-intros', { _status: 'draft' }, overrideAccess)` để test không phụ thuộc thứ tự (mẫu ở `tests/int/content.int.spec.ts:38-44`).
  - Helper `seedHomeMedia` publish global với `user` là reviewer, vì `guardPublish` yêu cầu reviewer.
- **Seed:** seed bỏ qua global đã đăng. Để thấy ảnh mới trên DB dev hiện có, chạy `SEED_FORCE_GLOBALS=true npm run seed`. Ghi câu này vào báo cáo.

---

### Task 3: Hero và "Có một làng Hới..."

**Files:**
- Create: `src/components/home/{Hero,VillageIntro}.tsx`
- Test: `tests/unit/home/hero.test.tsx`

**Interfaces:**
- Consumes: `PageIntroView`, `HomeMediaView`, `Mode`, `Button`, `LinkArrow`, `ContentImage`, `DocumentLabel`, `VerifyNote`.
- Produces:
  - `Hero(props: { intro: PageIntroView; media: HomeMediaView })`
  - `VillageIntro(props: { media: HomeMediaView; mode: Mode })`

- [ ] **Step 1: Viết test hỏng**

```tsx
const intro = { eyebrow: 'DI SẢN LÀNG NGHỀ VIỆT NAM', title: 'Từ sợi cói quê nhà, dệt nên những câu chuyện.', heroTitle: 'Từ sợi cói quê nhà,\ndệt nên những\ncâu chuyện.', lead: 'Khám phá làng Hới, nơi nghề dệt chiếu lưu giữ ký ức, sự khéo léo và tâm hồn của bao thế hệ.' }
const empty = { hero: null, heroInset: null, village: [] }
it('h1 theo heroTitle, dòng cuối là em', () => {
  render(<Hero intro={intro} media={empty} />)
  const h1 = screen.getByRole('heading', { level: 1 })
  expect(h1.textContent).toBe('Từ sợi cói quê nhà,dệt nên nhữngcâu chuyện.')
  expect(h1.querySelector('em')?.textContent).toBe('câu chuyện.')
  expect(h1.querySelectorAll('br')).toHaveLength(2)
})
it('heroTitle null thì dùng title; cả hai null thì h1 sr-only "Chiếu Hới"', () => {
  const { rerender } = render(<Hero intro={{ ...intro, heroTitle: null }} media={empty} />)
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(intro.title)
  rerender(<Hero intro={{ eyebrow: null, title: null, lead: null, heroTitle: null }} media={empty} />)
  const h1 = screen.getByRole('heading', { level: 1 })
  expect(h1.textContent).toBe('Chiếu Hới')
  expect(h1.className).toContain('sr-only')
})
it('nút: Khám phá làng nghề → /lang-hoi; Nghe chuyện làng Hới → /cau-chuyen/chuyen-ve-trang-chieu', () => {
  render(<Hero intro={intro} media={empty} />)
  expect(screen.getByRole('link', { name: 'Khám phá làng nghề' }).getAttribute('href')).toBe('/lang-hoi')
  expect(screen.getByRole('link', { name: 'Nghe chuyện làng Hới' }).getAttribute('href')).toBe('/cau-chuyen/chuyen-ve-trang-chieu')
})
it('không có ảnh hero thì không có figure', () => {
  const { container } = render(<Hero intro={intro} media={empty} />)
  expect(container.querySelector('figure')).toBeNull()
})
it('VillageIntro public: không có [CẦN XÁC MINH]; preview: có', () => {
  const { container, rerender } = render(<VillageIntro media={empty} mode="public" />)
  expect(container.textContent).not.toContain('CẦN XÁC MINH')
  expect(screen.getByRole('heading', { level: 2, name: 'Có một làng Hới...' })).toBeTruthy()
  expect(screen.getByRole('link', { name: 'Đọc về làng Hới' }).getAttribute('href')).toBe('/lang-hoi')
  rerender(<VillageIntro media={empty} mode="preview" />)
  expect(container.textContent).toContain('[CẦN XÁC MINH]')
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ `Home.dc.html` (hero và section LÀNG HỚI) và `HomeMobile.dc.html`.
  - **Hero desktop:**
    - Lưới 12 cột, `px-20 pt-16`, cao 840px. Cột chữ `col-span-6` có `gap-8 pb-[120px]`.
    - Eyebrow có vạch 48×1px màu accent đứng trước.
    - h1 `font-display text-display leading-[1.12] tracking-[-.01em]`. Dòng cuối của `heroTitle` (tách theo `\n`) bọc `<em class="italic text-accent">`, các dòng nối bằng `<br>`.
    - Lead `text-body-lg leading-[1.65] max-w-[460px] text-text-secondary`.
    - Hai nút cách nhau `gap-8`: `Button` primary và `Button` secondary `icon="play"`.
    - `figure` `col-start-7 col-span-6` cao 700px, `object-position: 62% 50%`, `priority`.
    - DocumentLabel ở `right-6 bottom-6`, rộng 280px:
      - `code` = phần số của `image.code` (`TL-002` → `002`; không có code thì bỏ cả nhãn);
      - `title` = `hero.title`;
      - `meta` = `hero.caption` (null thì không render dòng meta; thêm prop `meta?: string | null` cho DocumentLabel nếu cần).
    - Ảnh inset 220×220, `left-[-64px] bottom-[-72px]`, viền `10px` màu `bg-primary`, `alt=""`. **Ruling (Claude):** ảnh inset là ảnh phụ trang trí.
    - Dòng "CUỘN ĐỂ BẮT ĐẦU HÀNH TRÌNH" có vạch dọc 1×40px, `absolute left-20 bottom-8`, chỉ hiện trên desktop.
  - **Hero mobile:**
    - `px-5 pt-8 gap-[22px]`, vạch eyebrow 32px.
    - h1 38px (token `text-display` đã đổi theo breakpoint).
    - Nút primary full width, nút phụ căn giữa, icon 28px.
    - Ảnh cao 440px, `object-position: 60% 50%`. Figcaption nằm ở `left-3 right-3 bottom-3`, gồm mã và dòng `title · caption`.
  - **VillageIntro:**
    - Eyebrow "LÀNG HỚI" và h2 "Có một làng Hới...", desktop `col-span-4`.
    - Đoạn văn desktop `col-start-6 col-span-6`, `font-serif text-lead leading-[1.7]`, chữ "C" đầu dòng thả lớn 84px màu accent (float). Mobile 18px, không thả chữ.
    - `VerifyNote` chỉ render khi preview. Desktop: "[CẦN XÁC MINH] Đoạn giới thiệu lịch sử làng Hới (Hải Triều, Tân Lễ, Hưng Hà) — đối chiếu tư liệu địa phương." Mobile: "[CẦN XÁC MINH] Đoạn giới thiệu lịch sử làng Hới."
    - `LinkArrow` "Đọc về làng Hới".
    - Hai ảnh `media.village`:
      - Ảnh 1 desktop `col-span-8` cao 540px.
      - Ảnh 2 desktop `col-start-10 col-span-3 mt-[120px]` cao 420px.
      - Figcaption `font-serif italic text-[14px] text-text-secondary`.
      - Mobile chỉ hiện ảnh 1, tràn lề (`-mx-5`), cao 260px.
    - Trên desktop, section mở đầu bằng `.threads` có `mx-20 mt-[72px]`.
- [ ] **Step 4:** Chạy test, kết quả mong đợi: PASS. Chạy lint.
- [ ] **Step 5:** Commit `feat(home): hero và mục Làng Hới`.

**Bổ sung sau review:**
- **DocumentLabel:** thêm hẳn prop tuỳ chọn `meta?: string | null` (null hoặc undefined thì không render dòng meta) và `className?: string`. Trong hero, nhãn đặt trong `figcaption` với nền `bg-bg-primary`, không viền, theo artboard.
- **Mã tư liệu:** chỉ hiện mã khi `image.code` khớp `/^TL-(\d+)$/`, lấy phần số. Không khớp (ví dụ preview trả `[cần xác minh]`) thì bỏ dòng mã.
- **Ảnh inset dùng `alt={image.alt}`**, không dùng `alt=""`. Ruling cũ bị huỷ vì artboard có alt thật. Mobile không render ảnh inset.
- **Button:** thêm prop tuỳ chọn `iconSize?: number` (mặc định 36) để mobile dùng icon 28px.
- **Link nghe chuyện:** `Hero` nhận thêm prop `storyHref: string | null`. Khi null thì không render nút "Nghe chuyện làng Hới". `page.tsx` (Task 8) truyền `/cau-chuyen/chuyen-ve-trang-chieu` chỉ khi slug này có trong `getStories(mode)` với `hasDetail`. Thêm test: `storyHref={null}` thì không có link "Nghe chuyện làng Hới".
- **Đoạn VillageIntro, nguyên văn:** "Có những ngôi làng được nhớ bằng một mái đình, một bến sông. Làng Hới được nhớ bằng nhịp khung dệt và những tấm chiếu trải phơi kín bãi đất đầu làng." Chữ "C" thả lớn làm bằng `first-letter:` (desktop), không tách thành span riêng, để trình đọc màn hình không đọc "C ó".
- **Mobile VillageIntro:** link "Đọc về làng Hới" nằm sau ảnh.

---

### Task 4: `CraftTeaser` — chọn công đoạn (client)

**Files:**
- Create: `src/components/home/CraftTeaser.tsx`
- Test: `tests/unit/home/craft-teaser.test.tsx`

**Interfaces:**
- Consumes: `CraftStepView[]` (field `n`, `title`, `body`, `image`, `shotNeeded`), `ContentImage`, `ShotNeeded`, `LinkArrow`.
- Produces: `CraftTeaser(props: { steps: CraftStepView[] })`. Không render gì khi `steps` rỗng. Ghi chú cho Phase 4: phần chọn công đoạn ở đây chỉ dành cho trang chủ. Hành trình đầy đủ (Trước/Tiếp, phóng ảnh) làm ở Phase 4.

- [ ] **Step 1: Viết test hỏng**

```tsx
const steps = [1, 2, 3].map((n) => ({ n, title: `Bước ${n}`, subtitle: null, body: null, tools: null, image: n === 3 ? null : img(n), shotNeeded: n === 3 ? 'Phơi cói ngoài sân' : null, focus: [50, 50] as [number, number], flags: [] }))
it('mặc định chọn công đoạn đầu; progress và bộ đếm', () => {
  render(<CraftTeaser steps={steps} />)
  const list = screen.getAllByRole('button', { name: /Bước/ })
  expect(screen.getAllByRole('button', { current: 'step' })[0].textContent).toContain('Bước 1')
  const pb = screen.getAllByRole('progressbar', { name: 'Tiến trình công đoạn' })[0]
  expect(pb.getAttribute('aria-valuenow')).toBe('1')
  expect(pb.getAttribute('aria-valuemax')).toBe('3')
  expect(list.length).toBeGreaterThan(0)
})
it('chọn công đoạn không có ảnh: hiện ẢNH CẦN CHỤP + shotNeeded', () => {
  render(<CraftTeaser steps={steps} />)
  fireEvent.click(screen.getAllByRole('button', { name: /Bước 3/ })[0])
  expect(screen.getAllByText('ẢNH CẦN CHỤP').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Phơi cói ngoài sân').length).toBeGreaterThan(0)
  expect(screen.getAllByRole('progressbar')[0].getAttribute('aria-valuenow')).toBe('3')
})
it('link Đi theo hành trình một tấm chiếu → /nghe-det-chieu', () => {
  render(<CraftTeaser steps={steps} />)
  expect(screen.getByRole('link', { name: 'Đi theo hành trình một tấm chiếu' }).getAttribute('href')).toBe('/nghe-det-chieu')
})
it('rỗng thì không render', () => {
  const { container } = render(<CraftTeaser steps={[]} />)
  expect(container.innerHTML).toBe('')
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ `Home.dc.html` (section `.green` NGHỀ DỆT CHIẾU, `.step`, `.thumb`) và `HomeMobile.dc.html`. Nền `bg-bg-inverse text-text-on-dark`.
  - **Phần đầu:** eyebrow "NGHỀ DỆT CHIẾU" màu `accent-on-dark`, h2 "Một tấm chiếu, muôn công đoạn.". Desktop có thêm ghi chú phải "Trình tự và tên gọi các công đoạn sẽ được xác minh với nghệ nhân trước khi đăng." Dùng `SectionHeading tone="dark"`.
  - **Bộ đếm:** `Công đoạn` cùng `<strong>{pad(n)}</strong> / {pad(total)}`, `pad` = 2 chữ số.
  - **Progressbar:** `role="progressbar" aria-label="Tiến trình công đoạn" aria-valuemin=1 aria-valuemax={total} aria-valuenow={index+1}`. Vạch cao 3px, nền `rgba(243,235,221,.2)`, phần đã đi màu `accent-on-dark`.
  - **Desktop:**
    - Sân khấu `col-span-7` cao 520px, nhãn nằm `left-5 bottom-5` gồm `TƯ LIỆU · {code số}` và `{title}`.
    - Danh sách `<ol>` các `<button type="button">` ở `col-start-9 col-span-4`. Nút đang chọn có `aria-current="step"`, viền trái 3px `accent-on-dark`, tiêu đề `font-display text-[28px]` và ô `.check` 12px. Nút thường `text-[18px]`, màu `#C4BFB1`, hover sang `text-on-dark`, mỗi nút `py-4 border-t border-[rgba(243,235,221,.22)]`. Bên dưới là chú thích "Chọn một công đoạn để xem ảnh và mô tả."
    - Hàng thumbnail `grid-cols-{min(total,7)}`, mỗi ô là `<button>`: ảnh cao 150px `alt=""` opacity .7 (hover và đang chọn thì 1), nhãn `{pad(n)} · {title}`. Ô đang chọn có `aria-current="step"`. Bước không có ảnh thì ô thumbnail dùng nền `.weave`.
  - **Mobile:**
    - Bộ đếm và progressbar, ảnh tràn lề cao 280px.
    - Khối chữ: số `accent-on-dark`, tiêu đề 28px display, `body` (null thì bỏ).
    - Dải nút `role="group" aria-label="Chọn công đoạn"` vuốt ngang, nhãn `{pad(n)} {title}`, nút đang chọn `aria-current="step"` nền `bg-primary text-bg-inverse`. Chọn xong gọi `scrollIntoView({ inline: 'center', block: 'nearest' })` (HANDOFF mục 1).
  - **Ảnh:** ảnh đang chọn hiện bằng `ContentImage`. Không có ảnh thì dùng `ShotNeeded tone="dark" description={shotNeeded}`.
  - **Link cuối:** `LinkArrow tone="dark"` "Đi theo hành trình một tấm chiếu" → `/nghe-det-chieu`.
  - **Ruling (Claude):** mặc định chọn công đoạn đầu tiên. Artboard vẽ "04" đang chọn chỉ để minh hoạ.
- [ ] **Step 4:** Chạy test, kết quả mong đợi: PASS. Chạy lint.
- [ ] **Step 5:** Commit `feat(home): hành trình công đoạn rút gọn`.

**Bổ sung sau review:**
- **Mobile có thêm nút Trước/Tiếp** theo `HomeMobile.dc.html:87-91`:
  - hai `<button type="button">` 48×48 với `aria-label="Công đoạn trước"` và `aria-label="Công đoạn tiếp"`;
  - không vòng lại: nút Trước `disabled` ở bước đầu, nút Tiếp `disabled` ở bước cuối;
  - link mobile riêng `LinkArrow tone="dark"` "Xem cả hành trình" → `/nghe-det-chieu`, hiện ở mobile thay cho "Đi theo hành trình một tấm chiếu" (link desktop).
  - Test: bấm "Công đoạn tiếp" thì progressbar tăng; ở bước cuối nút Tiếp bị `disabled`; ở bước đầu nút Trước bị `disabled`.
- **`scrollIntoView`** chỉ gọi trong handler click của nút pill mobile (và Trước/Tiếp), không bao giờ gọi trong effect khi mount. Gọi kiểu `el.scrollIntoView?.({ inline: 'center', block: 'nearest' })`. Trong test, stub `Element.prototype.scrollIntoView = vi.fn()`.
- **Số cột thumbnail:** dùng `style={{ gridTemplateColumns: `repeat(${Math.min(total, 7)}, minmax(0, 1fr))` }}`, không dùng class động.
- **Nhãn sân khấu:** dòng 1 là `TƯ LIỆU · {số}` (theo quy tắc mã ở Task 3). Dòng 2 là `step.title`, thêm ` · Ảnh: ${image.photographer}` khi `photographer` có giá trị. Không có ảnh thì không có nhãn.
- **`ShotNeeded`:** truyền `description={step.shotNeeded ?? undefined}`.
- **Prop:** `CraftTeaser` nhận thêm `mode: Mode` để hiện ghi chú xác minh ở preview (xem mục "Sửa đổi sau review").

---

### Task 5: Con người và Câu chuyện

**Files:**
- Create: `src/components/home/{PeopleTeaser,StoriesTeaser}.tsx`
- Modify:
  - `src/components/content/PortraitCard.tsx`: thêm prop tuỳ chọn `cta?: string` (mặc định "Xem chân dung →") và `imageClassName?: string` để ghi đè chiều cao ảnh.
  - `src/components/content/StoryCard.tsx`: thêm prop tuỳ chọn `size?: 'default' | 'large'`.
- Test: `tests/unit/home/people-stories.test.tsx`

**Interfaces:**
- Consumes: `PersonView[]`, `StoryCardView[]`, `PortraitCard`, `StoryCard`, `LinkArrow`.
- Produces:
  - `PeopleTeaser(props: { people: PersonView[] })`: hiện tối đa 3 người, rỗng thì không render.
  - `StoriesTeaser(props: { stories: StoryCardView[] })`: bài nổi bật là bài đầu tiên có `hasDetail`, nếu không có thì lấy bài đầu tiên. Thêm tối đa 3 bài gọn. Rỗng thì không render.
  - Link chi tiết: người → `/con-nguoi/${slug}`, bài → `/cau-chuyen/${slug}`.

- [ ] **Step 1: Viết test hỏng**

```tsx
it('PeopleTeaser: tối đa 3, CTA Đọc câu chuyện →, link Gặp những người làng Hới', () => {
  render(<PeopleTeaser people={[p('a'), p('b'), p('c'), p('d')]} />)
  expect(screen.getAllByText('Đọc câu chuyện →')).toHaveLength(3)
  expect(screen.getByRole('link', { name: /Gặp những người làng Hới/ }).getAttribute('href')).toBe('/con-nguoi')
})
it('PeopleTeaser rỗng thì không render', () => {
  const { container } = render(<PeopleTeaser people={[]} />)
  expect(container.innerHTML).toBe('')
})
it('StoriesTeaser: bài nổi bật là bài có trang; ghi chú chủ đề đề xuất chỉ khi có bài idea', () => {
  render(<StoriesTeaser stories={[s('y1', { hasDetail: false, flags: ['unpublished', 'idea'] }), s('d1', { hasDetail: true, flags: ['unpublished'] })]} />)
  const links = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
  expect(links[0]).toBe('/cau-chuyen') // "Tất cả câu chuyện →" ở phần đầu
  expect(links).toContain('/cau-chuyen/d1')
  expect(screen.getByText('Chủ đề biên tập đề xuất — bài viết chưa được soạn.')).toBeTruthy()
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ `Home.dc.html` (CON NGƯỜI, CÂU CHUYỆN) và `HomeMobile.dc.html`.
  - **PeopleTeaser desktop:**
    - Eyebrow "CON NGƯỜI", h2 "Những bàn tay giữ hồn làng." `col-span-6`.
    - Đoạn `col-start-8 col-span-5 self-end text-[17px] leading-[1.65] text-text-secondary`: "Mỗi người một khung dệt, một nếp nhà, một cách giữ nghề. Tên và câu chuyện chỉ được đăng khi chính họ đồng ý kể."
    - Người 1 `col-span-6`, ảnh cao 600px. Người 2 `col-span-3 mt-40`, người 3 `col-span-3 mt-16`, ảnh cao 400px.
    - Mọi thẻ dùng `cta="Đọc câu chuyện →"`.
    - Cuối section là `LinkArrow` "Gặp những người làng Hới" → `/con-nguoi`. Chữ lấy nguyên văn ở cuối section người trong `Home.dc.html`.
  - **PeopleTeaser mobile:**
    - Đoạn ngắn: "Tên và câu chuyện chỉ được đăng khi chính họ đồng ý kể."
    - Dải vuốt ngang `flex gap-4 overflow-x-auto -mx-5 px-5`, thẻ rộng 280px, ảnh cao 360px.
    - Khi có từ 2 người trở lên, hiện "Vuốt ngang để xem thêm". **Ruling (Claude):** bỏ phần đếm "· 1 / 3" vì nó không cập nhật theo vị trí cuộn.
  - **PortraitCard:** desktop, người 1 dùng tên 32px. Nếu cần, thêm prop tuỳ chọn `nameClassName` theo cùng cách với `imageClassName`.
  - **StoriesTeaser:**
    - Phần đầu: eyebrow "CÂU CHUYỆN", h2 "Chuyện làng, kể chậm.", bên phải `LinkArrow` "Tất cả câu chuyện" → `/cau-chuyen`. Mobile đặt link ở cuối section.
    - Bài nổi bật `col-span-7`, `StoryCard variant="featured" size="large"`:
      - desktop: ảnh 460px, tiêu đề 44px, sapo `font-serif` 18px, `max-w-[600px]`;
      - mobile: ảnh 230px, tiêu đề 28px, sapo 16px.
    - Các bài gọn `col-start-9 col-span-4`, `variant="compact" size="large"`:
      - desktop: ảnh 140×170, tiêu đề 26px, `gap-5`, `py-7`;
      - mobile: ảnh 96×116, tiêu đề 21px.
    - Ghi chú `text-[13px] text-text-muted` "Chủ đề biên tập đề xuất — bài viết chưa được soạn." chỉ hiện khi có bài gọn mang flag `idea`.
    - Section mở đầu bằng `.threads` `mx-20`, mobile `mx-5`.
- [ ] **Step 4:** Chạy `npm run test:unit`. PASS, kể cả test Phase 2 của PortraitCard và StoryCard. Chạy lint.
- [ ] **Step 5:** Commit `feat(home): mục Con người và Câu chuyện`.

**Bổ sung sau review:**
- **Link bài viết:** `href = story.hasDetail ? `/cau-chuyen/${slug}` : '/cau-chuyen'`. Bài "chủ đề đề xuất" không có trang chi tiết (spec §6, `getStory` trả null). Sửa test: thẻ idea trỏ `/cau-chuyen`.
- **Ghi chú "Chủ đề biên tập đề xuất — bài viết chưa được soạn."** hiện khi có ít nhất một thẻ gọn với `!hasDetail`, không dựa vào flag `idea` (flag này chỉ có ở preview). Thêm test với dữ liệu kiểu public: `flags: []`, `hasDetail: false`.
- **Mobile mục Câu chuyện:** hiện 2 thẻ gọn, không có CTA. Thêm prop tuỳ chọn `hideCta` cho StoryCard compact nếu cần.
- **Gợi ý vuốt:** vẫn bỏ "· 1 / 3". Câu "Vuốt ngang để xem thêm" là một phần của chuỗi artboard; báo người dùng ở cuối phase.

---

### Task 6: Sản phẩm — `PatternTeaser` (client) và bộ sưu tập

**Files:**
- Create: `src/components/home/{PatternTeaser,ProductsTeaser}.tsx`
- Modify:
  - `src/components/content/ExhibitCard.tsx`: thêm prop tuỳ chọn `note?: string | null` (dòng `text-[14px] leading-[1.55] text-text-secondary`) và `large?: boolean` (tên 28px).
  - `src/components/content/Sources.tsx`: `FootnoteRef` thêm prop tuỳ chọn `href?: string`, mặc định `#nguon-${n}`.
- Test: `tests/unit/home/products.test.tsx`

**Interfaces:**
- Consumes: `ProductView` (`images`, `annotations: { n, title, x, y, body, sourceId }[]`), `ProductCardView[]`, `ExhibitCard`, `FootnoteRef`, `ContentImage`, `LinkArrow`.
- Produces:
  - `PatternTeaser(props: { product: ProductView })`
  - `ProductsTeaser(props: { featured: ProductView | null; products: ProductCardView[] })`. Hiện 4 thẻ đầu. Khi `featured` null hoặc không có ảnh/annotation thì bỏ khối ảnh điểm. Khi cả hai rỗng thì không render.
  - Trang chọn `featured` là sản phẩm đầu tiên trong `getProducts` có ảnh và có ít nhất một annotation. Lấy chi tiết bằng `getProduct(slug, mode)` (làm ở Task 8).

- [ ] **Step 1: Viết test hỏng**

```tsx
it('PatternTeaser: điểm 1 mở mặc định, aria-pressed, đổi khi bấm điểm khác', () => {
  render(<PatternTeaser product={product} />)
  const b1 = screen.getByRole('button', { name: 'Chi tiết 1: viền chiếu' })
  const b2 = screen.getByRole('button', { name: 'Chi tiết 2: hoa văn in' })
  expect(b1.getAttribute('aria-pressed')).toBe('true')
  fireEvent.click(b2)
  expect(b2.getAttribute('aria-pressed')).toBe('true')
  expect(screen.getByText('2 · Hoa văn in')).toBeTruthy()
})
it('annotation có nguồn: FootnoteRef trỏ trang hiện vật', () => {
  render(<PatternTeaser product={product} />)
  fireEvent.click(screen.getByRole('button', { name: 'Chi tiết 2: hoa văn in' }))
  expect(screen.getByRole('link', { name: 'Nguồn 1' }).getAttribute('href')).toBe('/san-pham/chieu-cap-dieu#nguon-1')
})
it('vùng chú thích là aria-live polite', () => {
  const { container } = render(<PatternTeaser product={product} />)
  expect(container.querySelector('[aria-live="polite"]')).not.toBeNull()
})
it('ProductsTeaser: 4 thẻ hiện vật, link Xem toàn bộ sưu tập', () => {
  render(<ProductsTeaser featured={null} products={six} />)
  expect(screen.getAllByText(/^HIỆN VẬT \d\d$/)).toHaveLength(4)
  expect(screen.getByRole('link', { name: 'Xem toàn bộ sưu tập' }).getAttribute('href')).toBe('/san-pham')
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ `Home.dc.html` (SẢN PHẨM, `.marker`, `.object`) và `HomeMobile.dc.html`. Nền `bg-bg-secondary`.
  - **Phần đầu:** eyebrow "SẢN PHẨM", h2 "Nét đẹp từ những đường dệt.".
  - **PatternTeaser desktop, khối ảnh:**
    - `figure` `col-span-8` cao 560px, ảnh `product.images[0]`.
    - Mỗi annotation là một `<button type="button">` 44×44 `rounded-full`, đặt tại `left: x%; top: y%` (dịch `-50%` để tâm nút trùng toạ độ).
      - Nút đang mở: nền accent, viền `bg-primary`, chữ `bg-primary`, kèm vòng `0 0 0 6px rgba(160,68,53,.35)`.
      - **Ruling (Claude):** vòng này là trạng thái trên artboard, không phải bóng đổ trang trí, nên vẽ bằng `outline`/`ring` chứ không dùng `box-shadow` mờ.
      - Nút thường: nền `bg-primary`, viền và chữ accent.
      - `aria-label` = `Chi tiết ${n}: ${title.toLocaleLowerCase('vi')}`.
      - Hover `scale-[1.08]`, chỉ trong `motion-safe:`.
    - Nhãn `left-5 top-5`: nền `rgba(40,39,36,.82)`, ô `.check` 10px, chữ "Chạm vào các điểm để xem chi tiết đường dệt".
  - **PatternTeaser desktop, cột phải `col-start-10 col-span-3`:**
    - Nhãn "KHÁM PHÁ ĐƯỜNG DỆT".
    - Khối đang mở có viền trái 3px accent, nằm trong vùng `aria-live="polite"`. Gồm:
      - tiêu đề `{n} · {title}` `font-display text-[30px]`;
      - `body` `text-[16px] text-[#3E3B35]`;
      - nếu có `sourceId` thì thêm `FootnoteRef` với `n` = số thứ tự của `sourceId` trong danh sách `sourceId` khác nhau của sản phẩm (thứ tự xuất hiện) và `href=/san-pham/${slug}#nguon-${n}`.
    - Các annotation còn lại là dòng chữ `{n} · {title}` màu `text-muted-alt`.
    - **Ruling (Claude):** trang chủ không có danh sách nguồn, nên chú thích có nguồn trỏ sang trang hiện vật. Phase 5 phải đánh số nguồn trên trang hiện vật theo đúng thứ tự này.
  - **Mobile:**
    - Ảnh tràn lề cao 300px. Nút điểm đặt ở cùng toạ độ x/y lấy từ CMS (artboard mobile dịch toạ độ chỉ để minh hoạ).
    - Thẻ chú thích `bg-bg-primary p-[18px] -mt-10 relative`, tiêu đề 24px.
  - **Bộ sưu tập:**
    - Hàng "Bộ sưu tập chiếu" (`font-display text-[30px]`, mobile 24px), bên phải `LinkArrow` "Xem toàn bộ sưu tập" → `/san-pham`.
    - 4 `ExhibitCard large` lấy `index` từ thứ tự, `name = product.name`, `note = product.summary`, `href=/san-pham/${slug}`. Desktop lưới 4 cột, mobile xếp dọc.
    - Sản phẩm `name` null thì bỏ thẻ đó. **Ruling (Claude):** không tự viết tên thay thế.
- [ ] **Step 4:** Chạy test, kết quả mong đợi: PASS. Test FootnoteRef cũ vẫn PASS. Chạy lint.
- [ ] **Step 5:** Commit `feat(home): mục Sản phẩm với điểm hoa văn`.

**Bổ sung sau review:**
- **Điểm mở mặc định** là `annotations[0]`, không phải `n === 1`. Ở public, các annotation có dấu bị loại nên có thể chỉ còn điểm 2.
- **`title` null:** `aria-label = Chi tiết ${n}`, tiêu đề khối mở là `${n}`, dòng liệt kê là `${n}`. Không gọi `toLocaleLowerCase` trên null.
- **Vòng trạng thái của nút đang mở:** `ring-[6px] ring-[rgba(160,68,53,.35)]`. Không dùng `outline` vì nó trùng với viền focus.
- **ExhibitCard:** thêm prop tuỳ chọn `onSecondary?: boolean`. Khi bật, nhãn `HIỆN VẬT 0n` dùng `text-text-muted-alt`, đạt AA trên `bg-bg-secondary`, theo artboard `#5A554C`. ProductsTeaser bật prop này.
- **Số `HIỆN VẬT`** là vị trí gốc của sản phẩm trong `getProducts` (index + 1), không phải vị trí sau khi lọc tên null.
- **Chọn `featured`:** duyệt `getProducts` theo thứ tự, gọi `getProduct(slug, mode)`, lấy sản phẩm đầu tiên có `images.length > 0 && annotations.length > 0`. Không có thì trả `null`. Việc này làm trong `page.tsx` ở Task 8; Task 6 chỉ nhận `featured`.
- **Mobile:** tên hiện vật 22px, không có dòng note. Nhãn ghi chú xác minh mobile chỉ hiện ở preview, nên `ProductsTeaser` nhận thêm `mode: Mode`.
- **Hợp đồng nguồn với Phase 5:** link `/san-pham/${slug}#nguon-${n}` sẽ 404 cho tới khi Phase 5 làm trang hiện vật. Ghi dòng này vào bảng "Ngoài phạm vi".

---

### Task 7: Thư viện (client) và section kết

**Files:**
- Create: `src/components/home/{ArchiveTeaser,Closing}.tsx`
- Test: `tests/unit/home/archive-closing.test.tsx`

**Interfaces:**
- Consumes: `ArchiveItemView[]` (`image.code`, `category`, `title`), `FilterChips` (tone dark), `ContentImage`, `LinkArrow`, `Button`.
- Produces:
  - `ArchiveTeaser(props: { items: ArchiveItemView[] })`. Rỗng thì không render.
  - `Closing()`. Không có props, chữ cố định.

- [ ] **Step 1: Viết test hỏng**

```tsx
it('chip lọc đủ 7 nhóm nguyên văn, Tất cả đang chọn', () => {
  render(<ArchiveTeaser items={items} />)
  const g = screen.getByRole('group', { name: 'Lọc theo nhóm ảnh' })
  expect(within(g).getAllByRole('button').map((b) => b.textContent)).toEqual(['Tất cả', 'Làng quê', 'Nghề dệt', 'Con người', 'Sản phẩm', 'Ký ức', 'Tư liệu lịch sử'])
  expect(within(g).getByRole('button', { name: 'Tất cả' }).getAttribute('aria-pressed')).toBe('true')
})
it('lọc Làng quê chỉ còn ảnh village; ô chờ tư liệu luôn ở cuối', () => {
  render(<ArchiveTeaser items={items} />)
  fireEvent.click(screen.getByRole('button', { name: 'Làng quê' }))
  const tiles = screen.getAllByRole('link', { name: /TL · / })
  expect(tiles.every((t) => t.textContent!.includes('LÀNG QUÊ'))).toBe(true)
  expect(screen.getByText('Ảnh xưa của làng')).toBeTruthy()
})
it('ô ảnh trỏ /thu-vien?anh=TL-xxx, tối đa 5 ô', () => {
  render(<ArchiveTeaser items={tenItems} />)
  const tiles = screen.getAllByRole('link', { name: /TL · / })
  expect(tiles.length).toBeLessThanOrEqual(5)
  expect(tiles[0].getAttribute('href')).toMatch(/^\/thu-vien\?anh=TL-\d{3}$/)
})
it('Closing: tiêu đề hai dòng, nút Góp một ký ức → /ket-noi', () => {
  render(<Closing />)
  expect(screen.getByRole('heading', { level: 2 }).querySelector('em')?.textContent).toBe('Chuyện nghề vẫn được kể tiếp.')
  expect(screen.getByRole('link', { name: 'Góp một ký ức' }).getAttribute('href')).toBe('/ket-noi')
  expect(screen.getByRole('link', { name: 'Kết nối với cơ sở dệt' }).getAttribute('href')).toBe('/ket-noi')
})
```

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.** Giá trị lấy từ `Home.dc.html` (THƯ VIỆN, section kết) và `HomeMobile.dc.html`.
  - **ArchiveTeaser, phần đầu:** nền `bg-bg-deep text-text-on-dark`. Eyebrow "THƯ VIỆN", h2 "Ký ức qua từng khung hình.". Desktop có ghi chú phải `text-text-deep-muted`: "Chưa có ảnh tư liệu lịch sử. Nếu gia đình bạn còn giữ ảnh cũ, hãy góp cùng làng."
  - **Bộ lọc:** `FilterChips tone="dark" label="Lọc theo nhóm ảnh"`. Ánh xạ khoá: `all`, `village`, `weaving`, `people`, `products`, `memory`, `history`, theo đúng thứ tự nhãn ở trên.
  - **Lưới desktop:**
    - `grid-cols-4`, hai hàng, mỗi hàng 280px, `gap-4`.
    - Ô 1 `col-span-2`, ô 2 `row-span-2`, ô 3 đến ô 5 mỗi ô một ô lưới, ô cuối là ô chờ.
    - Ô chờ: `border border-dashed border-[rgba(243,235,221,.4)]`, tiêu đề "Ảnh xưa của làng" (display 24px), dòng "Ô chờ tư liệu lịch sử" `text-text-deep-muted`.
    - Mỗi ô ảnh là một `<Link href="/thu-vien?anh=${code}">`, nhãn `TL · ${số} · ${NHÓM}` nằm `left-3 bottom-3`, nền `rgba(35,42,37,.88)`, chữ 12px `tracking-[.12em]`.
    - Tên nhóm hiển thị theo bảng trên. **Ruling (Claude):** `Ký ức` dùng cho `memory`, `Tư liệu lịch sử` dùng cho `history`.
  - **Lưới mobile:** `grid-cols-2 gap-2`. Ô 1 `col-span-2` cao 180px, các ô khác cao 210px. Nhãn chỉ có `TL · ${số}`.
  - **Link cuối:** `LinkArrow tone="dark"` "Mở thư viện ảnh" → `/thu-vien`.
  - **Closing:**
    - `.threads` rộng 120px (mobile 80px).
    - h2 `font-display text-[72px] leading-[1.15]` (mobile 34px): "Làng vẫn còn đó." + `<br>` + `<em class="italic text-accent">Chuyện nghề vẫn được kể tiếp.</em>`.
    - Đoạn desktop: "Một tấm ảnh cũ, một câu chuyện bà kể, một địa chỉ cơ sở dệt — mỗi đóng góp giúp kho ký ức làng Hới đầy thêm."
    - Đoạn mobile: "Một tấm ảnh cũ, một câu chuyện bà kể — mỗi đóng góp giúp kho ký ức làng Hới đầy thêm."
    - Nút primary "Góp một ký ức" → `/ket-noi`, mobile full width. Link "Kết nối với cơ sở dệt" → `/ket-noi`.
- [ ] **Step 4:** Chạy test, kết quả mong đợi: PASS. Chạy lint.
- [ ] **Step 5:** Commit `feat(home): mục Thư viện và lời kết`.

**Bổ sung sau review:**
- **Import:** test `import { within } from '@testing-library/react'`.
- **Ghi chú phải** "Chưa có ảnh tư liệu lịch sử. Nếu gia đình bạn còn giữ ảnh cũ, hãy góp cùng làng." chỉ hiện khi không có item nào có `category === 'history'`.
- **Mobile:** hiện 3 ô ảnh, ô chờ `col-span-2`. Nhãn chỉ có `TL · số`. Test kiểm nhãn nhóm qua `textContent` của link (gồm cả phần bị ẩn bằng CSS), hoặc chỉ kiểm ở desktop.

---

### Task 8: Ghép trang `/`, hiện dần khi cuộn, e2e, so ảnh chụp

**Files:**
- Create: `src/components/ui/Reveal.tsx`
- Modify: `src/app/(frontend)/page.tsx`
- Test: `tests/unit/reveal.test.tsx`, `tests/e2e/home.e2e.spec.ts`

**Interfaces:**
- Consumes: mọi component của Task 3–7. Dữ liệu: `getMode`, `getPageIntro('home', mode)`, `getHomeMedia(mode)`, `getCraftSteps(mode)`, `getPeople(mode)`, `getStories(mode)`, `getProducts(mode)`, `getProduct(slug, mode)`, `getArchive(mode)`.
- Produces: `Reveal(props: { children: ReactNode; as?: 'div' | 'section' })` (`'use client'`).
  - Khi render ở server hoặc không có JS, nội dung hiện đầy đủ.
  - Có JS thì phần tử ngoài khung nhìn bắt đầu ở `opacity-0 translate-y-4`, rồi về `opacity-100 translate-y-0` trong `--dur-reveal` khi `IntersectionObserver` báo giao nhau, mỗi phần tử một lần.
  - Khi `matchMedia('(prefers-reduced-motion: reduce)')` đúng thì không ẩn gì.

- [ ] **Step 1: Viết test hỏng**

```tsx
// tests/unit/reveal.test.tsx
it('không có IntersectionObserver (SSR/không JS): nội dung hiện, không có opacity-0', () => {
  const { container } = render(<Reveal><p>Nội dung</p></Reveal>)
  expect(container.innerHTML).not.toContain('opacity-0')
})
```

Các test e2e (`tests/e2e/home.e2e.spec.ts`) chạy ở 1440×900 và 390×844, với server dev (`APP_ENV=development`, `PREVIEW_ALL=true`, dữ liệu seed):
  - h1 khớp heroTitle. Có đủ h2: "Có một làng Hới...", "Một tấm chiếu, muôn công đoạn.", "Những bàn tay giữ hồn làng.", "Chuyện làng, kể chậm.", "Nét đẹp từ những đường dệt.", "Ký ức qua từng khung hình.", và h2 kết.
  - Axe không có vi phạm `serious`/`critical`.
  - Bấm công đoạn thứ 3: progressbar `aria-valuenow="3"`. Bấm điểm hoa văn 2: `aria-pressed="true"`. Bấm chip "Nghề dệt": mọi ô ảnh đều có "NGHỀ DỆT".
  - Ở 390: `document.documentElement.scrollWidth <= 390`, mọi `a, button` nhìn thấy trong `main` cao ≥ 44. Miễn kiểm tra cho các phần tử Phase 2 đã miễn: `.fn`, link trong `p`, `[id^="nguon-"] a`.
  - Chế độ public: `page.tsx` không nhận query để đổi mode, nên test public bằng test int/unit thay vì e2e. Viết `tests/unit/home/page-public.test.tsx`: render các section với view model rỗng như khi chạy public, và kiểm tra:
    - trang chỉ còn hero, "Có một làng Hới..." và section kết;
    - `textContent` không chứa `cần xác minh` (không phân biệt hoa thường).
  - Ảnh chụp toàn trang khi đặt `SHOTS_DIR`: `home-1440.png`, `home-390.png`. Bỏ qua khi không đặt.

- [ ] **Step 2:** Chạy test, kết quả mong đợi: FAIL.
- [ ] **Step 3: Viết code.**
  - **Dữ liệu trong `page.tsx`:** gọi song song bằng `Promise.all`. `featured` = sản phẩm đầu tiên trong `getProducts` có `image` khác null, rồi lấy chi tiết bằng `getProduct(slug, mode)`. Nếu sản phẩm đó không có annotation thì `featured = null`.
  - **Thứ tự section:** Hero, VillageIntro, CraftTeaser, PeopleTeaser, StoriesTeaser, ProductsTeaser, ArchiveTeaser, Closing.
  - **Reveal:** bọc mỗi section trừ Hero.
  - **Metadata:** `title: 'Chiếu Hới'`, `description` = lead của intro home. Lead null thì giữ description mặc định của layout.
- [ ] **Step 4:** Chạy `npm run test:unit`, `npm run test:int`, `npm run lint`, `npm run build`, `npm run test:e2e`. Kết quả mong đợi: tất cả PASS.
- [ ] **Step 5:** Chạy e2e với `SHOTS_DIR` trỏ tới scratchpad, đặt ảnh chụp cạnh `design/screens/Home.jpg` và `HomeMobile.jpg`. Lệch về khoảng cách hoặc cỡ chữ thì sửa ngay. Lệch do dữ liệu CMS khác artboard (số công đoạn, tên, số người) thì ghi vào báo cáo.
- [ ] **Step 6:** Commit `feat: trang chủ`.
- [ ] **Step 7:** Dừng lại và gửi người dùng: tóm tắt, ảnh chụp so sánh, danh sách Ruling, cách xem (`npm run seed`, `npm run dev`, mở `/`).

**Bổ sung sau review: tách Task 8.** Task 8 chỉ gồm `Reveal`, `HomeView` và `page.tsx`, kèm test unit. Phần e2e, ảnh chụp và sửa lệch chuyển sang Task 9.
- **`src/components/home/HomeView.tsx`:** component thuần (server) `HomeView(props: { mode: Mode; intro: PageIntroView; media: HomeMediaView; steps: CraftStepView[]; people: PersonView[]; stories: StoryCardView[]; featured: ProductView | null; products: ProductCardView[]; archive: ArchiveItemView[]; storyHref: string | null })`. Nó ghép các section theo thứ tự đã nêu và bọc `Reveal`. `page.tsx` chỉ lấy dữ liệu rồi render `HomeView`.
- **Test `tests/unit/home/home-view.test.tsx`, thay `page-public.test.tsx`:**
  - Mọi mảng rỗng và `featured`, `storyHref` null: chỉ còn h1 cùng h2 "Có một làng Hới..." và h2 kết, không có h2 nào khác.
  - Dữ liệu kiểu public (story idea `hasDetail: false`, `flags: []`, caption null): `textContent` không chứa `cần xác minh`, `chờ xác minh`, `cần xin phép`. Mọi `href` bắt đầu bằng `/cau-chuyen/` đều thuộc bài có `hasDetail`.
- **`Reveal`:** chỉ gọi `matchMedia` khi `typeof window.matchMedia === 'function'`. Thêm test với `IntersectionObserver` và `matchMedia` giả:
  - phần tử ngoài khung nhìn nhận `opacity-0`, rồi hiện khi callback báo giao nhau, và chỉ hiện một lần;
  - khi giảm chuyển động, không ẩn gì;
  - phần tử đã trong khung nhìn lúc mount thì không bao giờ bị ẩn.
- **Bỏ e2e và ảnh chụp khỏi Task 8.** Step 4 của Task 8 chỉ chạy `test:unit`, `test:int`, `lint`, `build`. Không làm Step 5 và Step 7 ở Task 8. Step 6 commit `feat: ghép trang chủ`.

---

### Task 9: E2E trang chủ, ảnh chụp, sửa lệch

**Files:**
- Create: `tests/e2e/home.e2e.spec.ts`
- Modify: `tests/e2e/frontend.e2e.spec.ts`, sửa test đang kiểm `h1` của `/` là "Chiếu Hới" thành kiểm h1 là tiêu đề hero hoặc chỉ kiểm có đúng một h1. Kiểm lại `tests/e2e/layout.e2e.spec.ts` và `foundation.e2e.spec.ts` (cùng `goto('/')`).
- Modify: các component trong `src/components/home/` khi cần sửa lệch so với ảnh chụp.

- [ ] **Step 1: Viết e2e.** Nội dung các test e2e lấy từ danh sách "Các test e2e" của Task 8 ở trên, trừ phần public (đã chuyển sang test `HomeView`). Thêm:
  - ở 1440, kiểm chip "Nghề dệt" qua `textContent` của ô;
  - mọi test gọi `page.emulateMedia({ reducedMotion: 'reduce' })` trước `goto` để `Reveal` không ẩn section khi đo hoặc chụp.
- [ ] **Step 2: Ảnh chụp.** Chỉ chạy khi đặt `SHOTS_DIR`.
  - Trước khi chụp, đăng nhập qua `POST /api/users/login` bằng `SEED_REVIEWER_EMAIL` / `SEED_REVIEWER_PASSWORD` (bỏ qua bước này nếu thiếu biến). Lý do: ảnh preview chưa được phép chỉ tải được khi có cookie admin.
  - Seed trước bằng `SEED_FORCE_GLOBALS=true npm run seed`.
  - Chụp `home-1440.png` và `home-390.png`.
- [ ] **Step 3:** Chạy `npm run test:unit`, `npm run test:int`, `npm run lint`, `npm run build`, `npm run test:e2e`. Kết quả mong đợi: tất cả PASS.
- [ ] **Step 4: So sánh ảnh.** Đặt ảnh chụp cạnh `design/screens/Home.jpg` và `HomeMobile.jpg`. Lệch về khoảng cách hoặc cỡ chữ thì sửa ngay. Lệch do dữ liệu CMS khác artboard thì ghi vào báo cáo.
- [ ] **Step 5:** Commit `test: e2e trang chủ` (kèm các sửa lệch nếu có).
- [ ] **Step 6:** Dừng lại và gửi người dùng: tóm tắt, ảnh chụp, danh sách Ruling, cách xem (`SEED_FORCE_GLOBALS=true npm run seed`, `npm run dev`, mở `/`).

---

## Ngoài phạm vi Phase 3

| Việc | Phase | Ghi chú |
| --- | --- | --- |
| Hành trình đầy đủ (Trước/Tiếp, phóng 1.9×, 7 bước) | 4 | `CraftTeaser` chỉ dùng cho trang chủ |
| Khám phá đường dệt đầy đủ (phóng 2.2×, Esc, "Đóng chi tiết") | 5 | Phase 5 đánh số nguồn trên trang hiện vật theo thứ tự `sourceId` xuất hiện trong annotation, khớp với `PatternTeaser` |
| Lightbox `?anh=TL-xxx` | 5 | Ô ảnh trang chủ đã trỏ sẵn URL này |
| Trang hiện vật `/san-pham/[slug]` có `#nguon-n` | 5 | Link nguồn trong `PatternTeaser` sẽ 404 cho tới Phase 5. Phase 5 đánh số nguồn theo thứ tự `sourceId` xuất hiện trong annotation |
| Kiểm tra lại các trường CMS đang chứa placeholder lạ (vd. `craftSteps.tools`) sau khi mở rộng dấu chưa xác minh | 6 | — |
| Revalidate khi CMS đổi dữ liệu | 6 | — |
