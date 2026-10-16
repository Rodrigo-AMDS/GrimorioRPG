import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canManageCampaign, requireCampaignAccess } from "@/lib/authorization";
import { addPlayerToCampaign } from "@/lib/campaign-service";
import { createPlayerAccount } from "@/lib/auth-service";
import { currentSession } from "@/lib/session";
import { addPlayerSchema, createAccountSchema } from "@/lib/validation";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession(); if (!session) redirect("/entrar");
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: {
            select: {
              username: true,
              status: true,
              characters: { where: { campaignId: id }, select: { id: true, name: true } }
            }
          }
        },
        orderBy: { joinedAt: "asc" }
      }
    }
  });
  if (!campaign) notFound();
  const membership = campaign.members.find((member) => member.userId === session.userId);
  const access = { campaignId: campaign.id, userId: session.userId, ownerId: campaign.ownerId, membership };
  requireCampaignAccess(access, "view");
  const mayManage = canManageCampaign(access);
  const players = campaign.members.filter(member => member.role === "PLAYER");
  async function addPlayer(formData: FormData) { "use server"; const user = await currentSession(); if (!user) redirect("/entrar"); const parsed = addPlayerSchema.safeParse({ username: formData.get("username") }); if (!parsed.success) return; await addPlayerToCampaign(user.userId, id, parsed.data.username); redirect(`/campanhas/${id}`); }
  async function createAccount(formData: FormData) { "use server"; const user = await currentSession(); if (!user) redirect("/entrar"); const parsed = createAccountSchema.safeParse({ username: formData.get("username"), password: formData.get("password") }); if (!parsed.success) return; await createPlayerAccount(user.userId, id, parsed.data); redirect(`/campanhas/${id}`); }

  if (!mayManage) return <main className="player-page"><p className="library-rubric">CAMPANHA</p><h1>{campaign.name}</h1><Link className="button" href="/jogador">VOLTAR ÀS JORNADAS</Link></main>;

  return <div className="campaign-archive"><aside className="campaign-rail"><Link href="/painel" className="library-brand"><span>✦</span> O GRIMÓRIO<small>DO MESTRE</small></Link><nav><Link href="/painel">Biblioteca</Link><span>Arquivo de aventureiros</span><Link href={`/campanhas/${id}/mestre/bestiario`}>Bestiário</Link><Link href={`/campanhas/${id}/mestre/arsenal`}>Arsenal</Link><Link href={`/campanhas/${id}/mestre/cartografia`}>Cartografia</Link><Link href={`/campanhas/${id}/mestre/cronicas`}>Crônicas</Link><Link href={`/campanhas/${id}/mestre/sessoes`}>Sessões</Link><Link href={`/campanhas/${id}/mestre/configuracoes`}>Configurações</Link></nav></aside><main className="archive-main"><header className="archive-header"><div><p className="library-rubric">CAMPANHA ATIVA</p><h1>{campaign.name}</h1></div><span>{players.length.toString().padStart(2, "0")} AVENTUREIROS</span></header><section className="adventurer-grid" aria-label="Jogadores da campanha">{players.map((member, index) => { const character = member.user.characters[0]; const href = character ? `/campanhas/${id}/mestre/personagens/${character.id}` : `/campanhas/${id}/mestre/personagens/novo`; return <Link href={href} prefetch={Boolean(character)} className="adventurer-card" key={member.id}><div className={`adventurer-sigil sigil-${(index % 4) + 1}`}>{member.user.username.slice(0, 1).toUpperCase()}</div><div><span>AVENTUREIRO</span><h2>{member.user.username}</h2><p>{character ? character.name : "Ficha ainda não forjada"}</p></div><i>{character ? "VER FICHA →" : "CRIAR FICHA →"}</i></Link>; })}<details className="adventurer-add"><summary><span>+</span><b>Vincular aventureiro</b></summary><div className="adventurer-forms"><form action={addPlayer}><p>CONTA JÁ EXISTENTE</p><label>Nome de usuário<input name="username" required /></label><button className="button" type="submit">VINCULAR</button></form><form action={createAccount}><p>NOVO AVENTUREIRO</p><label>Nome de usuário<input name="username" required /></label><label>Senha inicial<input name="password" type="password" minLength={12} required /></label><button className="button" type="submit">CADASTRAR E VINCULAR</button></form></div></details></section></main></div>;
}
