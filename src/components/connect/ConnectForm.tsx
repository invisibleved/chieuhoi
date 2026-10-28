"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import type { ConnectCopyView } from "@/lib/content"
import { fillTemplate } from "@/lib/template"
import { Button } from "@/components/ui/Button"
import { SuccessState } from "@/components/ui/Feedback"
import { ChoiceGroup } from "@/components/ui/form/ChoiceGroup"
import { ConsentCheck } from "@/components/ui/form/ConsentCheck"
import { ErrorSummary } from "@/components/ui/form/ErrorSummary"
import { TextArea } from "@/components/ui/form/TextArea"
import { TextField } from "@/components/ui/form/TextField"
import { UploadPlaceholder } from "@/components/ui/form/UploadPlaceholder"
import { connectErrors } from "./connectErrors"

const INITIAL = { name: "", contact: "", story: "", type: "photo", consent: false, tried: false, sent: false }

// Form minh hoạ (R16): không fetch, không lưu trình duyệt, không đưa dữ liệu lên URL.
// `method="dialog"` ngoài <dialog> không gửi gì, nên tắt JS cũng không có dữ liệu rời trang.
export function ConnectForm({ copy }: { copy: ConnectCopyView["form"] }) {
  const [s, setS] = useState(INITIAL)
  const [attempt, setAttempt] = useState(0)
  const [again, setAgain] = useState(0)
  const summaryRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const set = (patch: Partial<typeof INITIAL>) => setS((prev) => ({ ...prev, ...patch }))

  const errors = connectErrors(s, s.tried)

  useEffect(() => {
    if (attempt > 0) summaryRef.current?.focus()
  }, [attempt])
  useEffect(() => {
    if (again > 0) document.getElementById("c-name")?.focus()
  }, [again])
  useEffect(() => {
    if (s.sent) successRef.current?.focus()
  }, [s.sent])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (connectErrors(s, true).count === 0) {
      set({ sent: true, tried: false })
    } else {
      set({ tried: true })
      setAttempt((n) => n + 1)
    }
  }

  if (s.sent) {
    const success = copy.success
    return (
      <div ref={successRef} tabIndex={-1} className="outline-none">
        <SuccessState
          size="lg"
          headingLevel="h3"
          title={fillTemplate(success.title ?? "", { name: s.name.trim() || success.fallbackName })}
          body={fillTemplate(success.body ?? "", { contact: s.contact.trim() || success.fallbackContact })}
          action={{
            label: success.again ?? "",
            onClick: () => {
              setS(INITIAL)
              setAgain((n) => n + 1)
            },
          }}
        />
      </div>
    )
  }

  return (
    <form method="dialog" noValidate onSubmit={submit} className="flex flex-col gap-5 md:gap-7">
      <ErrorSummary
        ref={summaryRef}
        count={errors.count}
        text={{ count: copy.summary.count ?? "", rest: copy.summary.rest ?? "" }}
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        <TextField
          id="c-name"
          label={copy.name.label ?? ""}
          value={s.name}
          onChange={(name) => set({ name })}
          autoComplete="name"
          error={errors.name ? copy.name.error : null}
        />
        <TextField
          id="c-contact"
          label={copy.contact.label ?? ""}
          value={s.contact}
          onChange={(contact) => set({ contact })}
          autoComplete="email"
          error={errors.contact ? copy.contact.error : null}
        />
      </div>
      <ChoiceGroup
        name="type"
        legend={copy.type.legend ?? ""}
        options={copy.type.options.map((o) => ({ value: o.value ?? "", label: o.label ?? "" }))}
        value={s.type}
        onChange={(type) => set({ type })}
      />
      <TextArea
        id="c-story"
        label={copy.story.label ?? ""}
        hint={copy.story.hint ?? undefined}
        value={s.story}
        onChange={(story) => set({ story })}
      />
      <UploadPlaceholder label={copy.upload.label ?? ""} title={copy.upload.title ?? ""} hint={copy.upload.hint ?? ""} />
      <ConsentCheck
        id="c-consent"
        label={copy.consent.label ?? ""}
        checked={s.consent}
        onChange={(consent) => set({ consent })}
        error={errors.consent ? copy.consent.error : null}
      />
      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-6">
        <Button type="submit" className="max-md:justify-center">
          {copy.submit}
        </Button>
        <span className="text-[13px] text-text-muted-alt">{copy.withdraw}</span>
      </div>
    </form>
  )
}
