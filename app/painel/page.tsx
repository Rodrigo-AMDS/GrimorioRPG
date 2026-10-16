import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentSession, destroySession } from "@/lib/session";
import { createCampaignSchema } from "@/lib/validation";
import { createCampaign } from "@/lib/campaign-service";

export default async function Painel() {
  const session = await currentSession();
  if (!session) redirect("/entrar");
  const masterCampaigns = await prisma.campaign.findMany({ where: { OR: [{ ownerId: session.userId }, { members: { some: { userId: session.userId, role: "GM", isActive: true } } }] }, orderBy: { updatedAt: "desc" }, include: { _count: { select: { members: true } } } });
  if (masterCampaigns.length === 0) redirect("/jogador");
  async function newCampaign(formData: FormData) { "use server"; const user = await currentSession(); if (!user) redirect("/entrar"); const parsed = createCampaignSchema.safeParse({ name: formData.get("name"), description: formData.get("description") || undefined }); if (!parsed.success) return; const campaign = await createCampaign(user.userId, parsed.data); redirect(`/campanhas/${campaign.id}`); }
  async function logout() { "use server"; await destroySession(); redirect("/entrar"); }
  return <div className="library-page"><aside className="library-sidebar"><Link href="/painel" className="library-brand"><span>✦</span> O GRIMÓRIO<small>DO MESTRE</small></Link><div className="library-user"><span>GUARDIÃO DO ARQUIVO</span><strong>{session.username}</strong></div><form action={logout}><button className="library-logout">Encerrar jornada</button></form></aside><main className="library-main"><header className="library-header"><div><p className="library-rubric">ESTANTE PARTICULAR</p><h1>Biblioteca dos Mundos</h1></div><span className="library-count">{masterCampaigns.length.toString().padStart(2, "0")} GRIMÓRIOS</span></header><section className="campaign-shelf" aria-label="Campanhas do Mestre">{masterCampaigns.map((campaign, index) => <Link className="campaign-tome" key={campaign.id} href={`/campanhas/${campaign.id}`}><div className="tome-mark">{campaign.name.slice(0, 1).toUpperCase()}</div><div className="tome-content"><span>{campaign.status === "ACTIVE" ? "EM ANDAMENTO" : campaign.status === "DRAFT" ? "EM PREPARO" : "ARQUIVADA"}</span><h2>{campaign.name}</h2>{campaign.description && <p>{campaign.description}</p>}<footer><b>{campaign._count.members}</b> {campaign._count.members === 1 ? "alma vinculada" : "almas vinculadas"}<i>ABRIR →</i></footer></div><div className={`tome-spine tome-spine--${(index % 4) + 1}`} /></Link>)}<details className="new-campaign-sheet"><summary><span>+</span><b>Forjar um novo grimório</b></summary><form action={newCampaign}><label>Nome da campanha<input name="name" maxLength={160} placeholder="Ex.: As Cinzas de Valdora" required /></label><label>Breve registro <small>opcional</small><textarea name="description" maxLength={10000} placeholder="Uma frase para reconhecer este mundo." /></label><button className="button library-create" type="submit">CRIAR CAMPANHA <span>→</span></button></form></details></section></main></div>;
}
