export type * from './common'
export type * from './ui'
export type * from './auth'
export type * from './empresa'
export type * from './levantamento'
export type * from './risco'
export type * from './relatorio'
export type * from './biblioteca'
export type * from './database'

export interface Profile {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  cargo: string | null
  empresa: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
}


