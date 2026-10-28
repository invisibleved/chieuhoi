# Task 9 report: /thu-vien

Status: DONE_WITH_CONCERNS

## Implementation
- `src/app/(frontend)/thu-vien/page.tsx`: dynamic; `searchParams` Promise, first value only; `initialCode` is passed down only when it matches a visible item (so a hidden item's code never enters the RSC payload). `generateMetadata`: "{title} · Thư viện" + OG image when `?anh=` matches an item in the view model, else intro title/lead.
- `src/components/archive/ArchiveView.tsx`: dark band (`bg-bg-deep text-text-on-dark`) with `PageHeader tone="dark"`, `dl` (TƯ LIỆU / ĐÃ XÁC MINH NGUỒN, 36px display), ThreadsDivider, `ArchiveGallery`; then `CtaBand tone="primary"`.
- `PageHeader` `tone?: 'light'|'dark'` (+ `Breadcrumb tone`, `Eyebrow tone="muted-dark"`): unit tests and a styleguide sample added.
- Bug found by axe in preview (Task 5 never ran axe e2e): `label-content-name-mismatch` on every tile because the "Ảnh chưa được phép đăng" note is visible text inside the link. Fix in `ArchiveGallery`: aria-label now includes `previewNotes(flags)` before the chip text, and a `{' '}` text node separates note and chip (axe concatenates visible text without a separator). Unit test added.

## TDD
- RED: `npx vitest run tests/unit/archive tests/unit/content/page-header.test.tsx` -> archive-view.test failed to import ArchiveView; "PageHeader tone > tone dark" failed (`expected ... to contain 'text-accent-on-dark'`).
- GREEN: same command plus `tests/unit/ui/common.test.tsx`: 10 files, 132 tests passed.

## Results
- lint 0 errors; `test:unit` 48 files / 524 tests pass; `build` OK (`ƒ /thu-vien`); full `test:e2e` 211 passed (chromium + public).
- E2E: new `tests/e2e/archive.e2e.spec.ts` (open/URL/focus on Đóng/ArrowRight/Tab x10/Esc + focus return, direct TL-005 + title + og:image, lowercase code, unknown code, empty filter, swipe at 390, no-JS dialog and "Ảnh tiếp" href, home teaser tile and "Mở thư viện ảnh" link, axe at 1440/390 incl. dialog open). Public cases in `public-pages.e2e.spec.ts`: "0 tư liệu", empty frame, no tiles, axe, TL-004 no dialog/no `nkc10`/"Bên khung dệt"/`TL-004`/og:image.

## Screenshots (/private/tmp/claude-501/-Users-luongdd-Documents-code-me-chieuhoivn/7a403193-6fa6-4cf4-8114-8bb55c7f7741/scratchpad/phase5b-shots/thu-vien/)
thu-vien-preview-{1440,390}.png, thu-vien-preview-lightbox-{1440,390}.png, thu-vien-public-{1440,390}.png.
Deviations vs design:
1. Site header and footer stay light (artboard draws them dark on this page). Layout is global; not changed.
2. Preview tiles show "Ảnh chưa được phép đăng" top-right (R20, preview only); the artboard has no such note.
3. Lightbox cover: the page behind shows faintly through the .97 overlay, as designed.
4. Mobile: category in chip hidden (as artboard); mobile has no era filter (R13).

## Concerns
- The request URL echo `anh=TL-004` is unavoidable in the RSC payload (router state), so the public leak test strips `anh=TL-004` before asserting no `TL-004`. No item data leaks.
- Task 5 minor (label composition duplicated in ArchiveGallery) not moved to the view model.
- `ArchiveTeaser` "Mở thư viện ảnh" links to `/thu-vien` (no `?anh=`); the tile links open the exact photo. Tested as such.
- Header/footer dark tone not done (deviation 1).

## Fix round 1
Finding: code matching duplicated in page.tsx and ArchiveGallery.
- New pure helper `src/lib/content/archiveLookup.ts` `findArchiveItem(items, code: string | string[] | undefined | null)`: first value of an array, case-insensitive, matches only within the (permission-filtered) items. Exported from `src/lib/content/index.ts`.
- `thu-vien/page.tsx` uses it in `generateMetadata` and the page; the local `firstCode` and both `toLowerCase` blocks are gone.
- `ArchiveGallery` now does exact match on the canonical code from the server (case rule lives only in the helper); unit test renamed accordingly.
- Tests: new `tests/unit/content/archive-lookup.test.ts` (exact, lowercase, array first value, unknown, empty string, null, undefined, empty array, empty items).
- Run: vitest (lookup, archive-gallery, tests/unit/archive, architecture): 4 files, 27 tests passed. `npm run lint` clean. `npx tsc --noEmit` clean. Playwright `archive.e2e public-pages.e2e -g "thư viện"`: 16 passed, 4 skipped (screenshot cases without SHOTS_DIR).
