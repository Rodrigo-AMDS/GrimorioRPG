import { prisma } from "@/lib/prisma";
import { requireCampaignAccess } from "@/lib/authorization";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function authenticate(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.status !== "ACTIVE" || !(await verifyPassword(password, user.passwordHash))) return null;
  return { userId: user.id, username: user.username };
}

export async function createPlayerAccount(actorId: string, campaignId: string, input: { username: string; password: string }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { members: { where: { userId: actorId }, select: { role: true, isActive: true } } }
  });
  if (!campaign) throw new Error("CAMPAIGN_NOT_FOUND");
  requireCampaignAccess({ campaignId, userId: actorId, ownerId: campaign.ownerId, membership: campaign.members[0] }, "manage");
  return prisma.$transaction(async (tx) => {
    const passwordHash = await hashPassword(input.password);
    const player = await tx.user.create({ data: { username: input.username, passwordHash } });
    await tx.campaignMember.create({ data: { campaignId, userId: player.id, role: "PLAYER" } });
    await tx.auditEvent.create({ data: { campaignId, actorUserId: actorId, entityType: "User", entityId: player.id, action: "PLAYER_ACCOUNT_CREATED", afterData: { username: player.username } } });
    return player;
  });
}
