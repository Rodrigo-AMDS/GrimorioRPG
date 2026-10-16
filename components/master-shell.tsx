import Link from "next/link";

export const masterSections = [
  ["comando", "▣", "Centro de Comando"],
  ["personagens", "♙", "Personagens"],
  ["bestiario", "♜", "Bestiário"],
  ["arsenal", "⚔", "Arsenal"],
  ["cartografia", "◇", "Cartografia"],
  ["cronicas", "▤", "Crônicas"],
  ["sessoes", "◷", "Sessões"],
  ["configuracoes", "⚙", "Configurações"]
] as const;

type MasterShellProps = { campaignId: string; campaignName: string; active: string; children: React.ReactNode };

export function MasterShell({ campaignId, campaignName, active, children }: MasterShellProps) {
  return <div className="shell"><aside className="sidebar master-sidebar"><Link href="/painel" className="brand">✦ O GRIMÓRIO</Link><div className="role">DO MESTRE</div><nav className="nav"><Link href="/painel">⌂&nbsp;&nbsp; Biblioteca</Link>{masterSections.filter(([slug]) => slug !== "comando").map(([slug, icon, label]) => <Link key={slug} className={active === slug ? "active" : ""} href={`/campanhas/${campaignId}/mestre/${slug}`}>{icon}&nbsp;&nbsp; {label}</Link>)}</nav><div className="sidebar-footer">MESTRE • ADMINISTRADOR<br /><span>{campaignName}</span></div></aside>{children}</div>;
}
