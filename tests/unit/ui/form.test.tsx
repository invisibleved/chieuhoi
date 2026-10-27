import { createRef, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TextField } from '@/components/ui/form/TextField'
import { TextArea } from '@/components/ui/form/TextArea'
import { ChoiceGroup } from '@/components/ui/form/ChoiceGroup'
import { ConsentCheck } from '@/components/ui/form/ConsentCheck'
import { ErrorSummary } from '@/components/ui/form/ErrorSummary'
import { UploadPlaceholder } from '@/components/ui/form/UploadPlaceholder'

describe('TextField', () => {
  it('có lỗi: aria-invalid và aria-describedby trỏ tới chữ lỗi', () => {
    render(<TextField id="n" label="Họ và tên" value="" onChange={() => {}} error="Vui lòng cho biết tên." />)
    const input = screen.getByLabelText('Họ và tên')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const id = input.getAttribute('aria-describedby')
    expect(id).toBeTruthy()
    expect(document.getElementById(id as string)?.textContent).toContain('Vui lòng cho biết tên.')
  })
  it('không lỗi: không aria-describedby, gọi onChange', () => {
    const seen: string[] = []
    render(<TextField id="n" label="Họ và tên" value="" onChange={(v) => seen.push(v)} />)
    const input = screen.getByLabelText('Họ và tên')
    expect(input.getAttribute('aria-describedby')).toBeNull()
    expect(input.getAttribute('aria-invalid')).toBeNull()
    fireEvent.change(input, { target: { value: 'Lan' } })
    expect(seen).toEqual(['Lan'])
  })
})

describe('TextArea', () => {
  it('nhãn thật, gợi ý nối qua aria-describedby', () => {
    render(<TextArea id="s" label="Câu chuyện" value="" onChange={() => {}} hint="Ví dụ: năm nào." />)
    const ta = screen.getByLabelText('Câu chuyện')
    expect(ta.tagName).toBe('TEXTAREA')
    expect(document.getElementById(ta.getAttribute('aria-describedby') as string)?.textContent).toBe('Ví dụ: năm nào.')
  })
})

const OPTS = [
  { value: 'a', label: 'Ảnh' },
  { value: 'b', label: 'Chuyện' },
  { value: 'c', label: 'Người' },
  { value: 'd', label: 'Khác' },
] as const
function Harness() {
  const [v, setV] = useState<'a' | 'b' | 'c' | 'd'>('a')
  return <ChoiceGroup name="type" legend="Bạn muốn góp gì?" options={[...OPTS]} value={v} onChange={setV} />
}

describe('ChoiceGroup', () => {
  it('fieldset/legend, 4 radio cùng name, đúng một checked', () => {
    render(<Harness />)
    expect(screen.getByRole('group', { name: 'Bạn muốn góp gì?' }).tagName).toBe('FIELDSET')
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    expect(radios).toHaveLength(4)
    expect(new Set(radios.map((r) => r.name))).toEqual(new Set(['type']))
    expect(radios.filter((r) => r.checked)).toHaveLength(1)
  })
  it('chọn một thẻ thì đổi checked', () => {
    render(<Harness />)
    fireEvent.click(screen.getByLabelText('Chuyện'))
    expect((screen.getByLabelText('Chuyện') as HTMLInputElement).checked).toBe(true)
    expect((screen.getByLabelText('Ảnh') as HTMLInputElement).checked).toBe(false)
  })
})

describe('ConsentCheck', () => {
  it('bấm vào chữ nhãn thì đổi checked; lỗi nối aria-describedby', () => {
    function C() {
      const [c, setC] = useState(false)
      return <ConsentCheck id="ok" label="Tôi đồng ý" checked={c} onChange={setC} error="Cần xác nhận." />
    }
    render(<C />)
    const box = screen.getByRole('checkbox') as HTMLInputElement
    expect(box.checked).toBe(false)
    expect(box.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById(box.getAttribute('aria-describedby') as string)?.textContent).toContain('Cần xác nhận.')
    fireEvent.click(screen.getByText('Tôi đồng ý'))
    expect(box.checked).toBe(true)
  })
})

describe('ErrorSummary', () => {
  const text = { count: 'Còn {n} mục cần bổ sung.', rest: 'Xem các ô được đánh dấu bên dưới.' }
  it('count=2 render trong role=alert, focus được bằng ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ErrorSummary ref={ref} count={2} text={text} />)
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toContain('Còn 2 mục cần bổ sung.')
    expect(alert.getAttribute('tabindex')).toBe('-1')
    expect(ref.current).toBe(alert)
  })
  it('count=0 không render', () => {
    render(<ErrorSummary count={0} text={text} />)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('UploadPlaceholder', () => {
  it('khung tĩnh, không có input', () => {
    const { container } = render(<UploadPlaceholder label="Ảnh hoặc tệp" title="Kéo ảnh vào đây" hint="minh hoạ" />)
    expect(container.querySelector('input')).toBeNull()
    expect(screen.getByText('Ảnh hoặc tệp')).toBeTruthy()
    expect(screen.getByText('minh hoạ')).toBeTruthy()
  })
})
