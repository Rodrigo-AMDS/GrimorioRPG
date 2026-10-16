import { prisma } from "@/lib/prisma";
import { requireCampaignAccess } from "@/lib/authorization";
import { Prisma } from "@prisma/client";

export async function createCampaign(ownerId: string, input: { name: string; description?: string }) {
  return prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.create({ data: { ...input, ownerId, status: "DRAFT" } });
    await tx.campaignMember.create({ data: { campaignId: campaign.id, userId: ownerId, role: "GM" } });
    await tx.auditEvent.create({ data: { campaignId: campaign.id, actorUserId: ownerId, entityType: "Campaign", entityId: campaign.id, action: "CAMPAIGN_CREATED", afterData: { name: campaign.name } } });
    return campaign;
  });
}

export async function addPlayerToCampaign(actorId: string, campaignId: string, username: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { members: { where: { userId: actorId }, select: { role: true, isActive: true } } }
  });
  if (!campaign) throw new Error("CAMPAIGN_NOT_FOUND");
  requireCampaignAccess({ campaignId, userId: actorId, ownerId: campaign.ownerId, membership: campaign.members[0] }, "manage");
  const player = await prisma.user.findUnique({ where: { username }, select: { id: true, status: true } });
  if (!player || player.status !== "ACTIVE") throw new Error("PLAYER_NOT_AVAILABLE");
  return prisma.campaignMember.upsert({
    where: { campaignId_userId: { campaignId, userId: player.id } },
    create: { campaignId, userId: player.id, role: "PLAYER" },
    update: { role: "PLAYER", isActive: true }
  });
}

export async function createCharacter(actorId: string, campaignId: string, input: { ownerUserId: string; name: string; species?: string; className?: string; background?: string; level: number }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { members: { where: { userId: actorId }, select: { role: true, isActive: true } } }
  });
  if (!campaign) throw new Error("CAMPAIGN_NOT_FOUND");
  requireCampaignAccess({ campaignId, userId: actorId, ownerId: campaign.ownerId, membership: campaign.members[0] }, "manage");
  const owner = await prisma.user.findUnique({ where: { id: input.ownerUserId }, select: { id: true, status: true } });
  if (!owner || owner.status !== "ACTIVE") throw new Error("CHARACTER_OWNER_NOT_AVAILABLE");
  return prisma.$transaction(async (tx) => {
    await tx.campaignMember.upsert({
      where: { campaignId_userId: { campaignId, userId: owner.id } },
      create: { campaignId, userId: owner.id, role: "PLAYER" },
      update: { isActive: true }
    });
    const character = await tx.character.create({ data: { ...input, campaignId } });
    await tx.auditEvent.create({ data: { campaignId, actorUserId: actorId, entityType: "Character", entityId: character.id, action: "CHARACTER_CREATED", afterData: { name: character.name, ownerUserId: character.ownerUserId } } });
    return character;
  });
}

export async function updateCharacter(actorId: string, campaignId: string, characterId: string, input: { ownerUserId: string; name: string; species?: string; className?: string; background?: string; level: number; baseStats: Record<string, number>; overrides?: Prisma.InputJsonValue; features: { name: string; description?: string; source?: string; uses?: number | null; maxUses?: number | null }[] }) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }, include: { members: { where: { userId: actorId }, select: { role: true, isActive: true } } } });
  if (!campaign) throw new Error("CAMPAIGN_NOT_FOUND");
  requireCampaignAccess({ campaignId, userId: actorId, ownerId: campaign.ownerId, membership: campaign.members[0] }, "manage");
  const [character, owner] = await Promise.all([
    prisma.character.findFirst({ where: { id: characterId, campaignId }, select: { id: true } }),
    prisma.user.findUnique({ where: { id: input.ownerUserId }, select: { id: true, status: true } })
  ]);
  if (!character) throw new Error("CHARACTER_NOT_FOUND");
  if (!owner || owner.status !== "ACTIVE") throw new Error("CHARACTER_OWNER_NOT_AVAILABLE");
  return prisma.$transaction(async (tx) => {
    await tx.campaignMember.upsert({ where: { campaignId_userId: { campaignId, userId: owner.id } }, create: { campaignId, userId: owner.id, role: "PLAYER" }, update: { isActive: true } });
    await tx.characterFeature.deleteMany({ where: { characterId } });
    const updated = await tx.character.update({ where: { id: characterId }, data: { ownerUserId: owner.id, name: input.name, species: input.species, className: input.className, background: input.background, level: input.level, baseStats: input.baseStats, overrides: input.overrides ?? {}, features: { create: input.features.map((feature, sortOrder) => ({ ...feature, sortOrder })) } } });
    await tx.auditEvent.create({ data: { campaignId, actorUserId: actorId, entityType: "Character", entityId: characterId, action: "CHARACTER_UPDATED", afterData: { name: updated.name, ownerUserId: updated.ownerUserId } } });
    return updated;
  });
}
