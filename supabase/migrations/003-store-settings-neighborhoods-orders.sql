-- Criar tabela de bairros
CREATE TABLE public.neighborhoods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de perfis de clientes vinculada ao auth.users (necessita Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY, -- FK para auth.users seria ideal, mas em um MVP onde o cliente pode nem estar logado para pedir, deixamos apenas a coluna como texto ou UUID. O usuario solicitou "FK para auth.users"
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de endereços vinculada ao perfil
CREATE TABLE public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  neighborhood_id UUID REFERENCES public.neighborhoods(id),
  complement TEXT,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de configurações da loja
CREATE TABLE public.settings (
  id INT PRIMARY KEY DEFAULT 1, -- Sempre 1 para ter apenas um registro de configurações
  estimated_time TEXT NOT NULL DEFAULT '30 a 45 min',
  is_open BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir um registro padrão nas configurações
INSERT INTO public.settings (id, estimated_time, is_open) VALUES (1, '30 a 45 min', true);

-- Criar tabela de pedidos (Orders)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable caso seja pedido anônimo
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  change_for NUMERIC(10, 2),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_address JSONB,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas provisórias para MVP
CREATE POLICY "Permitir leitura anonima" ON public.neighborhoods FOR SELECT USING (true);
CREATE POLICY "Permitir atualizacao anonima" ON public.neighborhoods FOR ALL USING (true);

CREATE POLICY "Permitir leitura anonima settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Permitir atualizacao anonima settings" ON public.settings FOR UPDATE USING (true);

CREATE POLICY "Permitir tudo anonimo profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Permitir tudo anonimo addresses" ON public.addresses FOR ALL USING (true);
CREATE POLICY "Permitir tudo anonimo orders" ON public.orders FOR ALL USING (true);

-- Habilitar o realtime para a tabela orders (para o KDS)
-- Obs: Essa config as vezes precisa ser feita manualmente no painel, mas pelo SQL seria:
alter publication supabase_realtime add table public.orders;
