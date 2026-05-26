UPDATE public.eventos
SET ingressos = (
  SELECT jsonb_agg(elem)
  FROM jsonb_array_elements(ingressos) elem
  WHERE elem->>'btnLabel' <> 'Promoções Exclusivas'
)
WHERE id = '1779446087030';