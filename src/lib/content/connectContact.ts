// Thông tin liên hệ của /ket-noi, đã định dạng sẵn để component chỉ việc hiển thị (R18).
import type { ConnectCopyView } from "./copy/connect"
import type { ConnectPageView, Variant } from "./types"

type Contact = ConnectPageView["contact"]
type Raw = { email: string | null; phone: string | null; address: string | null; addressNote: string | null; visitInfo: string | null }

const telHref = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, "")
  return /\d/.test(digits) ? `tel:${digits}` : null
}
const mailHref = (email: string) => (email.includes("@") ? `mailto:${email}` : null)

// Giá trị thật có liên kết; trống thì preview hiện placeholder (không liên kết), public là null.
const link = (value: string | null, placeholder: string | null | undefined, href: (v: string) => string | null) =>
  value ? { text: value, href: href(value) } : placeholder ? { text: placeholder, href: null } : null

export function buildConnectContact(raw: Raw, copy: ConnectCopyView): Contact {
  const c = copy.contact
  const email = link(raw.email, c.preview?.email, mailHref)
  const phone = link(raw.phone, c.preview?.phone, telHref)
  const visit: Variant = raw.visitInfo
    ? { desktop: raw.visitInfo, mobile: `${c.visitPrefix.mobile ?? ""}${raw.visitInfo}` }
    : c.noVisit
  return {
    email,
    phone,
    address: raw.address,
    addressNote: raw.addressNote,
    visit,
    mobileLine: [email?.text, phone?.text].filter(Boolean).join(" · ") || null,
  }
}
