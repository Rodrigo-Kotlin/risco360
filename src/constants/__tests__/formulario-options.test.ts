import { describe, it, expect } from 'vitest'
import {
  PISO_OPCOES, PAREDE_OPCOES, TELHADO_OPCOES, FORRO_OPCOES,
  DIVISORIAS_OPCOES, PAVIMENTO_OPCOES, REVESTIMENTO_OPCOES,
  SISTEMA_INCENDIO_OPCOES, GES_OPCOES, CONDICAO_POSTOS_OPCOES,
  LAYOUT_POSTO_OPCOES, TIPO_MEDICAO_OPCOES, UNIDADE_MEDIDA_OPCOES,
  OPCOES_SIM_NAO, OPCOES_ILUMINACAO_ARTIFICIAL, OPCOES_VENTILACAO_ARTIFICIAL,
  SEGURANCA_EMERGENCIA_ITENS, MAQUINAS_EQUIPAMENTOS_OPCOES,
} from '@/constants/formulario-options'

describe('PISO_OPCOES', () => {
  it('contém opções esperadas', () => {
    const values = PISO_OPCOES.map(o => o.value)
    expect(values).toContain('cerâmica')
    expect(values).toContain('concreto')
    expect(values).toContain('outro')
  })

  it('todas as opções têm value e label', () => {
    for (const opt of PISO_OPCOES) {
      expect(opt.value).toBeTruthy()
      expect(opt.label).toBeTruthy()
    }
  })
})

describe('PAREDE_OPCOES', () => {
  it('contém alvenaria e drywall', () => {
    const values = PAREDE_OPCOES.map(o => o.value)
    expect(values).toContain('alvenaria')
    expect(values).toContain('drywall')
  })
})

describe('TELHADO_OPCOES', () => {
  it('contém laje e telhas', () => {
    const values = TELHADO_OPCOES.map(o => o.value)
    expect(values).toContain('laje')
    expect(values).toContain('telha_cerâmica')
  })
})

describe('FORRO_OPCOES', () => {
  it('contém gesso e sem_forro', () => {
    const values = FORRO_OPCOES.map(o => o.value)
    expect(values).toContain('gesso')
    expect(values).toContain('sem_forro')
  })
})

describe('DIVISORIAS_OPCOES', () => {
  it('contém sim, nao, parcial', () => {
    const values = DIVISORIAS_OPCOES.map(o => o.value)
    expect(values).toEqual(['sim', 'nao', 'parcial'])
  })
})

describe('PAVIMENTO_OPCOES', () => {
  it('contém térreo e subsolo', () => {
    const values = PAVIMENTO_OPCOES.map(o => o.value)
    expect(values).toContain('térreo')
    expect(values).toContain('subsolo')
  })
})

describe('REVESTIMENTO_OPCOES', () => {
  it('contém cerâmica e pintura', () => {
    const values = REVESTIMENTO_OPCOES.map(o => o.value)
    expect(values).toContain('cerâmica')
    expect(values).toContain('pintura')
  })
})

describe('SISTEMA_INCENDIO_OPCOES', () => {
  it('contém extintores e nenhum', () => {
    const values = SISTEMA_INCENDIO_OPCOES.map(o => o.value)
    expect(values).toContain('extintores')
    expect(values).toContain('nenhum')
  })

  it('nenhum é a última opção', () => {
    const last = SISTEMA_INCENDIO_OPCOES[SISTEMA_INCENDIO_OPCOES.length - 1]
    expect(last.value).toBe('nenhum')
  })
})

describe('GES_OPCOES', () => {
  it('contém sim, nao, em_avaliacao', () => {
    const values = GES_OPCOES.map(o => o.value)
    expect(values).toEqual(['sim', 'nao', 'em_avaliacao'])
  })
})

describe('CONDICAO_POSTOS_OPCOES', () => {
  it('contém adequado e inadequado', () => {
    const values = CONDICAO_POSTOS_OPCOES.map(o => o.value)
    expect(values).toContain('adequado')
    expect(values).toContain('inadequado')
  })
})

describe('LAYOUT_POSTO_OPCOES', () => {
  it('contém individual e compartilhado', () => {
    const values = LAYOUT_POSTO_OPCOES.map(o => o.value)
    expect(values).toContain('individual')
    expect(values).toContain('compartilhado')
  })
})

describe('TIPO_MEDICAO_OPCOES', () => {
  it('contém ruido e iluminancia', () => {
    const values = TIPO_MEDICAO_OPCOES.map(o => o.value)
    expect(values).toContain('ruido')
    expect(values).toContain('iluminancia')
  })

  it('cada opção tem value e label', () => {
    for (const opt of TIPO_MEDICAO_OPCOES) {
      expect(opt.value).toBeTruthy()
      expect(opt.label).toBeTruthy()
    }
  })
})

describe('UNIDADE_MEDIDA_OPCOES', () => {
  it('contém dB(A) e lux', () => {
    const values = UNIDADE_MEDIDA_OPCOES.map(o => o.value)
    expect(values).toContain('dB(A)')
    expect(values).toContain('lux')
  })

  it('não tem valores duplicados', () => {
    const values = UNIDADE_MEDIDA_OPCOES.map(o => o.value)
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('OPCOES_SIM_NAO', () => {
  it('contém sim, nao, nao_avaliado', () => {
    const values = OPCOES_SIM_NAO.map(o => o.value)
    expect(values).toEqual(['sim', 'nao', 'nao_avaliado'])
  })
})

describe('OPCOES_ILUMINACAO_ARTIFICIAL', () => {
  it('contém LED e Fluorescente', () => {
    const values = OPCOES_ILUMINACAO_ARTIFICIAL.map(o => o.value)
    expect(values).toContain('led')
    expect(values).toContain('fluorescente')
  })

  it('contém outro e nao_avaliada', () => {
    const values = OPCOES_ILUMINACAO_ARTIFICIAL.map(o => o.value)
    expect(values).toContain('outro')
    expect(values).toContain('nao_avaliada')
  })
})

describe('OPCOES_VENTILACAO_ARTIFICIAL', () => {
  it('contém central_de_ar e ar_condicionado_split', () => {
    const values = OPCOES_VENTILACAO_ARTIFICIAL.map(o => o.value)
    expect(values).toContain('central_de_ar')
    expect(values).toContain('ar_condicionado_split')
  })

  it('contém ventilador_parede e exaustor', () => {
    const values = OPCOES_VENTILACAO_ARTIFICIAL.map(o => o.value)
    expect(values).toContain('ventilador_parede')
    expect(values).toContain('exaustor')
  })
})

describe('SEGURANCA_EMERGENCIA_ITENS', () => {
  it('contém extintor e hidrante', () => {
    const values = SEGURANCA_EMERGENCIA_ITENS.map(o => o.value)
    expect(values).toContain('extintor')
    expect(values).toContain('hidrante')
  })

  it('contém nao_observado e outro', () => {
    const values = SEGURANCA_EMERGENCIA_ITENS.map(o => o.value)
    expect(values).toContain('nao_observado')
    expect(values).toContain('outro')
  })
})

describe('MAQUINAS_EQUIPAMENTOS_OPCOES', () => {
  it('contém computador e impressora', () => {
    const values = MAQUINAS_EQUIPAMENTOS_OPCOES.map(o => o.value)
    expect(values).toContain('computador')
    expect(values).toContain('impressora')
  })

  it('contém empilhadeira e outro', () => {
    const values = MAQUINAS_EQUIPAMENTOS_OPCOES.map(o => o.value)
    expect(values).toContain('empilhadeira')
    expect(values).toContain('outro')
  })
})

describe('todas as opções', () => {
  const allLists = [
    PISO_OPCOES, PAREDE_OPCOES, TELHADO_OPCOES, FORRO_OPCOES,
    DIVISORIAS_OPCOES, PAVIMENTO_OPCOES, REVESTIMENTO_OPCOES,
    SISTEMA_INCENDIO_OPCOES, GES_OPCOES, CONDICAO_POSTOS_OPCOES,
    LAYOUT_POSTO_OPCOES, TIPO_MEDICAO_OPCOES, UNIDADE_MEDIDA_OPCOES,
    OPCOES_SIM_NAO, OPCOES_ILUMINACAO_ARTIFICIAL, OPCOES_VENTILACAO_ARTIFICIAL,
    SEGURANCA_EMERGENCIA_ITENS, MAQUINAS_EQUIPAMENTOS_OPCOES,
  ]

  it('nenhuma lista está vazia', () => {
    for (const list of allLists) {
      expect(list.length).toBeGreaterThan(0)
    }
  })

  it('cada opção tem value e label do tipo string', () => {
    for (const list of allLists) {
      for (const opt of list) {
        expect(typeof opt.value).toBe('string')
        expect(typeof opt.label).toBe('string')
      }
    }
  })
})
