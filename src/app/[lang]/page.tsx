import { redirect } from 'next/navigation'

import { i18n } from '@configs/i18n'

export default function RootPage({ params }: { params: { lang: string } }) {
  const locale = i18n.locales.includes(params.lang as (typeof i18n.locales)[number]) ? params.lang : i18n.defaultLocale

  redirect(`/${locale}/landing`)
}
