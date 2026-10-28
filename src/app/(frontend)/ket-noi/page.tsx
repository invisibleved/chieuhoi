import type { Metadata } from "next"

import { ConnectView } from "@/components/connect/ConnectView"
import { getConnectPage, getMode } from "@/lib/content"

export async function generateMetadata(): Promise<Metadata> {
  const { intro, copy } = await getConnectPage(await getMode())
  const title = (copy.breadcrumb.current ?? intro.title ?? "").replace(/\n/g, " ")
  return intro.lead ? { title, description: intro.lead } : { title }
}

export default async function ConnectPage() {
  const page = await getConnectPage(await getMode())
  return <ConnectView page={page} />
}
