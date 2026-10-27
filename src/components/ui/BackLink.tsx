import Link from 'next/link'

// "← {label}" đầu trang chi tiết trên mobile; từ md đã có breadcrumb nên ẩn.
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center text-[15px] font-medium text-accent hover:text-accent-hover hover:underline hover:decoration-2 hover:underline-offset-4 md:hidden">
      ← {label}
    </Link>
  )
}
