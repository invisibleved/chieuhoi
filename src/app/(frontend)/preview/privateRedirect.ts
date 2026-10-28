/**
 * 307 tới đường dẫn nội bộ (Location tương đối, như redirect() của Next), không cho cache:
 * response mang cookie __prerender_bypass. Next tự gắn cookie của draftMode() vào response trả về.
 */
export function privateRedirect(path: string): Response {
  return new Response(null, {
    status: 307,
    headers: { Location: path, 'Cache-Control': 'private, no-store' },
  })
}
