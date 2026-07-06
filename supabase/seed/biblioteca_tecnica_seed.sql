-- Seed: Biblioteca Técnica
-- Execute no SQL Editor do Supabase para popular a tabela biblioteca_tecnica
-- Não cria migration. Uso manual.
-- Idempotente: insere apenas itens que ainda não existem (por categoria + tipo_risco + perigo + titulo)

-- NOTA: Este arquivo contém apenas a estrutura do INSERT com NOT EXISTS.
-- Os dados completos serão gerados a partir do seed TypeScript.
-- Para dados completos, use: npm run seed:biblioteca

-- Exemplo de INSERT (repita para cada item):
-- INSERT INTO public.biblioteca_tecnica (categoria, titulo, descricao, tipo_risco, perigo, risco, fonte, fonte_geradora, danos_possiveis, meios_propagacao, descricao_exposicao, sugestao_exposicao, medidas_controle, epis, epcs, treinamentos, acoes_recomendadas, ativo, publico)
-- SELECT ... WHERE NOT EXISTS (
--   SELECT 1 FROM public.biblioteca_tecnica
--   WHERE categoria = '...'
--     AND tipo_risco = '...'
--     AND perigo = '...'
--     AND titulo = '...'
-- );

-- ATENÇÃO: Para popular com todos os itens, execute primeiro o script Node:
--   npm run seed:biblioteca
-- 
-- Ou compile o seed e copie os INSERTs manualmente.
-- 
-- Exemplo funcional:
DO $$
DECLARE
  v_count integer;
BEGIN
  -- Ruído Ocupacional
  IF NOT EXISTS (SELECT 1 FROM public.biblioteca_tecnica WHERE categoria = 'fisico' AND tipo_risco = 'Físico' AND perigo = 'Ruído acima dos limites de tolerância' AND titulo = 'Ruído contínuo ou intermitente') THEN
    INSERT INTO public.biblioteca_tecnica (categoria, titulo, descricao, tipo_risco, perigo, risco, fonte, fonte_geradora, danos_possiveis, meios_propagacao, descricao_exposicao, sugestao_exposicao, medidas_controle, epis, epcs, treinamentos, acoes_recomendadas, ativo, publico)
    VALUES (
      'fisico',
      'Ruído contínuo ou intermitente',
      'Avaliação de ruído contínuo ou intermitente gerado por máquinas e equipamentos industriais.',
      'Físico',
      'Ruído acima dos limites de tolerância',
      'Perda auditiva induzida por ruído (PAIR), zumbido, estresse, fadiga',
      'NR-15 Anexo 1 / NHO 01',
      'Máquinas, equipamentos, prensas, serras, compressores, ventiladores',
      '["Perda auditiva", "Zumbido", "Estresse", "Fadiga"]',
      '["Sonora", "Ar"]',
      'Exposição ocupacional a ruído contínuo ou intermitente acima de 80 dB(A) durante a jornada de trabalho.',
      'Limite de tolerância: 85 dB(A) para 8h (NR-15). Avaliar nível de exposição e dose diária.',
      '[{"descricao": "Enclausuramento de máquinas ruidosas", "tipo": "engenharia", "eficaz": true}, {"descricao": "Barreira acústica", "tipo": "engenharia", "eficaz": true}, {"descricao": "Protetor auricular tipo concha", "tipo": "epi", "eficaz": true}, {"descricao": "Rodízio de funcionários", "tipo": "administrativo", "eficaz": true}]',
      '[{"descricao": "Protetor auricular tipo concha", "ca": null, "validade": null}, {"descricao": "Protetor auricular tipo inserção", "ca": null, "validade": null}]',
      '["Barreira acústica", "Cabine acústica", "Manta acústica", "Enclausuramento"]',
      '[{"descricao": "Conservação auditiva", "tipo": "Periódico", "carga_horaria": 4, "periodicidade": "Anual"}, {"descricao": "Uso correto de protetores auriculares", "tipo": "Inicial", "carga_horaria": 2, "periodicidade": "Único"}]',
      '["Realizar audiometria semestral", "Medir nível de ruído anualmente", "Substituir protetores conforme validade"]',
      true, true
    );
    v_count := 1;
  END IF;
END $$;

-- + Adicione mais INSERTs seguindo o mesmo padrão para todos os itens do seed.
