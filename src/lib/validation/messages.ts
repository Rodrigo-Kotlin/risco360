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
  empresa: {
    razaoSocial: 'Razão social é obrigatória.',
    emailInvalido: 'E-mail corporativo inválido.',
  },
  risco: {
    agente: 'Agente é obrigatório.',
    categoria: 'Categoria é obrigatória.',
    probabilidade: 'Probabilidade deve estar entre 1 e 5.',
    severidade: 'Severidade deve estar entre 1 e 5.',
    bibliotecaItem: 'Item da biblioteca não encontrado.',
  },
} as const
