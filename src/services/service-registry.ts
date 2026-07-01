import { isMockModeEnabled } from '@/lib/mock-mode'
import {
  supabaseEmpresaService,
  supabaseSetorService,
  supabaseLevantamentoService,
  supabaseRelatorioService,
  supabaseBibliotecaService,
  supabaseProfileService,
  supabaseEvidenciaService,
} from './providers/supabase.provider'
import {
  mockEmpresaService,
  mockSetorService,
  mockLevantamentoService,
  mockRelatorioService,
  mockBibliotecaService,
  mockProfileService,
  mockEvidenciaService,
} from './providers/mock.provider'
import type { IEmpresaService } from './contracts/empresa-service'
import type { ISetorService } from './contracts/setor-service'
import type { ILevantamentoService } from './contracts/levantamento-service'
import type { IRelatorioService } from './contracts/relatorio-service'
import type { IBibliotecaTecnicaService } from './contracts/biblioteca-service'
import type { IProfileService } from './contracts/profile-service'
import type { ServiceResult } from '@/types/common'
import type { UploadEvidenciaResult, UploadEvidenciaInput } from './evidencias.service'

function selectProvider<T>(supabase: T, mock: T): T {
  return isMockModeEnabled ? mock : supabase
}

export const Services = {
  empresas: selectProvider<IEmpresaService>(supabaseEmpresaService, mockEmpresaService),
  setores: selectProvider<ISetorService>(supabaseSetorService, mockSetorService),
  levantamentos: selectProvider<ILevantamentoService>(supabaseLevantamentoService, mockLevantamentoService),
  relatorios: selectProvider<IRelatorioService>(supabaseRelatorioService, mockRelatorioService),
  biblioteca: selectProvider<IBibliotecaTecnicaService>(supabaseBibliotecaService, mockBibliotecaService),
  profile: selectProvider<IProfileService>(supabaseProfileService, mockProfileService),
  evidencias: selectProvider(supabaseEvidenciaService, mockEvidenciaService),
}
