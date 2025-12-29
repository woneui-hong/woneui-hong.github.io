/**
 * Language utility functions for server and client components
 */

export type Language = 'en' | 'ko'

/**
 * Get language from searchParams and cookies (server component)
 * Priority: searchParams > cookie > default ('en')
 */
export async function getLanguageFromServer(
  searchParams?: { lang?: string },
  defaultLang: Language = 'en'
): Promise<Language> {
  const langParam = searchParams?.lang as Language | undefined
  
  // Try to get language from cookie
  let langCookie: Language | undefined
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    langCookie = cookieStore.get('lang')?.value as Language | undefined
  } catch (error) {
    // cookies() can fail in some contexts (e.g., during build)
    langCookie = undefined
  }
  
  // URL param takes priority if explicitly set, otherwise use cookie (global state)
  return langParam || langCookie || defaultLang
}

/**
 * Get language from URL and cookies (client component)
 * Priority: URL > cookie > default ('en')
 */
export function getLanguageFromClient(defaultLang: Language = 'en'): Language {
  if (typeof window === 'undefined') {
    return defaultLang
  }
  
  const langFromUrl = new URLSearchParams(window.location.search).get('lang') as Language | null
  const langFromCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('lang='))
    ?.split('=')[1] as Language | undefined
  
  return langFromUrl || langFromCookie || defaultLang
}

