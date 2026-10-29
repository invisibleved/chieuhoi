import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter, SetStepNav } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import { formatAdminURL } from 'payload/shared'

import { type GuideSection, guideTextParts, sectionsFor } from './sections'
import { GUIDE_SHOTS } from './shots'

const PARTS: { audience: GuideSection['audience']; title: string }[] = [
  { audience: 'all', title: 'Dành cho mọi người' },
  { audience: 'reviewer', title: 'Dành cho người duyệt' },
]

const shotById = new Map(GUIDE_SHOTS.map((s) => [s.id, s]))

function StepText({ text }: { text: string }) {
  return (
    <p className="ch-guide__step-text">
      {guideTextParts(text).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : p.text))}
    </p>
  )
}

function Shot({ id }: { id: string }) {
  const shot = shotById.get(id)
  if (!shot) return null
  return (
    <picture className="ch-guide__shot">
      {shot.mobile && <source media="(max-width: 640px)" srcSet={`/admin-guide/${id}-mobile.png`} width={390} height={844} />}
      <img className="ch-guide__img" src={`/admin-guide/${id}.png`} alt={shot.alt} width={1440} height={900} />
    </picture>
  )
}

/** Trang Hướng dẫn trong admin (`/admin/huong-dan`). Biên tập viên thấy phần cho mọi người; người duyệt thấy cả hai phần. */
export function GuideView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, permissions, locale, visibleEntities } = initPageResult
  const { payload, user } = req
  // View tự thêm được Payload coi là công khai: tự chuyển về trang đăng nhập khi chưa đăng nhập.
  if (!user) {
    const { routes, admin } = payload.config
    const login = formatAdminURL({ adminRoute: routes.admin, path: admin.routes.login })
    const back = formatAdminURL({ adminRoute: routes.admin, path: '/huong-dan' })
    redirect(`${login}?redirect=${encodeURIComponent(back)}`)
  }

  const sections = sectionsFor(user)
  const parts = PARTS.map((p) => ({ ...p, sections: sections.filter((s) => s.audience === p.audience) })).filter(
    (p) => p.sections.length > 0,
  )

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={user}
      visibleEntities={{ collections: visibleEntities.collections, globals: visibleEntities.globals }}
    >
      <SetStepNav nav={[{ label: 'Hướng dẫn' }]} />
      <Gutter className="ch-guide">
        <h1 className="ch-guide__title">Hướng dẫn</h1>
        <p className="ch-guide__intro">Trang này chỉ cách làm những việc thường gặp. Bấm vào tên một việc để đọc từng bước.</p>

        <nav className="ch-guide__toc" aria-labelledby="ch-guide-toc">
          <h2 id="ch-guide-toc" className="ch-guide__toc-title">Mục lục</h2>
          {parts.map((p) => (
            <div key={p.audience} className="ch-guide__toc-part">
              <h3 className="ch-guide__toc-label">{p.title}</h3>
              <ul className="ch-guide__toc-list">
                {p.sections.map((s) => (
                  <li key={s.id}>
                    <a className="ch-guide__toc-link" href={`#${s.id}`}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {parts.map((p) => (
          <div key={p.audience} className="ch-guide__part">
            <h2 className="ch-guide__part-title">{p.title}</h2>
            {p.sections.map((s) => (
              <section key={s.id} id={s.id} className="ch-guide__section" aria-labelledby={`${s.id}-title`}>
                <h3 id={`${s.id}-title`} className="ch-guide__section-title">
                  {s.title}
                </h3>
                <p className="ch-guide__when">{s.when}</p>
                <ol className="ch-guide__steps">
                  {s.steps.map((st, i) => (
                    <li key={i} className="ch-guide__step">
                      <StepText text={st.text} />
                      {st.shot && <Shot id={st.shot} />}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        ))}
      </Gutter>
    </DefaultTemplate>
  )
}
