export type WaitlistStatus = 'waiting' | 'invited' | 'joined'

export type WaitlistData = {
  email: string
  name?: string
  referral_source?: string
  status: WaitlistStatus
  invited_at?: string
  notes?: string
}

export type WaitlistRecord = {
  id: string
  data: WaitlistData
  created_at: string
  updated_at: string
  app_user_id?: string | null
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  pages: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

export type Session = {
  token: string
  expiresAt: string
  projectId: number
  email: string
}

export type AppUserProfile = {
  id: string
  email: string
  project_id: number
  status: string
  metadata?: Record<string, unknown>
}

export type SignupData = {
  email: string
  name?: string
  referral_source?: string
}

export type ListParams = {
  page?: number
  limit?: number
  order?: 'asc' | 'desc'
  search?: string
  status?: WaitlistStatus
}
