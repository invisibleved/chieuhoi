import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen, within } from "@testing-library/react"
import type { ConnectPageView } from "@/lib/content"
import { applyMode } from "@/lib/content/copy/applyMode"
import { connectCopy } from "@/lib/content/copy/connect"
import { ConnectView } from "@/components/connect/ConnectView"

afterEach(cleanup)

const view = (mode: "public" | "preview", over: Partial<ConnectPageView["contact"]> = {}): ConnectPageView => ({
  intro: {
    eyebrow: "KẾT NỐI",
    title: "Làng vẫn còn đó.\nChuyện nghề vẫn được kể tiếp.",
    lead: "Góp một tấm ảnh.",
    heroTitle: null,
  },
  contact: { email: null, phone: null, address: "Làng Hới (Hải Triều)", addressNote: "Theo Vietnam+", visitInfo: null, ...over },
  copy: applyMode(connectCopy, mode),
})

describe("ConnectView", () => {
  it("h1 có em ở dòng cuối", () => {
    render(<ConnectView page={view("public")} />)
    const h1 = screen.getByRole("heading", { level: 1 })
    expect(h1.querySelector("em")?.textContent).toBe("Chuyện nghề vẫn được kể tiếp.")
  })

  it("public: không placeholder email, có địa chỉ và câu chưa có thông tin tham quan", () => {
    render(<ConnectView page={view("public")} />)
    expect(screen.queryByText(/\[Email liên hệ\]/)).toBeNull()
    expect(screen.queryByText(/\[Số điện thoại\]/)).toBeNull()
    expect(screen.getAllByText(/Làng Hới \(Hải Triều\)/)).toBeTruthy()
    expect(screen.getAllByText(/Chưa có thông tin tham quan chính thức/).length).toBeGreaterThan(0)
  })

  it("preview: có placeholder email", () => {
    render(<ConnectView page={view("preview")} />)
    expect(screen.getAllByText(/\[Email liên hệ\]/).length).toBeGreaterThan(0)
  })

  it("email và điện thoại là mailto/tel", () => {
    render(<ConnectView page={view("public", { email: "a@b.vn", phone: "0123 456" })} />)
    expect(screen.getAllByRole("link", { name: "a@b.vn" })[0].getAttribute("href")).toBe("mailto:a@b.vn")
    expect(screen.getAllByRole("link", { name: "0123 456" })[0].getAttribute("href")).toBe("tel:0123456")
  })

  it("có câu Bản minh hoạ thiết kế. trong khung role=note", () => {
    render(<ConnectView page={view("public")} />)
    const notes = screen.getAllByRole("note")
    expect(notes.some((n) => n.textContent?.includes("Bản minh hoạ thiết kế."))).toBe(true)
  })

  it("section form có aria-labelledby tới h2 Góp một ký ức; bốn cách kết nối", () => {
    render(<ConnectView page={view("public")} />)
    const h2 = screen.getByRole("heading", { level: 2, name: "Góp một ký ức" })
    expect(document.querySelector(`section[aria-labelledby="${h2.id}"]`)).toBeTruthy()
    expect(within(document.body).getByText("Hợp tác văn hoá")).toBeTruthy()
  })
})
