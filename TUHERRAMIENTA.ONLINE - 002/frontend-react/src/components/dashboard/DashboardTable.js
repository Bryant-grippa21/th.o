import React from 'react';

export default function DashboardTable({ title, columns = [], rows = [] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {title ? <h3 className="border-b border-slate-100 px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-slate-700">{title}</h3> : null}
      <div className="max-h-[640px] overflow-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#1B3149] text-white">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-xs font-black uppercase tracking-wide">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-100 odd:bg-white even:bg-slate-50">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 font-semibold text-slate-700">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
