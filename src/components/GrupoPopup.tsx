import { WhatsAppIcon } from '@/components/icons';

const GRUPO_URL = 'https://chat.whatsapp.com/EGrwvkC1N8WJyfp9Rsb8LM';

export default function GrupoPopup() {
  return (
    <a
      href={GRUPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-[9999] inline-flex items-center gap-2 px-5 py-3 bg-[#25d366] text-white rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.35)] text-sm font-bold no-underline hover:bg-[#1ebe5a] transition-colors btn-pulse"
      aria-label="Entrar no grupo exclusivo do WhatsApp"
    >
      <WhatsAppIcon className="w-5 h-5" />
      Entrar no grupo
    </a>
  );
}
