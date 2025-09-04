-- Seed initial modalidades for each unit
INSERT INTO public.modalidades (nome, descricao, unidade, vagas_maximas, horario_inicio, horario_fim, dias_semana) VALUES
-- Carmem Cristina - Hortolândia
('kung_fu', 'Arte marcial chinesa focada em disciplina e autocontrole', 'carmem_cristina', 25, '14:00', '15:30', ARRAY['segunda', 'quarta', 'sexta']),
('futebol_futsal', 'Futebol e futsal para desenvolvimento motor e trabalho em equipe', 'carmem_cristina', 30, '15:30', '17:00', ARRAY['terca', 'quinta']),
('ballet', 'Dança clássica para desenvolvimento da coordenação e expressão', 'carmem_cristina', 20, '16:00', '17:00', ARRAY['segunda', 'quarta']),
('reforco_escolar', 'Apoio pedagógico para melhoria do desempenho escolar', 'carmem_cristina', 15, '13:00', '15:00', ARRAY['segunda', 'terca', 'quarta', 'quinta', 'sexta']),

-- São Clemente - Monte Mor
('handebol', 'Esporte coletivo para desenvolvimento da coordenação motora', 'sao_clemente', 28, '14:30', '16:00', ARRAY['terca', 'quinta']),
('volei', 'Voleibol adaptado para diferentes idades', 'sao_clemente', 24, '16:00', '17:30', ARRAY['segunda', 'quarta']),
('capoeira', 'Arte marcial brasileira que combina luta, dança e música', 'sao_clemente', 25, '15:00', '16:30', ARRAY['terca', 'sexta']),
('ingles', 'Aulas de inglês básico e intermediário', 'sao_clemente', 20, '13:30', '15:00', ARRAY['segunda', 'quarta', 'sexta']),

-- Nova Hortolândia - Hortolândia
('jazz', 'Dança moderna e expressiva', 'nova_hortolandia', 22, '15:00', '16:30', ARRAY['terca', 'quinta']),
('zumba', 'Dança fitness divertida e energética', 'nova_hortolandia', 30, '17:00', '18:00', ARRAY['segunda', 'quarta', 'sexta']),
('bateria', 'Percussão e ritmo musical', 'nova_hortolandia', 12, '14:00', '15:30', ARRAY['terca', 'quinta']),
('croche', 'Artesanato e desenvolvimento da coordenação motora fina', 'nova_hortolandia', 15, '13:00', '14:30', ARRAY['segunda', 'quarta']),

-- Jardim Paulista - Monte Mor
('kung_fu', 'Arte marcial chinesa focada em disciplina e autocontrole', 'jardim_paulista', 25, '15:30', '17:00', ARRAY['terca', 'quinta']),
('futebol_futsal', 'Futebol e futsal para desenvolvimento motor e trabalho em equipe', 'jardim_paulista', 30, '14:00', '15:30', ARRAY['segunda', 'quarta', 'sexta']),
('reforco_escolar', 'Apoio pedagógico para melhoria do desempenho escolar', 'jardim_paulista', 15, '13:00', '15:00', ARRAY['segunda', 'terca', 'quarta', 'quinta', 'sexta']),

-- Nawampity - Uganda
('futebol_futsal', 'Football training for youth development', 'nawampity_uganda', 35, '15:00', '16:30', ARRAY['segunda', 'quarta', 'sexta']),
('ingles', 'English language classes', 'nawampity_uganda', 25, '13:00', '14:30', ARRAY['terca', 'quinta']),
('reforco_escolar', 'Educational support and tutoring', 'nawampity_uganda', 20, '14:30', '16:00', ARRAY['segunda', 'terca', 'quarta', 'quinta', 'sexta']);
