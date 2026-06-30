interface Props {
  message: string;
  onRetry: () => void;
  className?: string;
}

export default function LoadErrorRetry({ message, onRetry, className }: Props) {
  return (
    <div className={`flex flex-col items-center gap-3 py-10 text-center ${className ?? ''}`}>
      <p className="text-[#666] text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="px-5 py-[9px] bg-[#1a3a6b] text-white rounded-lg text-[13px] font-bold cursor-pointer hover:bg-[#4a90e2] transition-colors btn-pulse"
      >
        Tentar novamente
      </button>
    </div>
  );
}
