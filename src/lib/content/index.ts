import config from '@payload-config'
import { getPayload } from 'payload'

import { createPages } from './pages'
import { createContent } from './queries'

export { createContent, createPages }
export * from './types'
export { getMode } from './mode'
export { archiveCategoryOptions } from './categories'

const bound = async () => createContent(await getPayload({ config }))
const boundPages = async () => {
  const payload = await getPayload({ config })
  return createPages(payload, createContent(payload))
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
export const getCraftPage = async (...a: Parameters<ReturnType<typeof createPages>['getCraftPage']>) => (await boundPages()).getCraftPage(...a)
export const getVillagePage = async (...a: Parameters<ReturnType<typeof createPages>['getVillagePage']>) => (await boundPages()).getVillagePage(...a)
