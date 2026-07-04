import { describe, it, expect } from 'vitest'
import { gerarPrefixoSetor, gerarNomeArquivoEvidencia, removerAcentos } from '@/lib/utils'

describe('removerAcentos', () => {
  it('remove acentos do texto', () => {
    expect(removerAcentos('Operacional')).toBe('Operacional')
    expect(removerAcentos('Administrativo')).toBe('Administrativo')
    expect(removerAcentos('Recursos Humanos')).toBe('Recursos Humanos')
    expect(removerAcentos('Segurança')).toBe('Seguranca')
    expect(removerAcentos('Produção')).toBe('Producao')
    expect(removerAcentos('Manutenção')).toBe('Manutencao')
    expect(removerAcentos('ÁÉÍÓÚ')).toBe('AEIOU')
    expect(removerAcentos('Ç')).toBe('C')
  })

  it('retorna string vazia para entrada vazia', () => {
    expect(removerAcentos('')).toBe('')
  })
})

describe('gerarPrefixoSetor', () => {
  it('retorna OPE para Operacional', () => {
    expect(gerarPrefixoSetor('Operacional')).toBe('OPE')
  })

  it('retorna ADM para Administrativo', () => {
    expect(gerarPrefixoSetor('Administrativo')).toBe('ADM')
  })

  it('retorna REC para Recursos Humanos', () => {
    expect(gerarPrefixoSetor('Recursos Humanos')).toBe('REC')
  })

  it('retorna SEG para Segurança do Trabalho', () => {
    expect(gerarPrefixoSetor('Segurança do Trabalho')).toBe('SEG')
  })

  it('retorna PRO para Produção', () => {
    expect(gerarPrefixoSetor('Produção')).toBe('PRO')
  })

  it('retorna MAN para Manutenção', () => {
    expect(gerarPrefixoSetor('Manutenção')).toBe('MAN')
  })

  it('remove acentos corretamente no prefixo', () => {
    expect(gerarPrefixoSetor('Segurança')).toBe('SEG')
    expect(gerarPrefixoSetor('Manutenção')).toBe('MAN')
  })

  it('converte para maiúsculas', () => {
    expect(gerarPrefixoSetor('operacional')).toBe('OPE')
    expect(gerarPrefixoSetor('ADMINISTRATIVO')).toBe('ADM')
  })

  it('remove caracteres especiais', () => {
    expect(gerarPrefixoSetor('Setor@#$% Operacional!!!')).toBe('SET')
  })

  it('retorna SET quando setor está ausente', () => {
    expect(gerarPrefixoSetor(null)).toBe('SET')
    expect(gerarPrefixoSetor(undefined)).toBe('SET')
    expect(gerarPrefixoSetor('')).toBe('SET')
  })

  it('completa com padding quando setor tem menos de 3 letras', () => {
    expect(gerarPrefixoSetor('AB')).toBe('ABX')
    expect(gerarPrefixoSetor('A')).toBe('AXX')
  })

  it('lida com setor contendo apenas números e especiais', () => {
    expect(gerarPrefixoSetor('123')).toBe('SET')
    expect(gerarPrefixoSetor('@#$')).toBe('SET')
  })

  it('usa apenas as 3 primeiras letras válidas', () => {
    expect(gerarPrefixoSetor('Administrativo')).toBe('ADM')
    expect(gerarPrefixoSetor('Produção Industrial')).toBe('PRO')
  })
})

describe('gerarNomeArquivoEvidencia', () => {
  it('gera OPE-0001.jpg para Operacional sem evidências', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: 'Operacional',
      evidenciasExistentes: [],
      extensao: 'jpg',
    })
    expect(nome).toBe('OPE-0001.jpg')
  })

  it('gera OPE-0002 quando já existe OPE-0001', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: 'Operacional',
      evidenciasExistentes: [
        { arquivo_nome: 'OPE-0001.jpg' },
      ],
      extensao: 'jpg',
    })
    expect(nome).toBe('OPE-0002.jpg')
  })

  it('gera OPE-0003 quando existem OPE-0001 e OPE-0002', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: 'Operacional',
      evidenciasExistentes: [
        { arquivo_nome: 'OPE-0001.jpg' },
        { arquivo_nome: 'OPE-0002.jpg' },
      ],
      extensao: 'jpg',
    })
    expect(nome).toBe('OPE-0003.jpg')
  })

  it('preserva a extensão do arquivo', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: 'Administrativo',
      evidenciasExistentes: [],
      extensao: 'png',
    })
    expect(nome).toBe('ADM-0001.png')
  })

  it('usa legenda como fallback quando arquivo_nome não está disponível', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: 'Manutenção',
      evidenciasExistentes: [
        { legenda: 'MAN-0001.jpg' },
      ],
      extensao: 'jpg',
    })
    expect(nome).toBe('MAN-0002.jpg')
  })

  it('ignora evidências sem nome', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: 'Produção',
      evidenciasExistentes: [
        { arquivo_nome: null, legenda: null },
        { arquivo_nome: undefined, legenda: undefined },
      ],
      extensao: 'jpg',
    })
    expect(nome).toBe('PRO-0001.jpg')
  })

  it('ignora evidências de outros setores com prefixos diferentes', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: 'Administrativo',
      evidenciasExistentes: [
        { arquivo_nome: 'OPE-0001.jpg' },
        { arquivo_nome: 'OPE-0002.jpg' },
      ],
      extensao: 'jpg',
    })
    expect(nome).toBe('ADM-0001.jpg')
  })

  it('usa SET como fallback quando setor está ausente', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: null,
      evidenciasExistentes: [],
      extensao: 'jpg',
    })
    expect(nome).toBe('SET-0001.jpg')
  })

  it('usa jpg como extensão padrão para extensões não reconhecidas', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: 'Operacional',
      evidenciasExistentes: [],
      extensao: 'gif',
    })
    expect(nome).toBe('OPE-0001.jpg')
  })

  it('considera jpeg como extensão válida', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: 'Operacional',
      evidenciasExistentes: [],
      extensao: 'jpeg',
    })
    expect(nome).toBe('OPE-0001.jpeg')
  })

  it('usa o maior número + 1, ignorando lacunas', () => {
    const nome = gerarNomeArquivoEvidencia({
      setorNome: 'Operacional',
      evidenciasExistentes: [
        { arquivo_nome: 'OPE-0001.jpg' },
        { arquivo_nome: 'OPE-0003.jpg' },
        { arquivo_nome: 'OPE-0005.jpg' },
      ],
      extensao: 'jpg',
    })
    expect(nome).toBe('OPE-0006.jpg')
  })
})
