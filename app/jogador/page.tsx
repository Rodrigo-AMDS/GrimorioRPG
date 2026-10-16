import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession, destroySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AreaJogador() {
  const session = await currentSession(); if (!session) redirect("/entrar");
  const campaigns = await prisma.campaign.findMany({ where: { members: { some: { userId: session.userId, role: "PLAYER", isActive: true } } }, orderBy: { updatedAt: "desc" } });
  async function logout() { "use server"; await destroySession(); redirect("/entrar"); }
  return <main className="player-page"><p className="library-rubric">SEUS MUNDOS</p><h1>Jornadas</h1><section className="player-campaigns">{campaigns.map(campaign => <Link key={campaign.id} href={`/campanhas/${campaign.id}`}>{campaign.name}</Link>)}</section><form action={logout}><button className="library-logout">Encerrar jornada</button></form></main>;
}
