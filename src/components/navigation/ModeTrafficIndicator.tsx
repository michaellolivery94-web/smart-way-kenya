import { User, Zap } from "lucide-react";
import type { ModeIndicator } from "@/lib/modeGuidance";

const TONE: Record<ModeIndicator["tone"], { text: string; bg: string; dot: string }> = {
  good: { text: "text-success", bg: "bg-success/10 border-success/30", dot: "bg-success" },
  watch: { text: "text-warning", bg: "bg-warning/10 border-warning/30", dot: "bg-warning" },
  bad: { text: "text-destructive", bg: "bg-destructive/10 border-destructive/30", dot: "bg-destructive" },
};

interface Props {
  indicator: ModeIndicator;
  compact?: boolean;
}

/** Traffic read-out phrased for one navigation mode. */
export const ModeTrafficIndicator = ({ indicator, compact = false }: Props) => {
  const tone = TONE[indicator.tone];
  const Icon = indicator.mode === "commuter" ? User : Zap;
  const accent = indicator.mode === "commuter" ? "text-info" : "text-purple-500";

  return (
    <div className={`rounded-lg border p-3 ${tone.bg}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
          <Icon className={`w-3.5 h-3.5 ${accent}`} aria-hidden="true" />
          {indicator.title}
        </span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${tone.text}`}>
          <span className={`w-2 h-2 rounded-full ${tone.dot}`} aria-hidden="true" />
          {indicator.verdict}
        </span>
      </div>

      <p className={`mt-2 text-muted-foreground leading-snug ${compact ? "text-[11px]" : "text-xs"}`}>
        {indicator.guidance}
      </p>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {indicator.metrics.map((m) => (
          <span key={m.label} className="text-[11px] text-muted-foreground">
            {m.label}: <span className="font-semibold text-foreground">{m.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
