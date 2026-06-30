import compraSeguraIcon from '@/assets/icons/compra-segura.png';
import offConsuIcon from '@/assets/icons/off-consu.png';
import ingressoIcon from '@/assets/icons/ingresso.png';
import logoIcon from '@/assets/icons/logo.png';

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.92a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.35z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      {/* Top trust badges */}
      <div className="flex flex-wrap items-center justify-around gap-4 page-px py-5 border-b border-gray-100 max-md:gap-3 max-md:py-4">
        <div className="flex items-center gap-3 max-md:flex-1 max-md:min-w-[45%]">
          <img
            src={compraSeguraIcon}
            alt="Compra Segura"
            className="w-[70px] h-[70px] object-contain max-md:w-[48px] max-md:h-[48px]"
          />
          <span className="font-bold text-sm text-[#333] max-md:text-xs">Compra 100% Segura</span>
        </div>
        <div className="flex items-center gap-3 max-md:flex-1 max-md:min-w-[45%]">
          <img
            src={offConsuIcon}
            alt="OffConsu"
            className="w-[70px] h-[70px] object-contain max-md:w-[48px] max-md:h-[48px]"
          />
          <span className="font-bold text-sm text-[#333] max-md:text-xs">Ingressos e consumação de graça</span>
        </div>
        <div className="flex items-center gap-3 max-md:flex-1 max-md:min-w-[45%]">
          <img
            src={ingressoIcon}
            alt="Ingresso"
            className="w-[70px] h-[70px] object-contain max-md:w-[48px] max-md:h-[48px]"
          />
          <span className="font-bold text-sm text-[#333] max-md:text-xs">Ingresso mais barato</span>
        </div>
      </div>

      {/* Main columns */}
      <div className="grid grid-cols-4 gap-10 page-px py-12 max-md:grid-cols-1 max-md:gap-7 max-md:py-8 max-md:text-center">
        {/* Brand */}
        <div className="flex flex-col gap-3 max-md:items-center">
          <div className="flex items-center gap-2">
            <img src={logoIcon} alt="TicketHub" className="w-12 h-12 object-contain" />
            <span className="font-black text-xl tracking-wide text-[#1a3a6b]">TICKET HUB</span>
          </div>
          <p className="text-sm text-[#666] leading-relaxed max-w-[280px] max-md:text-[13px]">
            Descubra os melhores eventos, festas e shows de BH. Sua experiência começa aqui.
          </p>
        </div>

        {/* Links Úteis */}
        <div className="flex flex-col gap-3 max-md:items-center">
          <h4 className="font-black text-sm tracking-wider text-[#111] mb-1">LINKS ÚTEIS</h4>
          {["Sobre nós", "Dúvidas Frequentes", "Status dos Serviços", "Contato"].map((l) => (
            <a key={l} href="#" className="text-sm text-[#666] no-underline hover:text-[#4a90e2] transition-colors">
              {l}
            </a>
          ))}
        </div>

        {/* Informações Legais */}
        <div className="flex flex-col gap-3 max-md:items-center">
          <h4 className="font-black text-sm tracking-wider text-[#111] mb-1">INFORMAÇÕES LEGAIS</h4>
          {["Termos de uso", "Política de privacidade", "Política de cookies", "Política de reembolso"].map((l) => (
            <a key={l} href="#" className="text-sm text-[#666] no-underline hover:text-[#4a90e2] transition-colors">
              {l}
            </a>
          ))}
        </div>

        {/* Atendimento */}
        <div className="flex flex-col gap-3 max-md:items-center">
          <h4 className="font-black text-sm tracking-wider text-[#111] mb-1">ATENDIMENTO</h4>
          <p className="text-sm text-[#666] break-all max-md:break-normal">
            <span className="font-bold text-[#111]">WhatsApp</span> +55 (31) 98315-8818
          </p>
          <div className="flex items-center gap-3 mt-2">
            {[
              { icon: <InstagramIcon />, title: "Instagram", href: "#" },
              { icon: <WhatsAppIcon />, title: "WhatsApp", href: "https://chat.whatsapp.com/EGrwvkC1N8WJyfp9Rsb8LM" },
              { icon: <TikTokIcon />, title: "TikTok", href: "#" },
            ].map((s) => (
              <a key={s.title} href={s.href} title={s.title} className="text-[#555] no-underline" target="_blank" rel="noopener noreferrer">
                <div className="w-9 h-9 bg-[#eee] rounded-full flex items-center justify-center text-[#555] cursor-pointer transition-all hover:bg-[#4a90e2] hover:text-white">
                  {s.icon}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="flex items-center justify-center page-px py-5 border-t border-gray-100 text-center">
        <span className="text-xs text-[#aaa] md:text-sm">© 2026 Ticket Hub. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}
