import { z } from 'zod'
import { MSG } from '../messages'

const CATEGORIA_VALUES = ['fisico', 'quimico', 'biologico', 'ergonomico', 'acidente', 'mecanico', 'psicossocial'] as const

export const RiscoSchema = z.object({
  codigo: z.string().optional().or(z.literal('')),
  categoria: z.enum(CATEGORIA_VALUES, { required_error: MSG.risco.categoria }),
  agente: z.string().trim().min(1, MSG.risco.agente),
  descricao: z.string().optional().or(z.literal('')),
  fonte_geradora: z.string().optional().or(z.literal('')),
  meios_propagacao: z.array(z.string()).optional(),
  caracterizacao: z.string().optional().or(z.literal('')),
  dano_possivel: z.string().optional().or(z.literal('')),
  fonte_avaliacao: z.string().optional().or(z.literal('')),
  probabilidade: z.string().optional().or(z.literal('')),
  severidade: z.string().optional().or(z.literal('')),
  sugestoes_exposicao: z.string().optional().or(z.literal('')),
  meio_propagacao_label: z.string().optional().or(z.literal('')),
  sinalizacao: z.string().optional().or(z.literal('')),
  acoes_recomendadas: z.string().optional().or(z.literal('')),
  observacoes: z.string().optional().or(z.literal('')),
})

export type RiscoFormData = z.infer<typeof RiscoSchema>
