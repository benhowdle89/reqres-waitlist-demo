import { AppConfig } from './config'
import {
  WaitlistRecord,
  PaginatedResponse,
  PaginationMeta,
  Session,
  AppUserProfile,
  SignupData,
  ListParams,
  WaitlistStatus,
} from './types'

export class ApiError extends Error {
  status?: number
  details?: unknown

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  token?: string
  usePublicKey?: boolean
  useManageKey?: boolean
  body?: unknown
  require?: 'public' | 'manage' | 'session'
}

async function jsonRequest<T>(
  config: AppConfig,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const base = (config.baseUrl || 'https://reqres.in').replace(/\/$/, '')
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const { token, usePublicKey, useManageKey, body, require: reqType, ...init } = options

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-reqres-env': 'prod',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string> | undefined),
  }

  if (reqType === 'session') {
    if (!token) throw new ApiError('Session token is required.')
    headers.Authorization = `Bearer ${token}`
  }

  if (reqType === 'public') {
    if (!config.publicProjectKey) throw new ApiError('Public key is missing.')
    headers['x-api-key'] = config.publicProjectKey
  } else if (usePublicKey && config.publicProjectKey) {
    headers['x-api-key'] = config.publicProjectKey
  }

  if (reqType === 'manage') {
    if (!config.manageProjectKey) throw new ApiError('Management key is missing.')
    headers['x-api-key'] = config.manageProjectKey
  } else if (useManageKey && config.manageProjectKey) {
    headers['x-api-key'] = config.manageProjectKey
  }

  const requestInit: RequestInit = { ...init, headers, cache: 'no-store' }
  if (body !== undefined && body !== null) {
    requestInit.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const response = await fetch(url, requestInit)
  const text = await response.text()

  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const obj = typeof data === 'object' && data !== null ? data as Record<string, unknown> : null
    const message =
      (obj?.error as string) ||
      (obj?.message as string) ||
      response.statusText ||
      'Request failed'
    throw new ApiError(message, response.status, data)
  }

  return (data ?? {}) as T
}

// ─── User-friendly error messages ────────────────────────────────────────────

export function friendlyError(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Something went wrong. Please try again.'
  switch (err.status) {
    case 429:
      return 'Too many attempts. Please try again in a moment.'
    case 403:
      return 'Waitlist is currently full. Check back soon!'
    case 401:
      return 'Invalid or expired code. Please try again.'
    default:
      return err.message || 'Something went wrong. Please try again.'
  }
}

// ─── Public endpoints ────────────────────────────────────────────────────────

/**
 * Check if an email is already on the waitlist.
 * Uses the manage key since we need read access to all records.
 */
export async function checkExistingSignup(
  config: AppConfig,
  email: string,
): Promise<WaitlistRecord | null> {
  const encoded = encodeURIComponent(JSON.stringify({ email }))
  const slug = encodeURIComponent(config.collectionSlug)
  const res = await jsonRequest<{ data: WaitlistRecord[] }>(
    config,
    `/api/collections/${slug}/records?data_contains=${encoded}`,
    { method: 'GET', require: 'manage' },
  )
  return res.data?.length ? res.data[0] : null
}

/**
 * Join the waitlist. Creates a new record.
 *
 * NOTE: In production, you'd proxy this through a Cloudflare Pages Function
 * to keep the API key server-side. For this demo, we use the project key
 * directly from the browser.
 */
export async function joinWaitlist(
  config: AppConfig,
  data: SignupData,
): Promise<WaitlistRecord> {
  const slug = encodeURIComponent(config.collectionSlug)
  const res = await jsonRequest<{ data: WaitlistRecord }>(
    config,
    `/api/collections/${slug}/records`,
    {
      method: 'POST',
      require: 'manage',
      body: {
        data: {
          email: data.email,
          name: data.name || '',
          referral_source: data.referral_source || '',
          status: 'waiting',
        },
      },
    },
  )
  return res.data
}

/**
 * Get approximate waitlist position by counting records created before a given timestamp.
 */
export async function getWaitlistPosition(
  config: AppConfig,
  createdAt: string,
): Promise<number> {
  const slug = encodeURIComponent(config.collectionSlug)
  const res = await jsonRequest<{ meta?: { total?: number } }>(
    config,
    `/api/collections/${slug}/records?created_before=${encodeURIComponent(createdAt)}&limit=1`,
    { method: 'GET', require: 'manage' },
  )
  return (res.meta?.total ?? 0) + 1
}

/**
 * Get total number of waitlist signups (for the counter on the landing page).
 */
export async function getWaitlistTotal(
  config: AppConfig,
): Promise<number> {
  const slug = encodeURIComponent(config.collectionSlug)
  const res = await jsonRequest<{ meta?: { total?: number } }>(
    config,
    `/api/collections/${slug}/records?limit=1`,
    { method: 'GET', require: 'manage' },
  )
  return res.meta?.total ?? 0
}

// ─── Auth endpoints ──────────────────────────────────────────────────────────

export async function requestMagicCode(
  config: AppConfig,
  email: string,
): Promise<{ sent: boolean }> {
  if (!config.projectId) throw new ApiError('Project ID is missing.')

  const res = await jsonRequest<{ data?: { sent?: boolean } }>(
    config,
    '/api/app-users/login',
    {
      method: 'POST',
      body: { email, project_id: config.projectId },
      require: 'public',
    },
  )
  const payload = res?.data ?? res
  return { sent: Boolean((payload as Record<string, unknown>)?.sent ?? true) }
}

export async function verifyMagicCode(
  config: AppConfig,
  code: string,
): Promise<Session> {
  if (!config.projectId) throw new ApiError('Project ID is missing.')

  const res = await jsonRequest<{ data: Record<string, unknown> }>(
    config,
    '/api/app-users/verify',
    {
      method: 'POST',
      body: { token: code, project_id: config.projectId },
      require: 'manage',
    },
  )
  const d = res.data
  return {
    token: d.session_token as string,
    expiresAt: d.expires_at as string,
    projectId: d.project_id as number,
    email: d.email as string,
  }
}

export async function getCurrentUser(
  config: AppConfig,
  sessionToken: string,
): Promise<AppUserProfile> {
  const res = await jsonRequest<{ data: AppUserProfile }>(
    config,
    '/api/app-users/me',
    { method: 'GET', token: sessionToken, require: 'session' },
  )
  return res.data
}

// ─── Admin endpoints ─────────────────────────────────────────────────────────

export async function listSignups(
  config: AppConfig,
  params: ListParams = {},
): Promise<PaginatedResponse<WaitlistRecord>> {
  const slug = encodeURIComponent(config.collectionSlug)
  const page = Math.max(1, Number(params.page) || 1)
  const limit = Math.min(Math.max(Number(params.limit) || 20, 1), 100)
  const order = params.order === 'asc' ? 'asc' : 'desc'

  const qp = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    order,
  })

  if (params.search) {
    qp.set('search', params.search)
  }

  if (params.status) {
    qp.set('data_contains', JSON.stringify({ status: params.status }))
  }

  const res = await jsonRequest<{ data: WaitlistRecord[]; meta?: PaginationMeta }>(
    config,
    `/api/collections/${slug}/records?${qp.toString()}`,
    { method: 'GET', require: 'manage' },
  )

  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: (res.data || []).length,
    pages: 1,
  }

  return {
    data: res.data || [],
    meta: res.meta
      ? {
          page: res.meta.page ?? page,
          limit: res.meta.limit ?? limit,
          total: res.meta.total ?? fallbackMeta.total,
          pages: res.meta.pages ?? fallbackMeta.pages,
        }
      : fallbackMeta,
  }
}

export async function updateSignup(
  config: AppConfig,
  id: string,
  data: Partial<WaitlistRecord['data']>,
): Promise<WaitlistRecord> {
  const slug = encodeURIComponent(config.collectionSlug)
  const res = await jsonRequest<{ data: WaitlistRecord }>(
    config,
    `/api/collections/${slug}/records/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      require: 'manage',
      body: { data },
    },
  )
  return res.data
}

export async function deleteSignup(
  config: AppConfig,
  id: string,
): Promise<void> {
  const slug = encodeURIComponent(config.collectionSlug)
  await jsonRequest<void>(
    config,
    `/api/collections/${slug}/records/${encodeURIComponent(id)}`,
    { method: 'DELETE', require: 'manage' },
  )
}

// ─── Helpers for status changes ──────────────────────────────────────────────

export async function inviteSignup(
  config: AppConfig,
  id: string,
): Promise<WaitlistRecord> {
  return updateSignup(config, id, {
    status: 'invited' as WaitlistStatus,
    invited_at: new Date().toISOString(),
  })
}
