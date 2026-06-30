import type { ServiceResult } from './common'

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type PaginatedServiceResult<T> = ServiceResult<T[]> & {
  pagination?: PaginationMeta
}
