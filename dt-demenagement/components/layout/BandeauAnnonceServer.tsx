import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_noStore as noStore } from 'next/cache'
import { BandeauAnnonce } from '@/components/layout/BandeauAnnonce'

type SettingsDoc = { bandeauAlerte?: string | null }

export async function BandeauAnnonceServer({ locale }: { locale: string }) {
  noStore()
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'settings',
      locale: locale as 'fr' | 'ar' | 'en',
      depth: 0,
    }) as SettingsDoc
    if (!settings.bandeauAlerte) return null
    return <BandeauAnnonce texte={settings.bandeauAlerte} />
  } catch {
    return null
  }
}
