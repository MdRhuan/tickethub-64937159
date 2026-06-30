import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Post } from '@/types';
import { fmtDataBlog } from '@/lib/utils';
import { imgSrc } from '@/lib/responsiveImg';
import { useSeo } from '@/lib/seo';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase.from('posts').select('*').eq('id', id!).maybeSingle().then(({ data }) => {
      if (!active) return;
      setPost(data ? (data as unknown as Post) : null);
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  // SEO/Open Graph dinâmico. Preview social via prerender (scripts/prerender-og.mjs).
  const postJsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.titulo,
    description: post.subtitulo || undefined,
    image: post.imgUrl || undefined,
    datePublished: post.data || undefined,
    author: { '@type': 'Person', name: post.autor || 'Ticket Hub' },
    mainEntityOfPage: typeof window !== 'undefined' ? window.location.href : undefined,
  } : undefined;

  useSeo({
    title: post?.titulo ?? '',
    description: post?.subtitulo || post?.conteudo,
    image: post?.imgUrl,
    type: 'article',
    jsonLd: postJsonLd,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[#666]">Carregando...</div>
    );
  }

  if (!post) {
    return (
      <div className="page-px py-20 text-center">
        <p className="text-lg text-[#666] mb-4">Post não encontrado.</p>
        <Link to="/blog" className="text-[#4a90e2] font-semibold no-underline hover:underline">← Voltar para o Blog</Link>
      </div>
    );
  }

  const heroBg = post.imgUrl ? imgSrc(post.imgUrl, 1440, 72) : undefined;
  const paragrafos = (post.conteudo || '').split(/\n\s*\n|\n/).map(s => s.trim()).filter(Boolean);

  return (
    <>
      <section
        className="relative page-px py-[72px] bg-gradient-to-br from-[#0d0d0d] to-[#1a1f36]"
        style={heroBg ? {
          backgroundImage: `linear-gradient(rgba(13,13,13,0.7),rgba(26,31,54,0.85)), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="max-w-[820px] mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-[#4a90e2] text-sm font-semibold no-underline mb-5 hover:underline">
            ← Voltar para o Blog
          </Link>
          {post.tag && (
            <span className="inline-block bg-[#eef5ff] text-[#4a90e2] text-[11px] font-bold px-3 py-1 rounded-full mb-4">{post.tag}</span>
          )}
          <h1 className="text-white font-black leading-[1.15] mb-4" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
            {post.titulo}
          </h1>
          {post.subtitulo && (
            <p className="text-base text-[#ccc] leading-[1.65] max-w-[680px]">{post.subtitulo}</p>
          )}
        </div>
      </section>

      <article className="page-px py-12 max-w-[820px] mx-auto">
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[#eee]">
          <div className="w-10 h-10 rounded-full bg-[#1a3a6b] text-white flex items-center justify-center font-bold">
            {(post.autor || 'T').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#111]">{post.autor || 'Ticket Hub'}</span>
            <span className="text-xs text-[#666]">{fmtDataBlog(post.data)}</span>
          </div>
        </div>

        {paragrafos.length > 0 ? (
          paragrafos.map((p, i) => (
            <p key={i} className="text-[17px] leading-[1.8] text-[#333] mb-5">{p}</p>
          ))
        ) : (
          <p className="text-[#666] italic">Este post ainda não tem conteúdo.</p>
        )}
      </article>
    </>
  );
}
