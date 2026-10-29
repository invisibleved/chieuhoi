import { getTranslation } from '@payloadcms/translations'
import { Button, Card } from '@payloadcms/ui'
import { getNavGroups } from '@payloadcms/ui/utilities/getNavGroups'
import { getVisibleEntities } from '@payloadcms/ui/utilities/getVisibleEntities'
import { EntityType, type WidgetServerProps } from 'payload'

import { visibleForUser } from '../visibility'

/** Như CollectionCards của Payload, nhưng danh sách mục đã lọc theo vai trò. */
export function EntitiesWidget({ req, permissions }: WidgetServerProps) {
  const { i18n, payload, user } = req
  const visible = visibleForUser(getVisibleEntities({ req }), user)
  const groups = getNavGroups(permissions, visible, payload.config, i18n)
  return (
    <section className="ch-widget" aria-labelledby="ch-w-entities">
      <h2 id="ch-w-entities" className="ch-widget__title">Tất cả mục</h2>
      {groups.map((group, gi) => (
        <div key={gi} className="ch-entities__group">
          <h3 className="ch-entities__label">{group.label}</h3>
          <ul className="ch-entities__list">
            {group.entities.map(({ slug, type, label }) => {
              const title = getTranslation(label, i18n)
              const isCollection = type === EntityType.collection
              const href = `/admin/${isCollection ? 'collections' : 'globals'}/${slug}`
              return (
                <li key={`${type}-${slug}`}>
                  <Card
                    actions={
                      isCollection && permissions?.collections?.[slug]?.create ? (
                        <Button
                          aria-label={i18n.t('general:createNewLabel', { label: title })}
                          buttonStyle="icon-label"
                          el="link"
                          icon="plus"
                          iconStyle="with-border"
                          round
                          to={`${href}/create`}
                        />
                      ) : undefined
                    }
                    buttonAriaLabel={i18n.t(isCollection ? 'general:showAllLabel' : 'general:editLabel', { label: title })}
                    href={href}
                    id={`card-${slug}`}
                    title={title}
                    titleAs="h4"
                  />
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
