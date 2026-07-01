import type { ServiceResult } from '@/types/common'
import type { Profile } from '@/types'

export interface IProfileService {
  getCurrentProfile(): Promise<ServiceResult<Profile>>
  updateCurrentProfile(
    updates: Partial<Pick<Profile, 'nome' | 'telefone' | 'cargo' | 'empresa' | 'avatar_url'>>
  ): Promise<ServiceResult<Profile>>
}
