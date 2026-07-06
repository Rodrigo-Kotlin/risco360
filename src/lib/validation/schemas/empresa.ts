import { z } from 'zod'
import { MSG } from '../messages'

export const EmpresaSchema = z.object({
  razao_social: z.string().trim().min(1, MSG.empresa.razaoSocial),
  nome_fantasia: z.string().trim().optional().or(z.literal('')),
  cnpj: z.string().trim().optional().or(z.literal('')),
  cnae: z.string().trim().optional().or(z.literal('')),
  grau_risco: z.string().optional().or(z.literal('')),
  grau_risco_nr4: z.number().optional().nullable(),
  endereco: z.string().trim().optional().or(z.literal('')),
  numero: z.string().trim().optional().or(z.literal('')),
  bairro: z.string().trim().optional().or(z.literal('')),
  cidade: z.string().trim().optional().or(z.literal('')),
  uf: z.string().optional().or(z.literal('')),
  cep: z.string().trim().optional().or(z.literal('')),
  responsavel: z.string().trim().optional().or(z.literal('')),
  telefone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().optional().or(z.literal('')),
  observacoes: z.string().trim().optional().or(z.literal('')),
  cnae_principal: z.string().trim().optional().or(z.literal('')),
  cnae_principal_descricao: z.string().trim().optional().or(z.literal('')),
})

export type EmpresaFormData = z.infer<typeof EmpresaSchema>
