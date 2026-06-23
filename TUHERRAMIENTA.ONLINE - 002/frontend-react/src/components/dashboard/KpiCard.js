import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const toneStyles = {
  default: { background: '#FFFFFF', border: 'rgba(9,26,45,0.10)', icon: '#1B3149' },
  success: { background: '#E6F7F2', border: '#BFE8DB', icon: '#0F766E' },
  warning: { background: '#FFF8D9', border: '#F5E7A3', icon: '#B7791F' },
  danger: { background: '#FDECEC', border: '#F6C8C8', icon: '#B42318' },
  info: { background: '#EAF4FF', border: '#BFD9FF', icon: '#1B3149' },
};

export default function KpiCard({
  title,
  value,
  detail,
  icon,
  formula = 'Pendiente de documentar.',
  purpose = 'Permite entender el comportamiento del indicador seleccionado.',
  tone = 'default',
}) {
  const [open, setOpen] = useState(false);
  const style = toneStyles[tone] || toneStyles.default;

  return (
    <article
      className="rounded-2xl border p-4 shadow-sm"
      style={{ background: style.background, borderColor: style.border }}
    >
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
        <h3 className="min-w-0 text-xs font-black uppercase tracking-[0.16em] text-slate-800">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-900 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          Fórmula
        </button>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80" style={{ color: style.icon }}>
          {icon}
        </div>
      </div>

      <div className="mt-4 text-3xl font-black leading-tight text-slate-950">{value}</div>
      {detail ? <p className="mt-1 text-sm font-semibold text-slate-600">{detail}</p> : null}

      {open ? (
        <div className="mt-4 rounded-xl border border-slate-700 bg-[#091A2D] p-3 text-white shadow-inner">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#FEDC00]">Cómo se calcula</p>
          <p className="mt-1 text-sm leading-relaxed text-white">{formula}</p>
          <p className="mt-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#FEDC00]">Para qué sirve</p>
          <p className="mt-1 text-sm leading-relaxed text-white/90">{purpose}</p>
        </div>
      ) : null}
    </article>
  );
}
