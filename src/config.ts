export type AppConfig = {
  baseUrl: string
  projectId: number | null
  publicProjectKey: string
  manageProjectKey: string
  collectionSlug: string
  environment: string
}

const sanitizeBaseUrl = (value?: string) => {
  if (!value) return ''
  return value.replace(/\/$/, '').trim()
}

const numberFromEnv = (value: string | undefined): number | null => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const config: AppConfig = {
  baseUrl:
    sanitizeBaseUrl(import.meta.env.VITE_REQRES_BASE_URL) ||
    (import.meta.env.DEV ? 'http://localhost:8000' : 'https://reqres.in'),
  projectId: numberFromEnv(import.meta.env.VITE_REQRES_PROJECT_ID),
  publicProjectKey: (import.meta.env.VITE_REQRES_PUBLIC_KEY || '').trim(),
  manageProjectKey: (import.meta.env.VITE_REQRES_MANAGE_KEY || '').trim(),
  collectionSlug:
    (import.meta.env.VITE_REQRES_COLLECTION_SLUG || 'waitlist').trim(),
  environment:
    (import.meta.env.VITE_REQRES_ENV || 'prod').trim(),
}

// Validate required config on startup so missing env vars surface immediately
const missing: string[] = []
if (!config.projectId) missing.push('VITE_REQRES_PROJECT_ID')
if (!config.manageProjectKey) missing.push('VITE_REQRES_MANAGE_KEY')
if (!config.publicProjectKey) missing.push('VITE_REQRES_PUBLIC_KEY')

if (missing.length > 0) {
  console.error(
    `[ReqRes] Missing required environment variables: ${missing.join(', ')}\n` +
    `Copy .env.example to .env and add your keys from https://app.reqres.in → Settings → API Keys`
  )
}
