import { supabase } from '@/integrations/supabase/client';

// Bucket privado "imagens" → signed URL de longa duração (10 anos).
const TEN_YEARS_SECONDS = 60 * 60 * 24 * 365 * 10;

function sanitizeExt(name: string): string {
  const m = /\.([a-zA-Z0-9]+)$/.exec(name);
  const ext = (m?.[1] || 'jpg').toLowerCase();
  return ext.replace(/[^a-z0-9]/g, '') || 'jpg';
}

/**
 * Reduz a imagem para no máx. `maxDim` px (lado maior) e reexporta em WebP.
 * Mantém SVG/GIF intactos. Roda no navegador do admin, antes do upload.
 */
async function downscaleImage(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  // Já é pequena e leve? Não recomprime à toa.
  if (scale === 1 && file.size < 600_000) { bitmap.close?.(); return file; }

  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) { bitmap.close?.(); return file; }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality));
  return blob ?? file;
}

/**
 * Faz upload do arquivo para o bucket "imagens" e retorna uma URL assinada
 * de longa duração que pode ser persistida no banco.
 */
export async function uploadImage(file: File, folder = 'uploads'): Promise<string> {
  const processed = await downscaleImage(file);
  const isWebp = processed !== file && processed.type === 'image/webp';
  const ext = isWebp ? 'webp' : sanitizeExt(file.name);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from('imagens')
    .upload(path, processed, {
      contentType: processed.type || file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
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
