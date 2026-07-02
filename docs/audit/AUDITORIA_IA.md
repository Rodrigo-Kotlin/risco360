# AUDITORIA DE IA CORPORATIVA SST — RISCO360

## STATUS ATUAL: NÃO EVIDENCIADO

**Nenhum arquivo, import, referência, chamada de API, prompt, modelo ou serviço de IA foi encontrado na codebase.**

Buscas realizadas:
- `openai`, `gemini`, `anthropic`, `claude`, `chatgpt` — 0 resultados
- `IA`, `ia`, `ai` — 0 resultados em nomes de arquivo
- `embedding`, `rag`, `vector`, `llm` — 0 resultados
- Qualquer import de SDK de IA — 0 resultados

---

## POTENCIAL PARA IA SST

### 1. RAG (Retrieval-Augmented Generation) sobre Biblioteca Técnica

**Dados disponíveis:**
- 329 códigos CNAE mapeados para grau de risco (NR-4)
- Biblioteca técnica com 27 campos (perigo, risco, fonte, medidas_controle, EPIs, EPCs, treinamentos)
- Normas: NR-01, NR-07, NR-09, NR-15, NR-17

**Caso de uso:**
```
Usuário: "Quais riscos existem em uma marcenaria?"
Sistema: busca CNAE 1622-6 (fabricação de móveis), grau_risco 3,
         consulta biblioteca técnica por perigos relacionados,
         gera lista de riscos + medidas de controle
```

**Infra necessária:**
- Vector store (pgvector no Supabase)
- Embeddings com `text-embedding-3-small` (OpenAI) ou modelos locais
- Pipeline de chunking da biblioteca técnica
- Chat UI no frontend

**Esforço:** 4-6 semanas

### 2. Geração de Inventário de Riscos

**Dados disponíveis:**
- Steps do wizard (identificação, características, iluminação, EPIs, medições)
- Riscos cadastrados por setor
- Medições quantitativas (ruído, iluminação, temperatura, etc.)

**Caso de uso:**
```
Usuário completa LPR → IA gera inventário de riscos preliminar
Usuário revisa e ajusta → IA aprende com correções
```

**Infra necessária:**
- Prompt engineering com template do inventário
- Validação humana obrigatória (NR-01 exige responsável técnico)
- Histórico de correções para fine-tuning

**Esforço:** 6-8 semanas

### 3. Geração de Plano de Ação

**Dados disponíveis:**
- `PlanoAcaoItem` type (risco, descricao, prazo, responsavel, status)
- Medidas de controle sugeridas na biblioteca técnica

**Caso de uso:**
```
IA sugere plano de ação baseado nos riscos identificados
Usuário aprova/rejeita/itens individualmente
```

**Esforço:** 4-6 semanas

### 4. Geração de PGR (Programa de Gerenciamento de Riscos)

**Dados disponíveis:**
- Inventário completo de riscos
- Medições quantitativas
- Plano de ação
- Dados da empresa (CNAE, grau de risco)

**Caso de uso:**
```
IA compila PGR completo em PDF com base nos dados coletados
Usuário revisa antes da assinatura digital
```

**Esforço:** 8-12 semanas (incluindo template do documento)

### 5. Chat SST com Base Técnica

**Caso de uso:**
```
Técnico: "Qual o limite de exposição para ruído intermitente?"
IA: Consulta NR-15, anexo 1, responde com limite + docagem
```

**Diferencial:** Nenhum concorrente brasileiro oferece chat SST com IA.

**Esforço:** 4-6 semanas

---

## CUSTOS ESTIMADOS (Mensais)

| Serviço | Estimativa |
|---|---|
| OpenAI API (GPT-4o-mini + embeddings) | R$ 200-500 |
| pgvector no Supabase (upgrade) | Já incluso no plano atual |
| Total | R$ 200-500/mês |

---

## RECOMENDAÇÕES

### Curto Prazo (30 dias)
1. Implementar pgvector no Supabase (incluído no plano atual)
2. Criar pipeline de geração de embeddings para biblioteca técnica
3. Implementar busca semântica na biblioteca técnica

### Médio Prazo (90 dias)
4. Chat SST com RAG (biblioteca técnica + normas)
5. Sugestão automática de riscos por CNAE + setor
6. Geração preliminar de inventário de riscos

### Longo Prazo (6 meses)
7. Geração automática de PGR/LTCAT com IA
8. Assistente virtual SST para técnicos em campo
9. Fine-tuning com dados de uso para melhorar sugestões
