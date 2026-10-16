import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MasterShell } from "@/components/master-shell";
import { createCharacter } from "@/lib/campaign-service";
import { requireCampaignAccess } from "@/lib/authorization";
import { currentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createCharacterSchema } from "@/lib/validation";

export default async function NewCharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession(); if (!session) redirect("/entrar");
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: session.userId }, select: { role: true, isActive: true } } } });
  if (!campaign) notFound();
  requireCampaignAccess({ campaignId: id, userId: session.userId, ownerId: campaign.ownerId, membership: campaign.members[0] }, "manage");
  const users = await prisma.user.findMany({ where: { status: "ACTIVE" }, select: { id: true, username: true }, orderBy: { username: "asc" } });
  async function save(formData: FormData) { "use server"; const actor = await currentSession(); if (!actor) redirect("/entrar"); const parsed = createCharacterSchema.safeParse({ ownerUserId: formData.get("ownerUserId"), name: formData.get("name"), species: formData.get("species") || undefined, className: formData.get("className") || undefined, background: formData.get("background") || undefined, level: formData.get("level") }); if (!parsed.success) return; await createCharacter(actor.userId, id, parsed.data); redirect(`/campanhas/${id}/mestre/personagens`); }
  return <MasterShell campaignId={id} campaignName={campaign.name} active="personagens"><main className="main master-main"><div className="eyebrow">{campaign.name.toUpperCase()} / PERSONAGENS / NOVA FICHA</div><div className="workspace-heading"><div><h1>Nova Ficha</h1><p>Defina os dados iniciais e atribua o personagem ao jogador correto.</p></div><Link className="button secondary" href={`/campanhas/${id}/mestre/personagens`}>VOLTAR</Link></div><section className="sheet-form"><form action={save}><div className="form-grid"><label>Nome do personagem<input name="name" maxLength={120} required /></label><label>Jogador proprietário<select name="ownerUserId" required defaultValue=""><option value="" disabled>Selecione um usuário</option>{users.map((user) => <option value={user.id} key={user.id}>{user.username}</option>)}</select></label><label>Espécie<input name="species" maxLength={120} /></label><label>Classe<input name="className" maxLength={120} /></label><label>Antecedente<input name="background" maxLength={120} /></label><label>Nível<input name="level" type="number" min="1" max="20" defaultValue="1" required /></label></div><div className="form-actions"><Link className="button secondary" href={`/campanhas/${id}/mestre/personagens`}>CANCELAR</Link><button className="button" type="submit">CRIAR FICHA</button></div></form></section></main></MasterShell>;
}
