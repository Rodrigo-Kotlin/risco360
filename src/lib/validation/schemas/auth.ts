import { z } from 'zod'
import { MSG } from '../messages'

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, MSG.email.obrigatorio)
    .email(MSG.email.invalido),
  password: z
    .string()
    .min(1, MSG.senha.obrigatoria),
})

export const RegisterSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, MSG.nome.obrigatorio),
  email: z
    .string()
    .min(1, MSG.email.obrigatorio)
    .email(MSG.email.invalido),
  password: z
    .string()
    .min(1, MSG.senha.obrigatoria)
    .min(6, MSG.senha.minimo),
  confirmPassword: z
    .string()
    .min(1, MSG.confirmarSenha.obrigatoria),
}).refine((data) => data.password === data.confirmPassword, {
  message: MSG.confirmarSenha.diferente,
  path: ['confirmPassword'],
})

export const ResetPasswordSchema = z.object({
  resetEmail: z
    .string()
    .min(1, MSG.email.obrigatorio)
    .email(MSG.email.invalido),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
