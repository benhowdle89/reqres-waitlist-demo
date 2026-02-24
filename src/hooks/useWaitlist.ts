import { useState, useEffect, useCallback } from 'react'
import { config } from '../config'
import {
  WaitlistRecord,
  PaginationMeta,
  ListParams,
  WaitlistStatus,
} from '../types'
import {
  listSignups,
  updateSignup,
  deleteSignup as apiDeleteSignup,
  friendlyError,
} from '../api'

export type StatusCounts = { waiting: number; invited: number; joined: number }

type UseWaitlistReturn = {
  records: WaitlistRecord[]
  meta: PaginationMeta
  statusCounts: StatusCounts
  loading: boolean
  error: string | null
  params: ListParams
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setStatusFilter: (status: WaitlistStatus | undefined) => void
  invite: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: () => void
}

const defaultMeta: PaginationMeta = { page: 1, limit: 20, total: 0, pages: 1 }
const defaultCounts: StatusCounts = { waiting: 0, invited: 0, joined: 0 }

export function useWaitlist(): UseWaitlistReturn {
  const [records, setRecords] = useState<WaitlistRecord[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta)
  const [statusCounts, setStatusCounts] = useState<StatusCounts>(defaultCounts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<ListParams>({
    page: 1,
    limit: 20,
    order: 'desc',
  })

  const fetchStatusCounts = useCallback(async () => {
    try {
      const [waiting, invited, joined] = await Promise.all(
        (['waiting', 'invited', 'joined'] as WaitlistStatus[]).map((status) =>
          listSignups(config, { limit: 1, status }).then((r) => r.meta.total),
        ),
      )
      setStatusCounts({ waiting, invited, joined })
    } catch {
      // Non-critical — leave counts at current values
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listSignups(config, params)
      setRecords(res.data)
      setMeta(res.meta)
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
    fetchStatusCounts()
  }, [params, fetchStatusCounts])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setPage = useCallback((page: number) => {
    setParams((p) => ({ ...p, page }))
  }, [])

  const setSearch = useCallback((search: string) => {
    setParams((p) => ({ ...p, search: search || undefined, page: 1 }))
  }, [])

  const setStatusFilter = useCallback((status: WaitlistStatus | undefined) => {
    setParams((p) => ({ ...p, status, page: 1 }))
  }, [])

  const invite = useCallback(async (id: string) => {
    const record = records.find((r) => r.id === id)
    if (!record) return

    const mergedData = { ...record.data, status: 'invited' as WaitlistStatus, invited_at: new Date().toISOString() }

    // Optimistic update
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, data: mergedData } : r,
      ),
    )
    try {
      // Send full merged data so the API doesn't wipe existing fields
      await updateSignup(config, id, mergedData)
    } catch (err) {
      // Revert on failure
      setError(friendlyError(err))
      await fetchData()
    }
  }, [records, fetchData])

  const remove = useCallback(async (id: string) => {
    // Optimistic removal
    setRecords((prev) => prev.filter((r) => r.id !== id))
    try {
      await apiDeleteSignup(config, id)
      // Refresh to get correct pagination
      await fetchData()
    } catch (err) {
      setError(friendlyError(err))
      await fetchData()
    }
  }, [fetchData])

  return {
    records,
    meta,
    statusCounts,
    loading,
    error,
    params,
    setPage,
    setSearch,
    setStatusFilter,
    invite,
    remove,
    refresh: fetchData,
  }
}
