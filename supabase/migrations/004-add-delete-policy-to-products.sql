CREATE POLICY "Permitir delecao anonima" ON public.products FOR DELETE USING (true);
