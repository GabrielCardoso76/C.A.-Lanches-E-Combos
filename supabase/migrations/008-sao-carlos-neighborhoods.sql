-- Seed some initial neighborhoods for São Carlos
INSERT INTO public.neighborhoods (name, delivery_fee)
VALUES
  ('Centro', 5.00),
  ('Vila Nery', 6.00),
  ('Vila Prado', 6.00),
  ('Cidade Aracy', 10.00),
  ('Santa Felícia', 8.00),
  ('Jardim Cruzeiro do Sul', 7.00),
  ('Maria Stella Fagá', 7.00),
  ('Jardim Paulistano', 6.00)
ON CONFLICT DO NOTHING;
