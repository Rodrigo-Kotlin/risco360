import type { ID, ISODateString } from './common'

export type UserRole = 'user' | 'admin' | 'master'

export type PerfilUsuario = {
  id: ID
  nome: string
  email: string | null
  telefone: string | null
  cargo: string | null
  empresa: string | null
  avatar_url: string | null
  role: UserRole
  created_at: ISODateString
  updated_at: ISODateString
}
