CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  best_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos" ON public.products
  FOR SELECT USING (true);

-- Permissões temporárias anônimas para facilitar o setup inicial
CREATE POLICY "Permitir inserção anônima" ON public.products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização anônima" ON public.products
  FOR UPDATE USING (true);
