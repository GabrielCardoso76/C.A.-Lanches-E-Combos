-- Seed more neighborhoods for São Carlos
INSERT INTO public.neighborhoods (name, delivery_fee)
VALUES
  ('Outros', 10.00),
  ('Vila Costa do Sol', 6.00),
  ('Vila Marcelino', 5.00),
  ('Jardim São Carlos', 6.00),
  ('Parque Arnold Schatch', 7.00),
  ('Jardim Nova São Carlos', 7.00),
  ('Jardim Centenário', 8.00),
  ('Cidade Universitária', 6.00),
  ('Jardim Bandeirantes', 6.00),
  ('Jardim Pacaembu', 7.00),
  ('Vila Marina', 5.00),
  ('Jardim Macarengo', 5.00),
  ('Jardim Beatriz', 8.00),
  ('Parque Sabará', 7.00),
  ('Jardim das Torres', 9.00),
  ('Vila Carmem', 6.00),
  ('Jardim Ricetti', 6.00),
  ('Jardim Tangará', 7.00),
  ('Jardim Medeiros', 8.00),
  ('Azulville', 8.00),
  ('Jardim Hikare', 7.00)
ON CONFLICT DO NOTHING;
