import { Breadcrumb } from '@/components/layout/Breadcrumb'

// Trang giữ chỗ cho khung layout (Task 11); Phase 4 sẽ thay bằng trang Làng Hới thật.
export default function LangHoiPage() {
  return (
    <div className="px-5 py-8 lg:px-20">
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Làng Hới' }]} />
      <h1 className="mt-6 font-display text-h1">Làng Hới</h1>
    </div>
  )
}
