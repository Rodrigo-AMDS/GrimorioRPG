import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MasterShell, masterSections } from "@/components/master-shell";
import { canManageCampaign, requireCampaignAccess } from "@/lib/authorization";
import { currentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Section = (typeof masterSections)[number][0];
const titles: Record<Section, { title: string; description: string }> = {
  comando: { title: "Centro de Comando", description: "Prepare o próximo capítulo e mantenha o controle da sua campanha." },
  personagens: { title: "Personagens", description: "Gerencie fichas, vínculos e recursos dos aventureiros." },
  bestiario: { title: "Bestiário", description: "Organize criaturas, encontros e referências para as sessões." },
  arsenal: { title: "Arsenal", description: "Cadastre itens, imagens, documentos, efeitos e permissões." },
  cartografia: { title: "Cartografia", description: "Prepare mapas, camadas, tokens e névoa manual." },
  cronicas: { title: "Crônicas", description: "Mantenha a narrativa, as pistas e a Teia do Destino privadas." },
  sessoes: { title: "Sessões", description: "Planeje, inicie e registre cada sessão da campanha." },
  configuracoes: { title: "Configurações", description: "Administre participantes, papéis e preferências da campanha." }
};

function EmptyPanel({ title, text, action, actionHref }: { title: string; text: string; action: string; actionHref?: string }) {
  return <section className="workspace-empty"><div className="rune">✦</div><h2>{title}</h2><p>{text}</p>{actionHref ? <Link className="button" href={actionHref}>{action}</Link> : <button className="button" type="button">{action}</button>}</section>;
}

export default async function MasterSectionPage({ params }: { params: Promise<{ id: string; section: string }> }) {
  const session = await currentSession(); if (!session) redirect("/entrar");
  const { id, section: rawSection } = await params;
  if (!masterSections.some(([slug]) => slug === rawSection)) notFound();
  const section = rawSection as Section;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      members: { where: { userId: session.userId }, select: { role: true, isActive: true } },
      _count: { select: { characters: true, itemTemplates: true, maps: true, sessions: true, narrativeNodes: true } }
    }
  });
  if (!campaign) notFound();
  const access = { campaignId: campaign.id, userId: session.userId, ownerId: campaign.ownerId, membership: campaign.members[0] };
  requireCampaignAccess(access, "manage");
  if (!canManageCampaign(access)) notFound();
  const copy = titles[section];
  const members = section === "configuracoes" ? await prisma.campaignMember.findMany({ where: { campaignId: id }, include: { user: { select: { username: true, status: true } } }, orderBy: { joinedAt: "asc" } }) : [];
  const latestSessions = section === "comando" || section === "sessoes" ? await prisma.session.findMany({ where: { campaignId: id }, take: 4, orderBy: { startedAt: "desc" } }) : [];
  const items = section === "arsenal" ? await prisma.itemTemplate.findMany({ where: { campaignId: id }, take: 8, orderBy: { name: "asc" } }) : [];
  const maps = section === "cartografia" ? await prisma.gameMap.findMany({ where: { campaignId: id }, take: 8, orderBy: { name: "asc" } }) : [];
  const characters = section === "personagens" ? await prisma.character.findMany({ where: { campaignId: id }, take: 12, orderBy: { name: "asc" } }) : [];
  const nodes = section === "cronicas" ? await prisma.narrativeNode.findMany({ where: { campaignId: id }, take: 10, orderBy: { title: "asc" } }) : [];

  return <MasterShell campaignId={id} campaignName={campaign.name} active={section}><main className="main master-main"><div className="eyebrow">{campaign.name.toUpperCase()} / {copy.title.toUpperCase()}</div><div className="workspace-heading"><div><h1>{copy.title}</h1><p>{copy.description}</p></div>{section === "comando" && <Link className="button" href={`/campanhas/${id}/mestre/sessoes`}>INICIAR SESSÃO ▶</Link>}</div>{section === "comando" && <CommandContent id={id} counts={campaign._count} sessions={latestSessions} />}{section === "personagens" && <CollectionContent title="FICHAS DA CAMPANHA" empty="Nenhum personagem foi vinculado a esta campanha." action="NOVA FICHA" actionHref={`/campanhas/${id}/mestre/personagens/novo`} entries={characters.map((character) => ({ title: character.name, meta: `${character.className || "Classe pendente"} · Nível ${character.level}`, tag: character.species || "SEM ESPÉCIE", href: `/campanhas/${id}/mestre/personagens/${character.id}` }))} />}{section === "bestiario" && <EmptyPanel title="Bestiário em preparação" text="A base de encontros já está pronta no banco. O editor de criaturas será conectado a ela no próximo incremento." action="CRIAR CRIATURA" />}{section === "arsenal" && <CollectionContent title="CATÁLOGO DO MESTRE" empty="Cadastre o primeiro item do Arsenal para começar." action="NOVO ITEM" entries={items.map((item) => ({ title: item.name, meta: item.description || "Sem descrição", tag: item.rarity || "COMUM" }))} />}{section === "cartografia" && <CollectionContent title="MAPAS DA CAMPANHA" empty="Ainda não há mapas. Apenas versões publicadas poderão chegar aos jogadores." action="IMPORTAR MAPA" entries={maps.map((map) => ({ title: map.name, meta: "Névoa manual e tokens independentes", tag: map.status }))} />}{section === "cronicas" && <ChroniclesContent nodes={nodes.map((node) => ({ title: node.title, meta: node.kind, tag: node.visibility }))} />}{section === "sessoes" && <SessionsContent sessions={latestSessions.map((item) => ({ title: item.title || "Sessão sem título", meta: item.startedAt ? `Iniciada em ${item.startedAt.toLocaleDateString("pt-BR")}` : "Ainda não iniciada", tag: item.status }))} />}{section === "configuracoes" && <MembersContent campaignId={id} members={members.map((member) => ({ username: member.user.username, role: member.role, active: member.isActive && member.user.status === "ACTIVE" }))} />}</main></MasterShell>;
}

function CommandContent({ id, counts, sessions }: { id: string; counts: { characters: number; itemTemplates: number; maps: number; sessions: number; narrativeNodes: number }; sessions: { id: string; title: string | null; status: string }[] }) {
  return <><section className="command-callout"><div><div className="eyebrow">PRÓXIMO CAPÍTULO</div><h2>{sessions[0]?.title || "Nenhuma sessão agendada"}</h2><p>{sessions[0] ? "Retome a preparação ou inicie a sessão quando a mesa estiver pronta." : "Crie uma sessão para preparar a mesa, os dados e o registro de eventos."}</p></div><Link className="button secondary" href={`/campanhas/${id}/mestre/sessoes`}>GERENCIAR SESSÕES</Link></section><section className="metric-grid">{[["Personagens", counts.characters, "personagens"], ["Itens", counts.itemTemplates, "arsenal"], ["Mapas", counts.maps, "cartografia"], ["Crônicas", counts.narrativeNodes, "cronicas"]].map(([label, value, target]) => <Link className="metric-card" key={String(label)} href={`/campanhas/${id}/mestre/${target}`}><span>{label}</span><strong>{String(value).padStart(2, "0")}</strong><small>abrir módulo →</small></Link>)}</section></>;
}

type Entry = { title: string; meta: string; tag: string; href?: string };
function CollectionContent({ title, empty, action, actionHref, entries }: { title: string; empty: string; action: string; actionHref?: string; entries: Entry[] }) { const actionControl = actionHref ? <Link className="button" href={actionHref}>{action}</Link> : <button className="button" type="button">{action}</button>; return <section className="workspace-panel"><div className="toolbar"><h2>{title}</h2>{actionControl}</div>{entries.length ? <div className="workspace-grid">{entries.map((entry) => entry.href ? <Link className="workspace-card" href={entry.href} key={entry.title}><div className="status">{entry.tag}</div><h3>{entry.title}</h3><p>{entry.meta}</p><small>editar ficha →</small></Link> : <article className="workspace-card" key={entry.title}><div className="status">{entry.tag}</div><h3>{entry.title}</h3><p>{entry.meta}</p></article>)}</div> : <EmptyPanel title="Ainda está vazio" text={empty} action={action} actionHref={actionHref} />}</section>; }
function ChroniclesContent({ nodes }: { nodes: Entry[] }) { return <section className="chronicles-layout"><div className="workspace-panel"><div className="toolbar"><h2>TEIA DO DESTINO</h2><button className="button" type="button">NOVO NÓ</button></div><div className="destiny-canvas">{nodes.length ? nodes.map((node) => <article className="destiny-node" key={node.title}><b>{node.title}</b><span>{node.meta}</span></article>) : <p>O grafo privado será montado aqui. Publicações para jogadores exigirão uma ação explícita.</p>}</div></div><aside className="workspace-panel"><h2>ARQUIVO</h2><p>Segredos, relações, pistas e facções ficam sob controle do Mestre.</p><button className="button secondary" type="button">NOVA CRÔNICA</button></aside></section>; }
function SessionsContent({ sessions }: { sessions: Entry[] }) { return <CollectionContent title="REGISTRO DE SESSÕES" empty="Planeje a primeira sessão para abrir a mesa ao vivo." action="NOVA SESSÃO" entries={sessions} />; }
function MembersContent({ campaignId, members }: { campaignId: string; members: { username: string; role: string; active: boolean }[] }) { return <section className="workspace-panel"><div className="toolbar"><h2>PARTICIPANTES</h2><Link className="button" href={`/campanhas/${campaignId}`}>GERENCIAR JOGADORES</Link></div><div className="members-list">{members.map((member) => <div className="member-row" key={member.username}><div><b>{member.username}</b><span>{member.role === "GM" ? "Mestre" : "Jogador"}</span></div><span className="status">{member.active ? "ATIVO" : "INATIVO"}</span></div>)}</div></section>; }
