import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { applyMode } from "@/lib/content/copy/applyMode"
import { connectCopy } from "@/lib/content/copy/connect"
import { ConnectForm } from "@/components/connect/ConnectForm"
import { connectErrors } from "@/components/connect/connectErrors"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const copy = applyMode(connectCopy, "public").form
const setup = () => render(<ConnectForm copy={copy} />)
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Gửi đóng góp" }))
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const fillAll = (name = "Lan") => {
  type("Họ và tên", name)
  type("Số điện thoại hoặc email", "lan@example.com")
  fireEvent.click(screen.getByRole("checkbox"))
}

describe("connectErrors", () => {
  it("chưa bấm Gửi thì không lỗi", () => {
    expect(connectErrors({ name: "", contact: "", consent: false }, false)).toEqual({ name: false, contact: false, consent: false, count: 0 })
  })
  it("đã bấm: trống, chỉ khoảng trắng và chưa đồng ý đều tính lỗi", () => {
    expect(connectErrors({ name: "  ", contact: "", consent: false }, true).count).toBe(3)
    expect(connectErrors({ name: "Lan", contact: "x", consent: true }, true).count).toBe(0)
    expect(connectErrors({ name: "   ", contact: "x", consent: true }, true)).toMatchObject({ name: true, count: 1 })
  })
})

describe("ConnectForm", () => {
  it("form method=dialog và noValidate", () => {
    const { container } = setup()
    const form = container.querySelector("form")!
    expect(form.getAttribute("method")).toBe("dialog")
    expect(form.noValidate).toBe(true)
  })

  it("gửi trống: 3 lỗi, alert được focus, ô nhập aria-invalid", () => {
    setup()
    submit()
    const alert = screen.getByRole("alert")
    expect(alert.textContent).toContain("Còn 3 mục cần bổ sung.")
    expect(document.activeElement).toBe(alert)
    expect(screen.getByLabelText("Họ và tên").getAttribute("aria-invalid")).toBe("true")
    expect(screen.getByLabelText("Số điện thoại hoặc email").getAttribute("aria-invalid")).toBe("true")
    expect(screen.getByText("Cần xác nhận quyền chia sẻ trước khi gửi.")).toBeTruthy()
  })

  it("gõ tên thì còn 2 mục", () => {
    setup()
    submit()
    type("Họ và tên", "Lan")
    expect(screen.getByRole("alert").textContent).toContain("Còn 2 mục cần bổ sung.")
  })

  it("điền đủ và đồng ý: màn hình thành công, không fetch, không localStorage", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    const setItem = vi.spyOn(Storage.prototype, "setItem")
    setup()
    fillAll()
    submit()
    const status = screen.getByRole("status")
    expect(status.textContent).toContain("Cảm ơn Lan.")
    expect(status.textContent).toContain("lan@example.com")
    expect(status.textContent).toContain("minh hoạ")
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(setItem).not.toHaveBeenCalled()
  })

  it("tên chỉ có khoảng trắng vẫn lỗi tên", () => {
    setup()
    fillAll("   ")
    submit()
    expect(screen.getByRole("alert").textContent).toContain("Còn 1 mục cần bổ sung.")
    expect(screen.getByLabelText("Họ và tên").getAttribute("aria-invalid")).toBe("true")
  })

  it("Góp thêm một ký ức xoá form và focus ô Họ và tên", () => {
    setup()
    fillAll()
    submit()
    fireEvent.click(screen.getByRole("button", { name: "Góp thêm một ký ức" }))
    const name = screen.getByLabelText("Họ và tên") as HTMLInputElement
    expect(name.value).toBe("")
    expect(document.activeElement).toBe(name)
    expect(screen.queryByRole("status")).toBeNull()
  })

  it("không có input file", () => {
    const { container } = setup()
    expect(container.querySelector("input[type=file]")).toBeNull()
  })

  it("lựa chọn đầu tiên được chọn sẵn, kể cả sau khi đặt lại", () => {
    const first = copy.type.options[0].label ?? ""
    setup()
    expect((screen.getByLabelText(first) as HTMLInputElement).checked).toBe(true)
    fireEvent.click(screen.getByLabelText(copy.type.options[1].label ?? ""))
    fillAll()
    submit()
    fireEvent.click(screen.getByRole("button", { name: "Góp thêm một ký ức" }))
    expect((screen.getByLabelText(first) as HTMLInputElement).checked).toBe(true)
  })
})
