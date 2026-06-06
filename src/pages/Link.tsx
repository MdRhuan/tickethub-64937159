import { useEffect } from 'react';

const SiteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1B2B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.92a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.35z" />
  </svg>
);

const SocialBtn = ({ href, children, label }: { href: string; children: React.ReactNode; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    style={{
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none',
    }}
  >
    <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  </a>
);

const LinkCard = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="lk-card">
    <div className="lk-card-icon">{icon}</div>
    <span className="lk-card-label">{label}</span>
  </a>
);

export default function Link() {
  useEffect(() => {
    document.title = 'TicketHubh — Links';
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        .lk-root { background:#1B2B44; font-family:'DM Sans', sans-serif; display:flex; justify-content:center; padding:40px 16px 80px; min-height:100vh; min-height:100dvh; -webkit-tap-highlight-color:transparent; width:100%; }
        @supports (padding-bottom: env(safe-area-inset-bottom)) { .lk-root { padding-bottom: calc(80px + env(safe-area-inset-bottom)); } }
        .lk-card { display:flex; align-items:center; gap:14px; padding:13px 14px; background:#fff; border:1.5px solid #e5e5e5; border-radius:16px; text-decoration:none; color:#111; min-height:72px; transition:background .2s, border-color .2s, box-shadow .2s, transform .2s; cursor:pointer; }
        .lk-card:active { background:#f0f0f0; border-color:#ccc; transform:scale(0.98); }
        @media (hover:hover) { .lk-card:hover { background:#e8f0fa; border-color:#E87722; border-width:2.5px; box-shadow:0 10px 28px rgba(0,0,0,0.25); transform:translateY(-4px) scale(1.02); } }
        .lk-card-icon { width:50px; height:50px; border-radius:12px; background:#d9d9d9; flex-shrink:0; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .lk-card-icon svg { width:28px; height:28px; }
        .lk-card-label { font-size:16px; font-weight:500; color:#111; flex:1; line-height:1.3; }
      `}</style>
      <div className="lk-root">
        <div style={{ width: '100%', maxWidth: 390, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              marginBottom: 14,
              background: '#ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img src="/Icon/Logo.png" alt="TicketHubh" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontSize: 19, fontWeight: 600, color: '#fff', marginBottom: 14, textAlign: 'center', lineHeight: 1.2 }}>
            TicketHubh
          </div>
          <div style={{ fontSize: 13, fontWeight: 400, color: '#fff', marginTop: -10, marginBottom: 20, textAlign: 'center' }}>
            Viva Mais, Pague Menos
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <SocialBtn href="https://tickethubbh.lovable.app" label="Site"><SiteIcon /></SocialBtn>
            <SocialBtn href="https://wa.me/5531984235225" label="WhatsApp"><WhatsAppIcon /></SocialBtn>
            <SocialBtn href="https://instagram.com/tickethubbh" label="Instagram"><InstagramIcon /></SocialBtn>
            <SocialBtn href="https://tiktok.com/@tickethubbh" label="TikTok"><TikTokIcon /></SocialBtn>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            <LinkCard href="https://tickethubbh.lovable.app" icon={<SiteIcon />} label="Site Oficial" />
            <LinkCard href="https://chat.whatsapp.com/" icon={<WhatsAppIcon />} label="Grupo de Descontos" />
            <LinkCard href="https://instagram.com/tickethubbh" icon={<InstagramIcon />} label="Instagram" />
            <LinkCard href="https://tiktok.com/@tickethubbh" icon={<TikTokIcon />} label="Tiktok" />
          </div>
        </div>
      </div>
    </>
  );
}
