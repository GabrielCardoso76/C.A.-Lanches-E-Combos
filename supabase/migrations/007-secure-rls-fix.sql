-- Remove the insecure admin loophole that allowed anyone to read all profiles
DROP POLICY IF EXISTS "Permitir leitura de profiles para admin" ON public.profiles;
DROP POLICY IF EXISTS "Permitir leitura anonima de profiles para admin" ON public.profiles;
