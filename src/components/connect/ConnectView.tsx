import type { ConnectPageView } from "@/lib/content"
import { PageHeader } from "@/components/content/PageHeader"
import { VerifyNote } from "@/components/content/VerifyNote"
import { Eyebrow } from "@/components/ui/Eyebrow"
import { FactList } from "@/components/ui/FactList"
import { VariantText } from "@/components/ui/VariantText"
import { ConnectForm } from "./ConnectForm"

const link = "text-accent hover:text-accent-hover"
const contactNode = (c: { text: string; href: string | null }) =>
  c.href ? <a href={c.href} className={link}>{c.text}</a> : c.text

// Trang Kết nối: đầu trang, bốn cách kết nối (chỉ desktop), form minh hoạ, thông tin liên hệ.
export function ConnectView({ page }: { page: ConnectPageView }) {
  const { copy, intro, contact } = page
  const c = copy.contact
  const crumbs = [
    { label: copy.breadcrumb.home ?? "", href: "/" },
    { label: copy.breadcrumb.current ?? "" },
  ]
  const { email, phone, visit } = contact

  const address = contact.address ? (
    <>
      {contact.address}
      {contact.addressNote ? (
        <>
          <br />
          <span className="text-[13px] text-text-muted">{contact.addressNote}</span>
        </>
      ) : null}
    </>
  ) : null

  const facts = [
    email ? { term: c.labels.email ?? "", detail: contactNode(email) } : null,
    phone ? { term: c.labels.phone ?? "", detail: contactNode(phone) } : null,
    address ? { term: c.labels.address ?? "", detail: address } : null,
    { term: c.labels.visit ?? "", detail: <VariantText value={{ desktop: visit.desktop, mobile: null }} /> },
  ].filter((f) => f !== null)

  const rowBase = "m-0 border-t border-border-soft py-3"

  return (
    <>
      <PageHeader crumbs={crumbs} intro={intro} accentLastLine titleClassName="text-[36px] md:text-[76px]" hideCrumbsOnMobile />

      <ul className="m-0 grid list-none grid-cols-4 gap-x-8 px-20 pb-28 max-md:hidden">
        {copy.ways.map((w) => (
          <li key={w.n} className="flex flex-col gap-3 border-t border-border-strong py-7">
            <Eyebrow tone="muted" tracking="label" className="!text-text-meta">{w.n}</Eyebrow>
            <span className="font-display text-[28px] leading-[1.2]">{w.title}</span>
            <span className="text-[15px] leading-[1.65] text-text-secondary">{w.body}</span>
          </li>
        ))}
      </ul>

      <section
        aria-labelledby="form-h"
        className="flex flex-col gap-5 bg-bg-secondary px-5 pt-9 pb-12 md:grid md:grid-cols-12 md:gap-x-6 md:px-20 md:py-[104px]"
      >
        <div className="flex flex-col gap-5 md:col-span-4 md:gap-[18px]">
          <h2 id="form-h" className="m-0 font-display text-[30px] leading-[1.2] font-normal md:text-[48px] md:leading-[1.12]">
            {copy.form.title}
          </h2>
          {copy.form.lead ? (
            <p className="m-0 text-[16px] leading-[1.7] text-text-secondary max-md:hidden">{copy.form.lead}</p>
          ) : null}
          {copy.form.note.desktop ? (
            <div className="max-md:hidden">
              <VerifyNote role="note">{copy.form.note.desktop}</VerifyNote>
            </div>
          ) : null}
          {copy.form.note.mobile ? (
            <div className="md:hidden">
              <VerifyNote role="note" size="sm">{copy.form.note.mobile}</VerifyNote>
            </div>
          ) : null}
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <ConnectForm copy={copy.form} />
        </div>
      </section>


      <section
        aria-labelledby="contact-h"
        className="flex flex-col gap-1 px-5 py-10 text-[15px] leading-[1.6] md:grid md:grid-cols-12 md:gap-x-6 md:gap-y-6 md:px-20 md:py-[104px]"
      >
        <h2 id="contact-h" className="m-0 mb-2.5 font-display text-[24px] font-normal md:col-span-4 md:mb-0 md:text-[40px] md:leading-[1.15]">
          {c.title}
        </h2>
        <FactList items={facts} columns={2} className="max-md:hidden md:col-span-7 md:col-start-6" />
        <div className="md:hidden">
          {contact.mobileLine ? <p className={`${rowBase} !border-border-strong`}>{contact.mobileLine}</p> : null}
          {address ? <p className={rowBase}>{address}</p> : null}
          <p className={`${rowBase} border-b`}>
            <VariantText value={{ desktop: null, mobile: visit.mobile }} />
          </p>
        </div>
      </section>
    </>
  )
}
