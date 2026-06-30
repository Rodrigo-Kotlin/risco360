export const MSG = {
  campoObrigatorio: (campo: string) => `${campo} é obrigatório.`,
  email: {
    obrigatorio: 'E-mail é obrigatório.',
    invalido: 'E-mail inválido.',
  },
  senha: {
    obrigatoria: 'Senha é obrigatória.',
    minimo: 'A senha deve ter pelo menos 6 caracteres.',
  },
  confirmarSenha: {
    obrigatoria: 'Confirmação de senha é obrigatória.',
    diferente: 'As senhas não coincidem.',
  },
  nome: {
    obrigatorio: 'Nome é obrigatório.',
  },
} as const
