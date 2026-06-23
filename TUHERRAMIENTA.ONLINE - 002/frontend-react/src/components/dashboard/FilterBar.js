import React from 'react';

export function FilterBar({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}

export function FilterField({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
      {label}
      {children}
    </label>
  );
}

export function SearchFilter({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#1B3149]"
    />
  );
}

export function SelectFilter({ value, onChange, options = [], placeholder = 'Todos' }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#1B3149]"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value || option} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
  );
}
