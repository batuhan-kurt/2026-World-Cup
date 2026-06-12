"use client";

/**
 * components/ui/LiveBadge.tsx
 * Canlı maç rozeti - yanıp sönen animasyon
 */
interface LiveBadgeProps {
  minute?: number | null;
  statusShort?: string;
  size?: "sm" | "md";
}

export function LiveBadge({ minute, statusShort, size = "md" }: LiveBadgeProps) {
  const isHalftime = statusShort === "HT";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-widest rounded-full ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{
        background: isHalftime
          ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
          : "linear-gradient(135deg, #FF3B30 0%, #FF6B35 100%)",
        boxShadow: isHalftime
          ? "0 0 12px rgba(245, 158, 11, 0.5)"
          : "0 0 12px rgba(255, 59, 48, 0.5)",
        color: "white",
      }}
    >
      {!isHalftime && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-white"
          style={{ animation: "pulse-live 1.5s ease-in-out infinite" }}
        />
      )}
      {isHalftime ? "Devre Arası" : minute ? `${minute}'` : "CANLI"}
    </span>
  );
}
