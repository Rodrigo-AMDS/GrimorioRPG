"use client";

import { useState } from "react";

const tabs = [
  ["identity", "01", "Identidade"],
  ["condition", "02", "Condição"],
  ["equipment", "03", "Equipamento"],
  ["features", "04", "Habilidades"]
] as const;

export function SheetTabShell({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<(typeof tabs)[number][0]>("identity");
  return <div className="sheet-tab-shell" data-active-tab={active}><nav className="sheet-tabs" aria-label="Seções da ficha">{tabs.map(([key, number, label]) => <button key={key} type="button" className={active === key ? "active" : ""} onClick={() => setActive(key)}><span>{number}</span>{label}</button>)}</nav><div className="sheet-tab-pages">{children}</div></div>;
}
