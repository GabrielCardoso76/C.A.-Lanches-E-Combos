# Guia de Instalação e Deploy

Este projeto é um cardápio digital (front-end e back-end) integrado ao Supabase para gerenciar produtos. Abaixo estão as instruções de como configurar o banco de dados e publicar a aplicação.

## 1. Configurando o Supabase

1. Crie uma conta no [Supabase](https://supabase.com/) e inicie um novo projeto.
2. No painel do projeto (Dashboard), vá em **SQL Editor** e execute o script abaixo para criar a tabela de produtos:

```sql
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
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security) mas permitir leitura pública e gravação anônima (para facilitar, ou configure roles)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para todos" ON public.products
  FOR SELECT USING (true);

-- Atenção: Permitindo inserção/atualização pública apenas para facilitar este setup inicial.
-- Recomenda-se adicionar autenticação real do Supabase antes de ir para produção de verdade.
CREATE POLICY "Permitir inserção anônima" ON public.products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização anônima" ON public.products
  FOR UPDATE USING (true);
```

3. Adicione alguns produtos de teste direto na tabela via painel do Supabase se desejar.
4. Vá em **Project Settings -> API** e copie os valores:
   - **Project URL**
   - **Project API Keys (anon / public)**

## 2. Configurando o Ambiente

No projeto ou na plataforma de deploy (Render/Vercel), você precisará configurar as seguintes variáveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=Sua_URL_do_Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=Sua_Chave_Anon_do_Supabase
```

*Nota: Se estas variáveis não estiverem configuradas, o sistema usará os dados falsos (mock) locais como fallback, mas o salvamento via painel Admin apenas fará um log no console.*

## 3. Deploy no Render (ou Vercel)

### Vercel (Recomendado para Next.js)
1. Crie uma conta na [Vercel](https://vercel.com/) e vincule seu GitHub.
2. Importe o repositório do seu projeto.
3. Na seção **Environment Variables**, adicione as duas chaves (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Clique em **Deploy**.

### Render
1. Crie uma conta no [Render](https://render.com/).
2. Clique em **New -> Web Service**.
3. Conecte o seu repositório GitHub.
4. Configurações:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
5. Em **Environment Variables**, adicione as chaves do Supabase.
6. Clique em **Create Web Service**.

## 4. Acesso ao Admin

Acesse `https://seu-dominio.com/admin` (ou `http://localhost:3000/admin` localmente)
- **Usuário:** Brian
- **Senha:** 123

Você poderá adicionar e editar os produtos, colocando o link (URL) das imagens (de 1 a 4 fotos), definir os valores e marcar se são **Destaques** ou **Mais Vendidos**.
