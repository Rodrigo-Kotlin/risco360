export type ID = string

export type ISODateString = string

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ServiceResult<T> {
  data: T | null
  error: string | null
}

export interface BaseEntity {
  id: ID
  created_at: ISODateString
  updated_at: ISODateString
}

export interface UserOwnedEntity extends BaseEntity {
  user_id: ID
}

export interface SelectOption {
  value: string
  label: string
}
