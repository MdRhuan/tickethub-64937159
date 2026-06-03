import { supabase } from '@/integrations/supabase/client';

// Bucket privado "imagens" → signed URL de longa duração (10 anos).
const TEN_YEARS_SECONDS = 60 * 60 * 24 * 365 * 10;

function sanitizeExt(name: string): string {
  const m = /\.([a-zA-Z0-9]+)$/.exec(name);
  const ext = (m?.[1] || 'jpg').toLowerCase();
  return ext.replace(/[^a-z0-9]/g, '') || 'jpg';
}

/**
 * Faz upload do arquivo para o bucket "imagens" e retorna uma URL assinada
 * de longa duração que pode ser persistida no banco.
 */
export async function uploadImage(file: File, folder = 'uploads'): Promise<string> {
  const ext = sanitizeExt(file.name);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('imagens')
    .upload(path, file, {
      contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: false,
      cacheControl: '31536000',
    });
  if (upErr) throw upErr;

  const { data, error: signErr } = await supabase.storage
    .from('imagens')
    .createSignedUrl(path, TEN_YEARS_SECONDS);
  if (signErr || !data?.signedUrl) throw signErr || new Error('Falha ao gerar URL da imagem.');

  return data.signedUrl;
}
