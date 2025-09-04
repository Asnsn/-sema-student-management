-- SEMA Student Management System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'professor', 'aluno');
CREATE TYPE unit_location AS ENUM ('carmem_cristina', 'sao_clemente', 'nova_hortolandia', 'jardim_paulista', 'nawampity_uganda');
CREATE TYPE modalidade_type AS ENUM ('kung_fu', 'handebol', 'futebol_futsal', 'volei', 'ballet', 'jazz', 'zumba', 'capoeira', 'bateria', 'croche', 'reforco_escolar', 'ingles');
CREATE TYPE inscription_status AS ENUM ('ativo', 'fila_espera', 'inativo');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'aluno',
  telefone TEXT,
  data_nascimento DATE,
  endereco TEXT,
  responsavel_nome TEXT, -- Para alunos menores
  responsavel_telefone TEXT, -- Para alunos menores
  unidade unit_location NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modalidades table
CREATE TABLE IF NOT EXISTS public.modalidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome modalidade_type NOT NULL,
  descricao TEXT,
  unidade unit_location NOT NULL,
  professor_id UUID REFERENCES public.profiles(id),
  vagas_maximas INTEGER DEFAULT 30,
  vagas_ocupadas INTEGER DEFAULT 0,
  horario_inicio TIME,
  horario_fim TIME,
  dias_semana TEXT[], -- Array de dias: ['segunda', 'quarta', 'sexta']
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inscricoes table (student enrollments)
CREATE TABLE IF NOT EXISTS public.inscricoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  modalidade_id UUID NOT NULL REFERENCES public.modalidades(id) ON DELETE CASCADE,
  status inscription_status DEFAULT 'fila_espera',
  data_inscricao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  aprovado_por UUID REFERENCES public.profiles(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aluno_id, modalidade_id)
);

-- Presencas table (attendance tracking)
CREATE TABLE IF NOT EXISTS public.presencas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  modalidade_id UUID NOT NULL REFERENCES public.modalidades(id) ON DELETE CASCADE,
  data_aula DATE NOT NULL,
  presente BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  registrado_por UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(aluno_id, modalidade_id, data_aula)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modalidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins and professors can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'professor')
    )
  );

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for modalidades
CREATE POLICY "Everyone can view active modalidades" ON public.modalidades
  FOR SELECT USING (ativo = true);

CREATE POLICY "Professors can manage their modalidades" ON public.modalidades
  FOR ALL USING (
    professor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for inscricoes
CREATE POLICY "Students can view their own inscricoes" ON public.inscricoes
  FOR SELECT USING (aluno_id = auth.uid());

CREATE POLICY "Students can insert their own inscricoes" ON public.inscricoes
  FOR INSERT WITH CHECK (aluno_id = auth.uid());

CREATE POLICY "Professors and admins can manage inscricoes" ON public.inscricoes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'professor')
    )
  );

-- RLS Policies for presencas
CREATE POLICY "Students can view their own presencas" ON public.presencas
  FOR SELECT USING (aluno_id = auth.uid());

CREATE POLICY "Professors can manage presencas for their modalidades" ON public.presencas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.modalidades m
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE m.id = modalidade_id 
      AND (m.professor_id = auth.uid() OR p.role = 'admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_unidade ON public.profiles(unidade);
CREATE INDEX idx_modalidades_unidade ON public.modalidades(unidade);
CREATE INDEX idx_modalidades_professor ON public.modalidades(professor_id);
CREATE INDEX idx_inscricoes_aluno ON public.inscricoes(aluno_id);
CREATE INDEX idx_inscricoes_modalidade ON public.inscricoes(modalidade_id);
CREATE INDEX idx_inscricoes_status ON public.inscricoes(status);
CREATE INDEX idx_presencas_aluno_modalidade ON public.presencas(aluno_id, modalidade_id);
CREATE INDEX idx_presencas_data ON public.presencas(data_aula);
