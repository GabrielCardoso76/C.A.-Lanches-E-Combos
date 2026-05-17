-- Adicionar coluna de número do pedido sequencial
ALTER TABLE public.orders ADD COLUMN order_number INTEGER;

-- Função para calcular o número sequencial baseado no "Dia Operacional"
-- Um Dia Operacional vai das 06:00 do dia atual até as 05:59 do dia seguinte no fuso de São Paulo.
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
DECLARE
    v_timezone TEXT := 'America/Sao_Paulo';
    v_operational_date DATE;
    v_max_number INTEGER;
BEGIN
    -- Subtrair 6 horas do created_at (no fuso de SP) para descobrir a data operacional
    -- Ex: 01:30 da madrugada do dia 15 -> fuso SP (01:30) - 6h = 19:30 do dia 14 (Data Operacional = 14)
    -- Ex: 18:00 da tarde do dia 15 -> fuso SP (18:00) - 6h = 12:00 do dia 15 (Data Operacional = 15)
    v_operational_date := (timezone(v_timezone, NEW.created_at) - INTERVAL '6 hours')::DATE;

    -- Obter o maior número de pedido daquela mesma data operacional
    SELECT COALESCE(MAX(order_number), 0) INTO v_max_number
    FROM public.orders
    WHERE (timezone(v_timezone, created_at) - INTERVAL '6 hours')::DATE = v_operational_date;

    -- Atribuir o próximo número
    NEW.order_number := v_max_number + 1;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar a trigger para executar a função antes de inserir um novo pedido
CREATE TRIGGER tr_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_number();
