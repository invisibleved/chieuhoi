import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { createArchive } from './archive'
import { createPages } from './pages'
import { createPeople } from './people'
import { createProducts } from './products'
import { createContent } from './queries'
import { createStories } from './stories'

export { createArchive, createContent, createPages, createPeople, createProducts, createStories }
export * from './types'
export { getMode } from './mode'
export { findArchiveItem } from './archiveLookup'
export { archiveCategoryOptions, productGroupOptions } from './categories'
export { homeCopy, type HomeCopyView } from './copy/home'

const bound = async () => createContent(await getPayload({ config }))
const boundPages = async () => {
  const payload = await getPayload({ config })
  return createPages(payload, createContent(payload))
}
const boundPeople = async () => {
  const payload = await getPayload({ config })
  return createPeople(payload, createContent(payload))
}
const boundStories = async () => {
  const payload = await getPayload({ config })
  return createStories(payload, createContent(payload))
}
const boundArchive = async () => {
  const payload = await getPayload({ config })
  return createArchive(payload, createContent(payload))
}
const boundProducts = async () => {
  const payload = await getPayload({ config })
  return createProducts(payload, createContent(payload))
}

export const getSources = async (...a: Parameters<ReturnType<typeof createContent>['getSources']>) => (await bound()).getSources(...a)
export const getTimeline = async (...a: Parameters<ReturnType<typeof createContent>['getTimeline']>) => (await bound()).getTimeline(...a)
export const getCraftSteps = async (...a: Parameters<ReturnType<typeof createContent>['getCraftSteps']>) => (await bound()).getCraftSteps(...a)
export const getProducts = async (...a: Parameters<ReturnType<typeof createContent>['getProducts']>) => (await bound()).getProducts(...a)
export const getProduct = async (...a: Parameters<ReturnType<typeof createContent>['getProduct']>) => (await bound()).getProduct(...a)
export const getStories = async (...a: Parameters<ReturnType<typeof createContent>['getStories']>) => (await bound()).getStories(...a)
export const getStory = async (...a: Parameters<ReturnType<typeof createContent>['getStory']>) => (await bound()).getStory(...a)
export const getPeople = async (...a: Parameters<ReturnType<typeof createContent>['getPeople']>) => (await bound()).getPeople(...a)
export const getPerson = async (...a: Parameters<ReturnType<typeof createContent>['getPerson']>) => (await bound()).getPerson(...a)
export const getArchive = async (...a: Parameters<ReturnType<typeof createContent>['getArchive']>) => (await bound()).getArchive(...a)
export const getSiteSettings = async (...a: Parameters<ReturnType<typeof createContent>['getSiteSettings']>) => (await bound()).getSiteSettings(...a)
export const getPageIntro = async (...a: Parameters<ReturnType<typeof createContent>['getPageIntro']>) => (await bound()).getPageIntro(...a)
export const getHomeMedia = async (...a: Parameters<ReturnType<typeof createContent>['getHomeMedia']>) => (await bound()).getHomeMedia(...a)

export const getPageMedia = async (...a: Parameters<ReturnType<typeof createPages>['getPageMedia']>) => (await boundPages()).getPageMedia(...a)
// cache(): generateMetadata và trang dùng chung một lần đọc trong cùng request.
export const getCraftPage = cache(async (...a: Parameters<ReturnType<typeof createPages>['getCraftPage']>) => (await boundPages()).getCraftPage(...a))
export const getVillagePage = cache(async (...a: Parameters<ReturnType<typeof createPages>['getVillagePage']>) => (await boundPages()).getVillagePage(...a))

export const getStoriesPage = cache(async (...a: Parameters<ReturnType<typeof createStories>['getStoriesPage']>) => (await boundStories()).getStoriesPage(...a))
export const getStoryPage = cache(async (...a: Parameters<ReturnType<typeof createStories>['getStoryPage']>) => (await boundStories()).getStoryPage(...a))
export const getStorySlugs = async () => (await boundStories()).getStorySlugs()

export const getPeoplePage = cache(async (...a: Parameters<ReturnType<typeof createPeople>['getPeoplePage']>) => (await boundPeople()).getPeoplePage(...a))
export const getPersonPage = cache(async (...a: Parameters<ReturnType<typeof createPeople>['getPersonPage']>) => (await boundPeople()).getPersonPage(...a))
export const getPersonSlugs = async () => (await boundPeople()).getPersonSlugs()

export const getProductsPage = cache(async (...a: Parameters<ReturnType<typeof createProducts>['getProductsPage']>) => (await boundProducts()).getProductsPage(...a))
export const getProductPage = cache(async (...a: Parameters<ReturnType<typeof createProducts>['getProductPage']>) => (await boundProducts()).getProductPage(...a))
export const getProductSlugs = async () => (await boundProducts()).getProductSlugs()

export const getArchivePage = cache(async (...a: Parameters<ReturnType<typeof createArchive>['getArchivePage']>) => (await boundArchive()).getArchivePage(...a))
export const getConnectPage = cache(async (...a: Parameters<ReturnType<typeof createPages>['getConnectPage']>) => (await boundPages()).getConnectPage(...a))
