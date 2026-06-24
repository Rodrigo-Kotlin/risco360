import { getOfflineDB, nowISO, isOfflineDBAvailable } from './offline-db'
import { criarBaseOfflineEntity } from '@/services/offline/offline-storage.service'
import { seedBibliotecaOffline } from '@/services/offline/offline-biblioteca.service'
import type { Levantamento } from '@/types/levantamento'
import type { BibliotecaTecnicaItem } from '@/types/biblioteca'

const SEED_EMPRESA_ID = 'seed_empresa_01'

export async function seedOfflineDataIfEmpty(): Promise<boolean> {
  const dbAvailable = await isOfflineDBAvailable()
  if (!dbAvailable) return false

  const db = await getOfflineDB()
  const empresaCount = await db.count('empresas')
  if (empresaCount > 0) return false

  const now = nowISO()

  const empresaBase = criarBaseOfflineEntity({
    id: SEED_EMPRESA_ID,
    source: 'mock',
    sync_status: 'synced',
    dirty: false,
  })

  await db.add('empresas', {
    ...empresaBase,
    razao_social: 'Empresa Modelo Risco360 LTDA',
    nome_fantasia: 'Risco360',
    cnpj: '00.000.000/0001-91',
    cnae: '71.12-0-00',
    grau_risco: '2',
    endereco: 'Av. Paulista, 1000',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01310-100',
    responsavel: 'Carlos Silva',
    telefone: '(11) 99999-8888',
    email: 'contato@risco360.local',
    observacoes: 'Empresa modelo para testes offline',
    user_id: 'offline_user',
  })

  const setorAdmin = criarBaseOfflineEntity({
    id: 'seed_setor_admin',
    source: 'mock',
    sync_status: 'synced',
    dirty: false,
  })
  await db.add('setores', {
    ...setorAdmin,
    nome: 'Administrativo',
    descricao: 'Setor administrativo',
    empresa_id: SEED_EMPRESA_ID,
    user_id: 'offline_user',
  })

  const setorCom = criarBaseOfflineEntity({
    id: 'seed_setor_com',
    source: 'mock',
    sync_status: 'synced',
    dirty: false,
  })
  await db.add('setores', {
    ...setorCom,
    nome: 'Comercial',
    descricao: 'Setor comercial',
    empresa_id: SEED_EMPRESA_ID,
    user_id: 'offline_user',
  })

  const setorFin = criarBaseOfflineEntity({
    id: 'seed_setor_fin',
    source: 'mock',
    sync_status: 'synced',
    dirty: false,
  })
  await db.add('setores', {
    ...setorFin,
    nome: 'Financeiro',
    descricao: 'Setor financeiro',
    empresa_id: SEED_EMPRESA_ID,
    user_id: 'offline_user',
  })

  const setorRh = criarBaseOfflineEntity({
    id: 'seed_setor_rh',
    source: 'mock',
    sync_status: 'synced',
    dirty: false,
  })
  await db.add('setores', {
    ...setorRh,
    nome: 'RH',
    descricao: 'Recursos Humanos',
    empresa_id: SEED_EMPRESA_ID,
    user_id: 'offline_user',
  })

  const levBase = criarBaseOfflineEntity({
    id: 'seed_levantamento_fin',
    source: 'mock',
    sync_status: 'synced',
    dirty: false,
  })

  const levantamento: Partial<Levantamento> = {
    codigo: 'LPR-AEP-2026-0001',
    tipo: 'LPR_AEP',
    status: 'em_andamento',
    percentual: 45,
    empresa_id: SEED_EMPRESA_ID,
    empresa_nome: 'Empresa Modelo Risco360 LTDA',
    cnpj: '00.000.000/0001-91',
    setor_id: 'seed_setor_fin',
    setor_nome: 'Financeiro',
    data_levantamento: '2026-06-22',
    medicoes: [
      {
        id: 'medicao_01',
        tipo: 'Iluminação',
        agente: 'Iluminação',
        metodo: 'Luxímetro digital',
        equipamento: 'Luxímetro XYZ',
        numero_serie: 'SN-001',
        valor: 420,
        unidade: 'lux',
        limite_tolerancia: 500,
        fonte: 'Lâmpadas LED',
        duracao: '8h',
        local: 'Sala de trabalho',
        responsavel: 'Técnico 1',
        data: '2026-06-22',
        hora: '10:00',
        observacao: null,
      },
      {
        id: 'medicao_02',
        tipo: 'Ruído',
        agente: 'Ruído',
        metodo: 'Dosímetro',
        equipamento: 'Dosímetro ABC',
        numero_serie: 'SN-002',
        valor: 58,
        unidade: 'dB(A)',
        limite_tolerancia: 85,
        fonte: 'Equipamentos de escritório',
        duracao: '8h',
        local: 'Sala de trabalho',
        responsavel: 'Técnico 1',
        data: '2026-06-22',
        hora: '10:30',
        observacao: null,
      },
      {
        id: 'medicao_03',
        tipo: 'Temperatura',
        agente: 'Temperatura',
        metodo: 'Termômetro digital',
        equipamento: 'Termômetro DEF',
        numero_serie: 'SN-003',
        valor: 24.8,
        unidade: '°C',
        limite_tolerancia: 28,
        fonte: 'Ar condicionado',
        duracao: '8h',
        local: 'Sala de trabalho',
        responsavel: 'Técnico 1',
        data: '2026-06-22',
        hora: '11:00',
        observacao: null,
      },
      {
        id: 'medicao_04',
        tipo: 'Umidade',
        agente: 'Umidade',
        metodo: 'Higrômetro',
        equipamento: 'Higrômetro GHI',
        numero_serie: 'SN-004',
        valor: 62,
        unidade: '%',
        limite_tolerancia: 70,
        fonte: 'Ambiente climatizado',
        duracao: '8h',
        local: 'Sala de trabalho',
        responsavel: 'Técnico 1',
        data: '2026-06-22',
        hora: '11:30',
        observacao: null,
      },
      {
        id: 'medicao_05',
        tipo: 'Velocidade do ar',
        agente: 'Velocidade do ar',
        metodo: 'Anemômetro',
        equipamento: 'Anemômetro JKL',
        numero_serie: 'SN-005',
        valor: 0.2,
        unidade: 'm/s',
        limite_tolerancia: 0.75,
        fonte: 'Sistema de climatização',
        duracao: '8h',
        local: 'Sala de trabalho',
        responsavel: 'Técnico 1',
        data: '2026-06-22',
        hora: '12:00',
        observacao: null,
      },
      {
        id: 'medicao_06',
        tipo: 'Radiação',
        agente: 'Radiação',
        metodo: 'Medidor de radiação',
        equipamento: 'Medidor MNO',
        numero_serie: 'SN-006',
        valor: 0.12,
        unidade: 'µSv/h',
        limite_tolerancia: 1.0,
        fonte: 'Monitores e equipamentos',
        duracao: '8h',
        local: 'Sala de trabalho',
        responsavel: 'Técnico 1',
        data: '2026-06-22',
        hora: '12:30',
        observacao: null,
      },
    ],
    pontos_medicao: [
      {
        id: 'ponto_med_01',
        ponto_local: 'Sala de trabalho — Posto administrativo',
        ruido_dba: null, iluminacao_lux: 420, temperatura_c: null,
        velocidade_ar_ms: null, umidade_percent: null, radiacao_usvh: null,
        observacoes: null,
        tipo: 'iluminancia', agente: 'Iluminação',
        metodo: 'Luxímetro digital', equipamento: 'Luxímetro XYZ',
        numero_serie: 'SN-001', valor: 420, unidade: 'lux',
        limite_tolerancia: 500, fonte: 'Lâmpadas LED', duracao: '8h',
        local: 'Sala de trabalho', responsavel: 'Técnico 1',
        data: '2026-06-22', hora: '10:00', observacao: null,
        posto_trabalho: 'Posto administrativo',
        colaborador_nome: 'Colaborador Padrão',
        colaborador_funcao: 'Analista',
        colaborador_tempo_exposicao: '8h/dia',
      },
      {
        id: 'ponto_med_02',
        ponto_local: 'Sala de trabalho — Posto administrativo',
        ruido_dba: 58, iluminacao_lux: null, temperatura_c: null,
        velocidade_ar_ms: null, umidade_percent: null, radiacao_usvh: null,
        observacoes: null,
        tipo: 'ruido', agente: 'Ruído',
        metodo: 'Dosímetro', equipamento: 'Dosímetro ABC',
        numero_serie: 'SN-002', valor: 58, unidade: 'dB(A)',
        limite_tolerancia: 85, fonte: 'Equipamentos de escritório',
        duracao: '8h', local: 'Sala de trabalho',
        responsavel: 'Técnico 1', data: '2026-06-22', hora: '10:30',
        observacao: null, posto_trabalho: 'Posto administrativo',
        colaborador_nome: 'Colaborador Padrão',
        colaborador_funcao: 'Analista',
        colaborador_tempo_exposicao: '8h/dia',
      },
    ],
  }

  await db.add('levantamentos', {
    ...levBase,
    ...levantamento,
    user_id: 'offline_user',
    created_at: now,
    updated_at: now,
  })

  await seedBibliotecaOffline([
    {
      id: 'seed_biblioteca_01',
      categoria: 'fisico',
      titulo: 'Ruído Contínuo',
      descricao: 'Avaliação de ruído contínuo em ambientes de trabalho',
      tipo_risco: 'Físico',
      perigo: 'Ruído contínuo acima dos limites de tolerância',
      risco: 'Perda auditiva induzida por ruído (PAIR)',
      fonte: 'NR-15 Anexo 1',
      fonte_geradora: 'Máquinas, prensas, serras, compressores',
      danos_possiveis: ['Perda auditiva temporária', 'Perda auditiva permanente', 'Zumbido'],
      meios_propagacao: ['Sonora', 'Ar'],
      descricao_exposicao: 'Exposição ocupacional a ruído acima de 85 dB(A) por 8 horas',
      sugestao_exposicao: 'Limite de tolerância NR-15: 85 dB(A) para 8h',
      medidas_controle: [
        { descricao: 'Protetor auricular tipo concha', tipo: 'epi', eficaz: true, observacao: null },
        { descricao: 'Enclausuramento de máquinas ruidosas', tipo: 'engenharia', eficaz: true, observacao: null },
        { descricao: 'Rodízio de funcionários', tipo: 'administrativo', eficaz: true, observacao: null },
      ],
      epis: [
        { descricao: 'Protetor auricular tipo concha', ca: '12345', validade: '2027-06-01' },
      ],
      epcs: ['Cabine acústica', 'Manta acústica'],
      treinamentos: [
        { descricao: 'Treinamento de conservação auditiva', tipo: 'Periódico', carga_horaria: 4, periodicidade: 'Anual' },
      ],
      acoes_recomendadas: ['Realizar audiometria semestral', 'Substituir protetores a cada 3 meses'],
      observacoes: null,
      ativo: true,
      publico: true,
      user_id: null,
    },
    {
      id: 'seed_biblioteca_02',
      categoria: 'fisico',
      titulo: 'Iluminação',
      descricao: 'Avaliação dos níveis de iluminamento em ambientes internos',
      tipo_risco: 'Físico',
      perigo: 'Iluminamento insuficiente ou excessivo',
      risco: 'Fadiga visual, cefaleia, acidentes',
      fonte: 'NR-17 / NBR ISO/CIE 8995-1',
      fonte_geradora: 'Lâmpadas com baixa intensidade, ofuscamento',
      danos_possiveis: ['Fadiga visual', 'Cefaleia', 'Erros de leitura'],
      meios_propagacao: ['Luz'],
      descricao_exposicao: 'Exposição a níveis de iluminamento abaixo de 300 lux',
      sugestao_exposicao: 'Mínimo 500 lux para escritórios conforme NBR 8995-1',
      medidas_controle: [
        { descricao: 'Complementar iluminação artificial', tipo: 'engenharia', eficaz: true, observacao: null },
        { descricao: 'Pausas para descanso visual', tipo: 'administrativo', eficaz: true, observacao: null },
      ],
      epis: [],
      epcs: ['Luminárias com difusores', 'Sensor de luz natural'],
      treinamentos: [
        { descricao: 'Orientação sobre pausas e ergonomia visual', tipo: 'Periódico', carga_horaria: 1, periodicidade: 'Anual' },
      ],
      acoes_recomendadas: ['Medir iluminância anualmente'],
      observacoes: null,
      ativo: true,
      publico: true,
      user_id: null,
    },
    {
      id: 'seed_biblioteca_03',
      categoria: 'quimico',
      titulo: 'Agentes Químicos - Poeira',
      descricao: 'Avaliação qualitativa e quantitativa de poeira ocupacional',
      tipo_risco: 'Químico',
      perigo: 'Inalação de poeiras minerais ou vegetais',
      risco: 'Pneumoconiose, silicose, asma ocupacional',
      fonte: 'NR-15 Anexo 11',
      fonte_geradora: 'Processos de britagem, moagem, serragem',
      danos_possiveis: ['Pneumoconiose', 'Silicose', 'Asma ocupacional'],
      meios_propagacao: ['Respiratória', 'Ar'],
      descricao_exposicao: 'Exposição a poeiras minerais em suspensão no ar',
      sugestao_exposicao: 'Usar respirador PFF2 e sistema de exaustão',
      medidas_controle: [
        { descricao: 'Sistema de exaustão local', tipo: 'engenharia', eficaz: true, observacao: null },
        { descricao: 'Umectação de vias de circulação', tipo: 'administrativo', eficaz: true, observacao: null },
        { descricao: 'Respirador semifacial PFF2', tipo: 'epi', eficaz: true, observacao: null },
      ],
      epis: [
        { descricao: 'Respirador semifacial PFF2', ca: '67890', validade: '2027-06-01' },
      ],
      epcs: ['Cabine de pintura com exaustão', 'Cortina de ar'],
      treinamentos: [
        { descricao: 'Treinamento de uso de EPI respiratório', tipo: 'Periódico', carga_horaria: 2, periodicidade: 'Semestral' },
      ],
      acoes_recomendadas: ['Monitorar exposição a poeira', 'Manter exaustão em dia'],
      observacoes: null,
      ativo: true,
      publico: true,
      user_id: null,
    },
    {
      id: 'seed_biblioteca_04',
      categoria: 'acidente',
      titulo: 'Trabalho em Altura',
      descricao: 'Atividades executadas acima de 2 metros do nível inferior',
      tipo_risco: 'Acidente',
      perigo: 'Trabalho em altura',
      risco: 'Queda de altura com lesões graves',
      fonte: 'NR-35',
      fonte_geradora: 'Escadas, andaimes, telhados',
      danos_possiveis: ['Fratura', 'Traumatismo craniano', 'Óbito'],
      meios_propagacao: ['Não aplicável'],
      descricao_exposicao: 'Atividades acima de 2 m sem proteção contra queda',
      sugestao_exposicao: 'Usar cinto de segurança tipo paraquedista',
      medidas_controle: [
        { descricao: 'Cinto de segurança tipo paraquedista', tipo: 'epi', eficaz: true, observacao: null },
        { descricao: 'Linha de vida', tipo: 'engenharia', eficaz: true, observacao: null },
      ],
      epis: [
        { descricao: 'Cinto de segurança tipo paraquedista', ca: '34567', validade: '2027-06-30' },
        { descricao: 'Capacete com jugular', ca: '34568', validade: '2027-06-30' },
      ],
      epcs: ['Linha de vida', 'Guarda-corpo'],
      treinamentos: [
        { descricao: 'NR-35 Básico', tipo: 'Inicial', carga_horaria: 8, periodicidade: 'Bienal' },
      ],
      acoes_recomendadas: ['Elaborar análise de tarefa'],
      observacoes: null,
      ativo: true,
      publico: true,
      user_id: null,
    },
  ] as unknown as BibliotecaTecnicaItem[])

  return true
}
