import { NextResponse } from "next/server";
import { currentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { requireCampaignAccess } from "@/lib/authorization";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
 const session = await currentSession(); if (!session) return new NextResponse(null, { status: 401 }); const { id } = await params;
 const asset = await prisma.asset.findUnique({ where: { id }, include: { campaign: { include: { members: { where: { userId: session.userId }, select: { role: true, isActive: true } } } } } });
 if (!asset?.data) return new NextResponse(null, { status: 404 }); try { requireCampaignAccess({ campaignId: asset.campaignId, userId: session.userId, ownerId: asset.campaign.ownerId, membership: asset.campaign.members[0] }, "view"); } catch { return new NextResponse(null, { status: 403 }); }
 return new NextResponse(asset.data, { headers: { "Content-Type": asset.mimeType, "Cache-Control": "private, max-age=300" } });
}
