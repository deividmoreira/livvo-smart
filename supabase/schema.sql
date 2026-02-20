-- ============================================
-- LIVVO SMART - Schema do Banco de Dados
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: corretores
-- ============================================
CREATE TABLE IF NOT EXISTS public.corretores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    foto_url TEXT,
    creci VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT corretores_user_id_unique UNIQUE (user_id),
    CONSTRAINT corretores_creci_unique UNIQUE (creci)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_corretores_user_id ON public.corretores(user_id);

-- ============================================
-- TABELA: imobiliarias
-- ============================================
CREATE TABLE IF NOT EXISTS public.imobiliarias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    logo_url TEXT,
    creci VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT imobiliarias_user_id_unique UNIQUE (user_id),
    CONSTRAINT imobiliarias_creci_unique UNIQUE (creci)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_imobiliarias_user_id ON public.imobiliarias(user_id);

-- ============================================
-- TABELA: imoveis
-- ============================================
CREATE TABLE IF NOT EXISTS public.imoveis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Informações básicas
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('terreno', 'casa', 'apartamento')),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'disponivel'
        CHECK (status IN ('disponivel', 'negociacao', 'vendido', 'reservado')),

    -- Localização
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    endereco VARCHAR(255),
    bairro VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(10),

    -- Características
    area_total DECIMAL(10, 2),
    area_construida DECIMAL(10, 2),
    quartos INTEGER,
    suites INTEGER,
    banheiros INTEGER,
    vagas_garagem INTEGER,
    andares INTEGER,

    -- Características extras (JSON)
    caracteristicas JSONB DEFAULT '{}',

    -- Anunciante
    anunciante_tipo VARCHAR(20) NOT NULL CHECK (anunciante_tipo IN ('corretor', 'imobiliaria')),
    corretor_id UUID REFERENCES public.corretores(id) ON DELETE SET NULL,
    imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Validação: deve ter corretor OU imobiliária
    CONSTRAINT imoveis_anunciante_check CHECK (
        (anunciante_tipo = 'corretor' AND corretor_id IS NOT NULL AND imobiliaria_id IS NULL) OR
        (anunciante_tipo = 'imobiliaria' AND imobiliaria_id IS NOT NULL AND corretor_id IS NULL)
    )
);

-- Índices para busca
CREATE INDEX IF NOT EXISTS idx_imoveis_tipo ON public.imoveis(tipo);
CREATE INDEX IF NOT EXISTS idx_imoveis_status ON public.imoveis(status);
CREATE INDEX IF NOT EXISTS idx_imoveis_valor ON public.imoveis(valor);
CREATE INDEX IF NOT EXISTS idx_imoveis_cidade ON public.imoveis(cidade);
CREATE INDEX IF NOT EXISTS idx_imoveis_bairro ON public.imoveis(bairro);
CREATE INDEX IF NOT EXISTS idx_imoveis_corretor_id ON public.imoveis(corretor_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_imobiliaria_id ON public.imoveis(imobiliaria_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_localizacao ON public.imoveis(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_imoveis_created_at ON public.imoveis(created_at DESC);

-- Índice GiST para busca geoespacial (opcional, requer PostGIS)
-- CREATE INDEX IF NOT EXISTS idx_imoveis_geo ON public.imoveis USING GIST (
--     ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
-- );

-- ============================================
-- TABELA: midias (fotos e vídeos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.midias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('imagem', 'video')),
    principal BOOLEAN DEFAULT FALSE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_midias_imovel_id ON public.midias(imovel_id);
CREATE INDEX IF NOT EXISTS idx_midias_ordem ON public.midias(imovel_id, ordem);
-- Garante apenas uma mídia principal por imóvel
CREATE UNIQUE INDEX IF NOT EXISTS midias_principal_unique ON public.midias(imovel_id) WHERE (principal = TRUE);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_corretores_updated_at
    BEFORE UPDATE ON public.corretores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imobiliarias_updated_at
    BEFORE UPDATE ON public.imobiliarias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_imoveis_updated_at
    BEFORE UPDATE ON public.imoveis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.corretores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imobiliarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.midias ENABLE ROW LEVEL SECURITY;

-- Políticas para CORRETORES

-- Qualquer um pode ver corretores
CREATE POLICY "Corretores são visíveis para todos"
    ON public.corretores FOR SELECT
    USING (true);

-- Corretor pode atualizar apenas seu próprio perfil
CREATE POLICY "Corretores podem atualizar seu próprio perfil"
    ON public.corretores FOR UPDATE
    USING (auth.uid() = user_id);

-- Corretor pode inserir seu próprio perfil
CREATE POLICY "Usuários podem criar seu perfil de corretor"
    ON public.corretores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para IMOBILIÁRIAS

-- Qualquer um pode ver imobiliárias
CREATE POLICY "Imobiliárias são visíveis para todos"
    ON public.imobiliarias FOR SELECT
    USING (true);

-- Imobiliária pode atualizar apenas seu próprio perfil
CREATE POLICY "Imobiliárias podem atualizar seu próprio perfil"
    ON public.imobiliarias FOR UPDATE
    USING (auth.uid() = user_id);

-- Imobiliária pode inserir seu próprio perfil
CREATE POLICY "Usuários podem criar seu perfil de imobiliária"
    ON public.imobiliarias FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para IMÓVEIS

-- Qualquer um pode ver imóveis disponíveis
CREATE POLICY "Imóveis são visíveis para todos"
    ON public.imoveis FOR SELECT
    USING (true);

-- Corretor pode inserir imóveis
CREATE POLICY "Corretores podem inserir imóveis"
    ON public.imoveis FOR INSERT
    WITH CHECK (
        anunciante_tipo = 'corretor' AND
        corretor_id IN (SELECT id FROM public.corretores WHERE user_id = auth.uid())
    );

-- Imobiliária pode inserir imóveis
CREATE POLICY "Imobiliárias podem inserir imóveis"
    ON public.imoveis FOR INSERT
    WITH CHECK (
        anunciante_tipo = 'imobiliaria' AND
        imobiliaria_id IN (SELECT id FROM public.imobiliarias WHERE user_id = auth.uid())
    );

-- Corretor pode atualizar seus próprios imóveis
CREATE POLICY "Corretores podem atualizar seus imóveis"
    ON public.imoveis FOR UPDATE
    USING (
        corretor_id IN (SELECT id FROM public.corretores WHERE user_id = auth.uid())
    );

-- Imobiliária pode atualizar seus próprios imóveis
CREATE POLICY "Imobiliárias podem atualizar seus imóveis"
    ON public.imoveis FOR UPDATE
    USING (
        imobiliaria_id IN (SELECT id FROM public.imobiliarias WHERE user_id = auth.uid())
    );

-- Corretor pode deletar seus próprios imóveis
CREATE POLICY "Corretores podem deletar seus imóveis"
    ON public.imoveis FOR DELETE
    USING (
        corretor_id IN (SELECT id FROM public.corretores WHERE user_id = auth.uid())
    );

-- Imobiliária pode deletar seus próprios imóveis
CREATE POLICY "Imobiliárias podem deletar seus imóveis"
    ON public.imoveis FOR DELETE
    USING (
        imobiliaria_id IN (SELECT id FROM public.imobiliarias WHERE user_id = auth.uid())
    );

-- Políticas para MÍDIAS

-- Qualquer um pode ver mídias
CREATE POLICY "Mídias são visíveis para todos"
    ON public.midias FOR SELECT
    USING (true);

-- Apenas dono do imóvel pode gerenciar mídias
CREATE POLICY "Donos podem inserir mídias"
    ON public.midias FOR INSERT
    WITH CHECK (
        imovel_id IN (
            SELECT id FROM public.imoveis
            WHERE corretor_id IN (SELECT id FROM public.corretores WHERE user_id = auth.uid())
            OR imobiliaria_id IN (SELECT id FROM public.imobiliarias WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Donos podem atualizar mídias"
    ON public.midias FOR UPDATE
    USING (
        imovel_id IN (
            SELECT id FROM public.imoveis
            WHERE corretor_id IN (SELECT id FROM public.corretores WHERE user_id = auth.uid())
            OR imobiliaria_id IN (SELECT id FROM public.imobiliarias WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Donos podem deletar mídias"
    ON public.midias FOR DELETE
    USING (
        imovel_id IN (
            SELECT id FROM public.imoveis
            WHERE corretor_id IN (SELECT id FROM public.corretores WHERE user_id = auth.uid())
            OR imobiliaria_id IN (SELECT id FROM public.imobiliarias WHERE user_id = auth.uid())
        )
    );

-- ============================================
-- TABELA: perfis (perfil unificado de todos os usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS public.perfis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('corretor', 'usuario', 'administrador')),
    foto_url TEXT,
    telefone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT perfis_user_id_unique UNIQUE (user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_perfis_user_id ON public.perfis(user_id);
CREATE INDEX IF NOT EXISTS idx_perfis_tipo ON public.perfis(tipo);

-- Trigger updated_at
CREATE TRIGGER update_perfis_updated_at
    BEFORE UPDATE ON public.perfis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: favoritos
-- ============================================
CREATE TABLE IF NOT EXISTS public.favoritos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT favoritos_unique UNIQUE (user_id, imovel_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_favoritos_user_id ON public.favoritos(user_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_imovel_id ON public.favoritos(imovel_id);

-- ============================================
-- ALTERAÇÃO: corretores — vínculo opcional com imobiliária
-- ============================================
ALTER TABLE public.corretores
    ADD COLUMN IF NOT EXISTS imobiliaria_id UUID REFERENCES public.imobiliarias(id) ON DELETE SET NULL;

-- ============================================
-- RLS: perfis
-- ============================================
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "Perfis são visíveis para todos"
    ON public.perfis FOR SELECT
    USING (true);

-- Usuário escreve apenas seu próprio perfil
CREATE POLICY "Usuários podem criar seu próprio perfil"
    ON public.perfis FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.perfis FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin pode deletar qualquer perfil
CREATE POLICY "Admins podem deletar perfis"
    ON public.perfis FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.perfis p
            WHERE p.user_id = auth.uid() AND p.tipo = 'administrador'
        )
    );

-- ============================================
-- RLS: favoritos
-- ============================================
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários leem apenas seus favoritos"
    ON public.favoritos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários inserem apenas seus favoritos"
    ON public.favoritos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários deletam apenas seus favoritos"
    ON public.favoritos FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- RLS adicional: admin pode gerenciar tudo em imoveis e midias
-- ============================================

CREATE POLICY "Admins podem inserir qualquer imóvel"
    ON public.imoveis FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.perfis p
            WHERE p.user_id = auth.uid() AND p.tipo = 'administrador'
        )
    );

CREATE POLICY "Admins podem atualizar qualquer imóvel"
    ON public.imoveis FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.perfis p
            WHERE p.user_id = auth.uid() AND p.tipo = 'administrador'
        )
    );

CREATE POLICY "Admins podem deletar qualquer imóvel"
    ON public.imoveis FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.perfis p
            WHERE p.user_id = auth.uid() AND p.tipo = 'administrador'
        )
    );

CREATE POLICY "Admins podem gerenciar qualquer mídia"
    ON public.midias FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.perfis p
            WHERE p.user_id = auth.uid() AND p.tipo = 'administrador'
        )
    );

CREATE POLICY "Admins podem atualizar qualquer mídia"
    ON public.midias FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.perfis p
            WHERE p.user_id = auth.uid() AND p.tipo = 'administrador'
        )
    );

CREATE POLICY "Admins podem deletar qualquer mídia"
    ON public.midias FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.perfis p
            WHERE p.user_id = auth.uid() AND p.tipo = 'administrador'
        )
    );

-- ============================================
-- STORAGE BUCKETS (executar no Supabase Dashboard)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('imoveis', 'imoveis', true);

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true);

-- ============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Inserir dados de exemplo apenas em ambiente de desenvolvimento
-- Descomente se necessário

/*
-- Corretor de exemplo (requer user_id válido do auth.users)
INSERT INTO public.corretores (id, user_id, nome, creci, whatsapp, email) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SEU_USER_ID_AQUI', 'João Silva', '12345-GO', '62999998888', 'joao@corretor.com');

-- Imóvel de exemplo
INSERT INTO public.imoveis (
    tipo, titulo, descricao, valor, latitude, longitude,
    bairro, cidade, estado, area_total, anunciante_tipo, corretor_id
) VALUES (
    'terreno',
    'Terreno 500m² - Jardim América',
    'Excelente terreno plano, pronto para construir.',
    95000,
    -16.6950,
    -49.2580,
    'Jardim América',
    'Goiânia',
    'GO',
    500,
    'corretor',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);
*/
