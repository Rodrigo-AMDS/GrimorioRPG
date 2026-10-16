import { createHash, randomUUID } from "crypto";
import { InventoryItemKind, Prisma } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArsenalForge } from "@/components/arsenal-forge";
import { MasterShell } from "@/components/master-shell";
import { requireCampaignAccess } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { currentSession } from "@/lib/session";

const kinds = new Set(Object.values(InventoryItemKind));
const text = (data: FormData, key: string) => String(data.get(key) || "").trim();
const kindLabel: Record<InventoryItemKind, string> = { WEAPON: "Arma", ARMOR: "Armadura", GEAR: "Equipamento", DOCUMENT: "Documento", CONSUMABLE: "Consumível", TREASURE: "Tesouro" };

export default async function Arsenal({ params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession(); if (!session) redirect("/entrar");
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: session.userId }, select: { role: true, isActive: true } } } });
  if (!campaign) notFound();
  requireCampaignAccess({ campaignId: id, userId: session.userId, ownerId: campaign.ownerId, membership: campaign.members[0] }, "manage");
  const items = await prisma.itemTemplate.findMany({ where: { campaignId: id }, include: { image: { select: { id: true } } }, orderBy: { name: "asc" } });

  async function createItem(formData: FormData) {
    "use server";
    const actor = await currentSession(); if (!actor) redirect("/entrar");
    const name = text(formData, "name");
    const kind = text(formData, "kind") as InventoryItemKind;
    if (!name || name.length > 160 || !kinds.has(kind)) return;
    const accessCampaign = await prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: actor.userId }, select: { role: true, isActive: true } } } });
    if (!accessCampaign) notFound();
    requireCampaignAccess({ campaignId: id, userId: actor.userId, ownerId: accessCampaign.ownerId, membership: accessCampaign.members[0] }, "manage");
    const config = { slot: text(formData, "slot") || null, capacity: Number(text(formData, "capacity")) || null, damage: text(formData, "damage") || null, damageType: text(formData, "damageType") || null, properties: text(formData, "properties") || null, armorClass: Number(text(formData, "armorClass")) || null, charges: Number(text(formData, "charges")) || null, useEffect: text(formData, "useEffect") || null, effectDescription: text(formData, "effectDescription") || null };
    const image = formData.get("image"); let imageAssetId: string | undefined;
    if (image instanceof File && image.size > 0) {
      if (image.size > 5_000_000 || !["image/png", "image/jpeg", "image/webp"].includes(image.type)) return;
      const bytes = Buffer.from(await image.arrayBuffer());
      const asset = await prisma.asset.create({ data: { campaignId: id, uploadedById: actor.userId, storageKey: `arsenal/${id}/${randomUUID()}`, mimeType: image.type, sizeBytes: BigInt(bytes.length), checksum: createHash("sha256").update(bytes).digest("hex"), originalName: image.name || null, data: bytes } });
      imageAssetId = asset.id;
    }
    await prisma.itemTemplate.create({ data: { campaignId: id, name, kind, rarity: text(formData, "rarity") || "Comum", description: text(formData, "description") || null, imageAssetId, effectsConfig: config as Prisma.InputJsonValue } });
    revalidatePath(`/campanhas/${id}/mestre/arsenal`);
  }

  async function updateItem(formData: FormData) {
    "use server";
    const actor = await currentSession(); if (!actor) redirect("/entrar");
    const itemId = text(formData, "itemId"); const name = text(formData, "name"); const kind = text(formData, "kind") as InventoryItemKind;
    if (!itemId || !name || name.length > 160 || !kinds.has(kind)) return;
    const accessCampaign = await prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: actor.userId }, select: { role: true, isActive: true } } } });
    if (!accessCampaign) notFound();
    requireCampaignAccess({ campaignId: id, userId: actor.userId, ownerId: accessCampaign.ownerId, membership: accessCampaign.members[0] }, "manage");
    const existing = await prisma.itemTemplate.findFirst({ where: { id: itemId, campaignId: id }, select: { id: true } }); if (!existing) return;
    const config = { slot: text(formData, "slot") || null, capacity: Number(text(formData, "capacity")) || null, damage: text(formData, "damage") || null, damageType: text(formData, "damageType") || null, properties: text(formData, "properties") || null, armorClass: Number(text(formData, "armorClass")) || null, charges: Number(text(formData, "charges")) || null, useEffect: text(formData, "useEffect") || null, effectDescription: text(formData, "effectDescription") || null };
    const image = formData.get("image"); let imageAssetId: string | undefined;
    if (image instanceof File && image.size > 0) { if (image.size > 5_000_000 || !["image/png", "image/jpeg", "image/webp"].includes(image.type)) return; const bytes = Buffer.from(await image.arrayBuffer()); const asset = await prisma.asset.create({ data: { campaignId: id, uploadedById: actor.userId, storageKey: `arsenal/${id}/${randomUUID()}`, mimeType: image.type, sizeBytes: BigInt(bytes.length), checksum: createHash("sha256").update(bytes).digest("hex"), originalName: image.name || null, data: bytes } }); imageAssetId = asset.id; }
    await prisma.itemTemplate.update({ where: { id: existing.id }, data: { name, kind, rarity: text(formData, "rarity") || "Comum", description: text(formData, "description") || null, effectsConfig: config as Prisma.InputJsonValue, ...(imageAssetId ? { imageAssetId } : {}) } });
    revalidatePath(`/campanhas/${id}/mestre/arsenal`); revalidatePath(`/campanhas/${id}/mestre/personagens`);
  }

  async function deleteItem(formData: FormData) {
    "use server";
    const actor = await currentSession(); if (!actor) redirect("/entrar"); const itemId = text(formData, "itemId"); if (!itemId) return;
    const accessCampaign = await prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: actor.userId }, select: { role: true, isActive: true } } } }); if (!accessCampaign) notFound(); requireCampaignAccess({ campaignId: id, userId: actor.userId, ownerId: accessCampaign.ownerId, membership: accessCampaign.members[0] }, "manage");
    const item = await prisma.itemTemplate.findFirst({ where: { id: itemId, campaignId: id }, select: { id: true } }); if (!item) return;
    await prisma.$transaction([prisma.itemAttachment.deleteMany({ where: { itemTemplateId: item.id } }), prisma.itemInstance.deleteMany({ where: { templateId: item.id } }), prisma.itemTemplate.delete({ where: { id: item.id } })]);
    revalidatePath(`/campanhas/${id}/mestre/arsenal`); revalidatePath(`/campanhas/${id}/mestre/personagens`);
  }

  return <MasterShell campaignId={id} campaignName={campaign.name} active="arsenal"><main className="main master-main"><section className="arsenal-workbench"><div className="arsenal-hero"><div><h1>Acervo da campanha</h1><p>Forje uma vez. Distribua para qualquer aventureiro.</p></div><ArsenalForge action={createItem} /></div><section className="arsenal-catalog" aria-label="Itens criados">{items.length ? items.map((item) => <article key={item.id} className="arsenal-item">{item.image ? <img src={`/api/assets/${item.image.id}`} alt="" /> : <span>{item.kind === "WEAPON" ? "⚔" : item.kind === "DOCUMENT" ? "✉" : item.kind === "CONSUMABLE" ? "⚗" : "✦"}</span>}<div><small>{kindLabel[item.kind]} · {item.rarity || "COMUM"}</small><h2>{item.name}</h2><p>{item.description || "Sem descrição."}</p><ArsenalForge action={updateItem} deleteAction={deleteItem} item={{ id: item.id, name: item.name, kind: item.kind, rarity: item.rarity, description: item.description, imageId: item.image?.id || null, config: item.effectsConfig && typeof item.effectsConfig === "object" && !Array.isArray(item.effectsConfig) ? item.effectsConfig as Record<string, unknown> : {} }} /></div><b className="arsenal-rune">✦</b></article>) : <div className="arsenal-empty"><span>✦</span><h2>Seu acervo está vazio</h2><p>Crie a primeira relíquia, arma, poção ou documento da campanha.</p></div>}</section></section></main></MasterShell>;
}
