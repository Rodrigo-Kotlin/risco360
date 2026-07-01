# FORMS_AUDIT.md — FASE 5.2 Formulários Críticos

## src/components/forms/EmpresaForm.tsx (339 linhas)

### useStates (63 ocorrências de useState)
| Campo | Tipo | Inicial | Obrigatório |
|---|---|---|---|
| `razao_social` | string | `initialData?.razao_social ?? ''` | SIM |
| `nome_fantasia` | string | `initialData?.nome_fantasia ?? ''` | — |
| `cnpj` | string | `initialData?.cnpj ?? ''` | — |
| `cnae` | string | `initialData?.cnae ?? ''` | — |
| `grau_risco` | string | `initialData?.grau_risco ?? ''` | — |
| `endereco` | string | `initialData?.endereco ?? ''` | — |
| `numero` | string | `initialData?.numero ?? ''` | — |
| `bairro` | string | `initialData?.bairro ?? ''` | — |
| `cidade` | string | `initialData?.cidade ?? ''` | — |
| `uf` | string | `initialData?.uf ?? ''` | — |
| `cep` | string | `initialData?.cep ?? ''` | — |
| `responsavel` | string | `initialData?.responsavel ?? ''` | — |
| `telefone` | string | `initialData?.telefone ?? ''` | — |
| `email` | string | `initialData?.email ?? ''` | — |
| `observacoes` | string | `initialData?.observacoes ?? ''` | — |
| `cnae_principal` | string | `initialData?.cnae_principal ?? ''` | — |
| `cnae_principal_descricao` | string | `initialData?.cnae_principal_descricao ?? ''` | — |
| `grau_risco_nr4` | number \| null | `initialData?.grau_risco_nr4 ?? null` | — |
| `errors` | Record<string, string> | `{}` | — |

### useRefs
- `autoFilledRef: Set<string>` — controla quais campos foram preenchidos via CNPJ
- `lastCnpjRef: string` — evita consultas repetidas de CNPJ

### Hooks externos
- `useCnpjLookup()` — retorna `{ loading, error, empresa, buscar, limpar }`

### Validação manual
```typescript
const validate = (): boolean => {
  const errs: Record<string, string> = {}
  if (!razao_social.trim()) errs.razao_social = 'Razão social é obrigatória'
  setErrors(errs)
  return Object.keys(errs).length === 0
}
```
- Apenas `razao_social` é validada
- Mensagem hardcoded: `'Razão social é obrigatória'`
- Erros armazenados em `Record<string, string>` — sem tipagem

### Lógica específica
- **CNPJ lookup**: `handleCnpjChange` → `normalizarCnpj` → `buscarCnpj` quando 14 dígitos
- **Auto-preenchimento**: `preencherAutomaticamente` seta `razao_social`, `nome_fantasia`, `endereco`, `numero`, `bairro`, `cidade`, `uf`, `cep`, `cnae`, `cnae_principal`, `cnae_principal_descricao`, `grau_risco`, `grau_risco_nr4` via CNPJ
- **Submit**: Monta `EmpresaCreateInput` manualmente com `.trim()` e `|| undefined`
- **Máscaras**: Nenhuma — CNPJ, CEP, telefone são campos de texto livre

### Estrutura visual
- 3 `FormSection`: Dados da empresa, Endereço, Observações
- `Input`, `Select`, `Textarea` (todos com `forwardRef` → compatíveis com RHF `register`)
- Card informativo de dados CNPJ (exibido condicionalmente)

---

## src/components/forms/RiscoForm.tsx (326 linhas)

### useStates
| Campo | Tipo | Inicial |
|---|---|---|
| `codigo` | string | `initial?.codigo ?? ''` |
| `categoria` | CategoriaRisco | `initial?.categoria ?? 'fisico'` |
| `agente` | string | `initial?.agente ?? ''` |
| `descricao` | string | `initial?.descricao ?? ''` |
| `fonteGeradora` | string | `initial?.fonte_geradora ?? ''` |
| `meiosPropagacao` | MeioPropagacao[] | `initial?.meios_propagacao ?? []` |
| `caracterizacao` | string | `initial?.caracterizacao ?? ''` |
| `danoPossivel` | string | `initial?.dano_possivel ?? ''` |
| `fonteAvaliacao` | string | `initial?.fonte_avaliacao ?? ''` |
| `probabilidade` | string (number as string) | `initial?.probabilidade?.toString() ?? ''` |
| `severidade` | string (number as string) | `initial?.severidade?.toString() ?? ''` |
| `sugestoesExposicao` | string | `initial?.sugestoes_exposicao ?? ''` |
| `meioPropagacaoLabel` | string | `initial?.meio_propagacao_label ?? ''` |
| `sinalizacao` | string | `initial?.sinalizacao ?? ''` |
| `acoesRecomendadas` | string | `initial?.acoes_recomendadas?.join('\n') ?? ''` |
| `observacoes` | string | `initial?.observacoes ?? ''` |
| `bibliotecaItemId` | string \| null | `initial?.biblioteca_item_id ?? null` |
| `bibliotecaTitulo` | string \| null | `initial?.biblioteca_titulo ?? null` |
| `medidasControle` | MedidaControle[] | `initial?.medidas_controle ?? []` |
| `epis` | EPI[] | `initial?.epis ?? []` |
| `bibliotecaModalOpen` | boolean | `false` |
| `saving` | boolean | `false` |

### useRefs
- `bibliotecaItemIdRef: string | null` — id do item da biblioteca técnica
- `bibliotecaTituloRef: string | null` — título do item da biblioteca

### Validação
- **NENHUMA** validação `validate()` — apenas atributo `required` no HTML
- Erros não são gerenciados programaticamente

### Lógica específica
- **Nível de risco calculado**: `calcularNivelRisco(probNum, sevNum)` a cada render (derivado)
- **toggleMeioPropagacao**: adiciona/remove do array `meiosPropagacao`
- **applyBibliotecaItem**: preenche múltiplos campos a partir de `BibliotecaTecnicaItem`
  - Usa condicionais `if (item.X && !campoY)` para não sobrescrever dados manuais
- **normalizeCategoria**: mapeia strings acentuadas/inglês para `CategoriaRisco`
- **Submit**: Monta `RiscoOcupacional` com split de `acoes_recomendadas`, parse de `probabilidade`/`severidade`

### Estrutura visual
- 1 `FormSection` com 10+ campos
- Input, Select, Textarea
- `NivelRiscoBadge` (derivado)
- `BibliotecaRiscoSelector` (modal)
- Botões toggle para `meiosPropagacao`
- Botão de abrir biblioteca técnica

---

## Resumo das Mudanças Necessárias

| Aspecto | EmpresaForm | RiscoForm |
|---|---|---|
| useState para estado | 18 campos + errors | 22 campos |
| useRefs | 2 | 2 |
| Validação manual | `validate()` simples | Nenhuma |
| Mensagens hardcoded | 1 (`Razão social é obrigatória`) | 0 (usa `required` nativo) |
| Zod schema | Novo | Novo |
| RHF `useForm` | Substituir | Substituir |
| `register()` | 15 inputs + 1 textarea | 13 inputs + 3 textareas + 1 select |
| `Controller` | 0 (Select via register) | meiosPropagacao (array toggle) |
| `setValue()` | CNPJ auto-fill (13 campos) | Biblioteca auto-fill (12 campos) |
| Complexidade extra | CNPJ lookup + auto-fill | Biblioteca lookup + auto-fill + cálculo nível risco |
