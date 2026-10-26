import Link from 'next/link'
import { Button } from '@/components/ui/Button'

// Section kết: chữ cố định, không phụ thuộc dữ liệu.
export function Closing() {
  return (
    <section className="flex flex-col items-center gap-6 px-5 py-20 text-center md:gap-10 md:px-20 md:py-[140px]">
      <div aria-hidden="true" className="threads h-[14px] w-20 md:w-[120px]" />
      <h2 className="font-display text-[34px] leading-[1.2] font-normal md:text-[72px] md:leading-[1.15]">
        Làng vẫn còn đó.
        <br />
        <em className="italic text-accent">Chuyện nghề vẫn được kể tiếp.</em>
      </h2>
      <p className="hidden max-w-[620px] text-[19px] leading-[1.65] text-text-secondary md:block">
        Một tấm ảnh cũ, một câu chuyện bà kể, một địa chỉ cơ sở dệt — mỗi đóng góp giúp kho ký ức làng Hới đầy thêm.
      </p>
      <p className="text-[16px] leading-[1.65] text-text-secondary md:hidden">
        Một tấm ảnh cũ, một câu chuyện bà kể — mỗi đóng góp giúp kho ký ức làng Hới đầy thêm.
      </p>
      <div className="flex w-full flex-col items-center gap-6 md:w-auto md:flex-row md:gap-8">
        <Button href="/ket-noi" className="w-full justify-center md:w-auto">Góp một ký ức</Button>
        <Link href="/ket-noi" className="inline-flex min-h-11 items-center text-[15px] font-medium text-accent hover:text-accent-hover hover:underline hover:decoration-2 hover:underline-offset-4">
          Kết nối với cơ sở dệt
        </Link>
      </div>
    </section>
  )
}
