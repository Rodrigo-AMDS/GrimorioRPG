import Link from "next/link";
import { createHash, randomUUID } from "crypto";
import { notFound, redirect } from "next/navigation";
import { MasterShell } from "@/components/master-shell";
import { FeatureEditor } from "@/components/feature-editor";
import { SheetDetailsEditor } from "@/components/sheet-details-editor";
import { SheetTabShell } from "@/components/sheet-tab-shell";
import { EquipmentBoard } from "@/components/equipment-board";
import { ProfileImageUpload } from "@/components/profile-image-upload";
import { updateCharacter } from "@/lib/campaign-service";
import { requireCampaignAccess } from "@/lib/authorization";
import { currentSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { EquipmentSlot, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { characterFeaturesSchema, updateCharacterSchema } from "@/lib/validation";
import { conflictingEquipmentSlots } from "@/lib/equipment-state";

const abilityKeys = [["strength", "Força"], ["dexterity", "Destreza"], ["constitution", "Constituição"], ["intelligence", "Inteligência"], ["wisdom", "Sabedoria"], ["charisma", "Carisma"]] as const;

export default async function CharacterEditor({ params }: { params: Promise<{ id: string; characterId: string }> }) {
  const session = await currentSession(); if (!session) redirect("/entrar");
  const { id, characterId } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: session.userId }, select: { role: true, isActive: true } } } });
  if (!campaign) notFound();
  requireCampaignAccess({ campaignId: id, userId: session.userId, ownerId: campaign.ownerId, membership: campaign.members[0] }, "manage");
  const [character, users, catalog] = await Promise.all([
    prisma.character.findFirst({ where: { id: characterId, campaignId: id }, include: { profileImage: { select: { id: true } }, equipmentImage: { select: { id: true } }, features: { orderBy: { sortOrder: "asc" } }, items: { include: { template: { include: { image: { select: { id: true } } } }, image: { select: { id: true } } }, orderBy: { id: "asc" } } } }),
    prisma.user.findMany({ where: { status: "ACTIVE" }, select: { id: true, username: true }, orderBy: { username: "asc" } }),
    prisma.itemTemplate.findMany({ where: { campaignId: id }, select: { id: true, name: true, kind: true, rarity: true, description: true, effectsConfig: true, image: { select: { id: true } } }, orderBy: { name: "asc" } })
  ]);
  if (!character) notFound();
  const stats = (character.baseStats && typeof character.baseStats === "object" ? character.baseStats : {}) as Record<string, unknown>;
  const sheetValues = character.overrides && typeof character.overrides === "object" && !Array.isArray(character.overrides) ? character.overrides as Record<string, unknown> : {};
  const armorClass = typeof sheetValues.armorClass === "number" ? sheetValues.armorClass : null;
  const portraitUrl = character.overrides && typeof character.overrides === "object" && "portraitUrl" in character.overrides && typeof character.overrides.portraitUrl === "string" ? character.overrides.portraitUrl : "";
  async function save(formData: FormData) { "use server"; const actor = await currentSession(); if (!actor) redirect("/entrar"); const parsed = updateCharacterSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) return; let decoded: unknown; let sheet: Record<string, unknown>; try { decoded = JSON.parse(parsed.data.featuresJson); sheet = JSON.parse(parsed.data.sheetJson); } catch { return; } const features = characterFeaturesSchema.safeParse(decoded); if (!sheet || typeof sheet !== "object" || Array.isArray(sheet)) return; sheet.alignment = String(formData.get("alignment") || "").trim() || null; sheet.futureArchetype = String(formData.get("futureArchetype") || "").trim() || null; sheet.originFamily = String(formData.get("originFamily") || "").trim() || null; const persistedFeatures = features.success ? features.data : character!.features.map((feature) => ({ name: feature.name, description: feature.description || "", source: feature.source || "", uses: feature.uses, maxUses: feature.maxUses })); await updateCharacter(actor.userId, id, characterId, { ownerUserId: parsed.data.ownerUserId, name: parsed.data.name, species: parsed.data.species, className: parsed.data.className, background: parsed.data.background, level: parsed.data.level, baseStats: { strength: parsed.data.strength, dexterity: parsed.data.dexterity, constitution: parsed.data.constitution, intelligence: parsed.data.intelligence, wisdom: parsed.data.wisdom, charisma: parsed.data.charisma }, overrides: sheet as Prisma.InputJsonValue, features: persistedFeatures }); redirect(`/campanhas/${id}/mestre/personagens/${characterId}`); }
  async function saveProfileImage(formData: FormData) { "use server"; const actor = await currentSession(); if (!actor) redirect("/entrar"); const file = formData.get("image"); if (!(file instanceof File) || !file.size || file.size > 5_000_000 || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) return; const bytes = Buffer.from(await file.arrayBuffer()); const asset = await prisma.asset.create({ data: { campaignId: id, uploadedById: actor.userId, storageKey: `characters/${characterId}/${randomUUID()}`, mimeType: file.type, sizeBytes: BigInt(bytes.length), checksum: createHash("sha256").update(bytes).digest("hex"), originalName: file.name || null, data: bytes } }); await prisma.character.update({ where: { id: characterId }, data: { profileImageAssetId: asset.id } }); revalidatePath(`/campanhas/${id}/mestre/personagens/${characterId}`); }
  async function assignFromArsenal(formData: FormData) { "use server"; const actor = await currentSession(); if (!actor) redirect("/entrar"); const templateId = String(formData.get("templateId") || ""); const access = await prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: actor.userId }, select: { role: true, isActive: true } } } }); if (!access) notFound(); requireCampaignAccess({ campaignId: id, userId: actor.userId, ownerId: access.ownerId, membership: access.members[0] }, "manage"); const template = await prisma.itemTemplate.findFirst({ where: { id: templateId, campaignId: id }, select: { id: true, kind: true } }); if (!template) return; const requestedQuantity = Math.max(1, Math.min(999, Number(formData.get("quantity")) || 1)); await prisma.itemInstance.create({ data: { ownerCharacterId: characterId, templateId: template.id, quantity: template.kind === "CONSUMABLE" ? requestedQuantity : 1 } }); revalidatePath(`/campanhas/${id}/mestre/personagens/${characterId}`); }
  async function equipItem(formData: FormData) {
    "use server";
    const actor = await currentSession(); if (!actor) redirect("/entrar");
    const instanceId = String(formData.get("instanceId") || "");
    const slot = String(formData.get("slot") || "") as EquipmentSlot;
    if (!Object.values(EquipmentSlot).includes(slot)) return { ok: false };
    const [access, instance] = await Promise.all([
      prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: actor.userId }, select: { role: true, isActive: true } } } }),
      prisma.itemInstance.findFirst({ where: { id: instanceId, ownerCharacterId: characterId, owner: { campaignId: id } }, select: { id: true, template: { select: { kind: true, effectsConfig: true } } } })
    ]);
    if (!access) notFound();
    requireCampaignAccess({ campaignId: id, userId: actor.userId, ownerId: access.ownerId, membership: access.members[0] }, "manage");
    if (!instance?.template) return { ok: false };
    const configuredSlot = instance.template.effectsConfig && typeof instance.template.effectsConfig === "object" && !Array.isArray(instance.template.effectsConfig) ? instance.template.effectsConfig.slot : null;
    const weaponSlots = ["PRIMARY_MAIN", "PRIMARY_OFF", "PRIMARY_TWO_HANDS", "SECONDARY_MAIN", "SECONDARY_OFF", "SECONDARY_TWO_HANDS"];
    const isWeaponSet = instance.template.kind === "WEAPON" && weaponSlots.includes(slot);
    const isShieldSet = configuredSlot === "OFF_HAND" && ["PRIMARY_OFF", "SECONDARY_OFF"].includes(slot);
    if (!isWeaponSet && !isShieldSet && configuredSlot !== slot) return { ok: false };
    await prisma.$transaction([
      prisma.itemInstance.updateMany({ where: { ownerCharacterId: characterId, equippedSlot: { in: conflictingEquipmentSlots(slot) as EquipmentSlot[] } }, data: { equipped: false, equippedSlot: null } }),
      prisma.itemInstance.update({ where: { id: instance.id }, data: { equipped: true, equippedSlot: slot } })
    ]);
    return { ok: true };
  }
  async function useConsumable(formData: FormData) { "use server"; const actor = await currentSession(); if (!actor) redirect("/entrar"); const instanceId = String(formData.get("instanceId") || ""); const access = await prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: actor.userId }, select: { role: true, isActive: true } } } }); if (!access) notFound(); requireCampaignAccess({ campaignId: id, userId: actor.userId, ownerId: access.ownerId, membership: access.members[0] }, "manage"); const instance = await prisma.itemInstance.findFirst({ where: { id: instanceId, ownerCharacterId: characterId, owner: { campaignId: id }, template: { kind: "CONSUMABLE" } }, select: { id: true, quantity: true } }); if (!instance || instance.quantity < 1) return; if (instance.quantity === 1) { await prisma.itemInstance.delete({ where: { id: instance.id } }); } else { await prisma.itemInstance.update({ where: { id: instance.id }, data: { quantity: { decrement: 1 } } }); } revalidatePath(`/campanhas/${id}/mestre/personagens/${characterId}`); }
  async function unequipItem(formData: FormData) {
    "use server";
    const actor = await currentSession(); if (!actor) redirect("/entrar");
    const instanceId = String(formData.get("instanceId") || "");
    const [access, instance] = await Promise.all([
      prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: actor.userId }, select: { role: true, isActive: true } } } }),
      prisma.itemInstance.findFirst({ where: { id: instanceId, ownerCharacterId: characterId, owner: { campaignId: id } }, select: { id: true, equippedSlot: true } })
    ]);
    if (!access) notFound();
    requireCampaignAccess({ campaignId: id, userId: actor.userId, ownerId: access.ownerId, membership: access.members[0] }, "manage");
    if (!instance?.equippedSlot) return { ok: false };
    await prisma.itemInstance.update({ where: { id: instance.id }, data: { equipped: false, equippedSlot: null } });
    return { ok: true };
  }
  async function saveEquipmentImage(formData: FormData) { "use server"; const actor = await currentSession(); if (!actor) redirect("/entrar"); const access = await prisma.campaign.findUnique({ where: { id }, include: { members: { where: { userId: actor.userId }, select: { role: true, isActive: true } } } }); if (!access) notFound(); requireCampaignAccess({ campaignId: id, userId: actor.userId, ownerId: access.ownerId, membership: access.members[0] }, "manage"); const file = formData.get("image"); if (!(file instanceof File) || !file.size || file.size > 5_000_000 || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) return; const bytes = Buffer.from(await file.arrayBuffer()); const asset = await prisma.asset.create({ data: { campaignId: id, uploadedById: actor.userId, storageKey: `characters/${characterId}/${randomUUID()}`, mimeType: file.type, sizeBytes: BigInt(bytes.length), checksum: createHash("sha256").update(bytes).digest("hex"), originalName: file.name || null, data: bytes } }); await prisma.character.update({ where: { id: characterId }, data: { equipmentImageAssetId: asset.id } }); revalidatePath(`/campanhas/${id}/mestre/personagens/${characterId}`); }
  const inventory = character.items.map((item) => ({ id: item.id, name: item.customName || item.template?.name || "Item sem nome", kind: item.template?.kind || "GEAR", rarity: item.template?.rarity || null, description: item.template?.description || null, quantity: item.quantity, equippedSlot: item.equippedSlot, imageId: item.image?.id || item.template?.image?.id || null, effectsConfig: item.template?.effectsConfig || null }));
  return <MasterShell campaignId={id} campaignName={campaign.name} active="personagens"><main className="main master-main"><div className="sheet-topline"><Link href={`/campanhas/${id}/mestre/personagens`}>← AVENTUREIROS</Link><span>{campaign.name}</span></div><div className="sheet-title"><div><p className="library-rubric">FICHA DE PERSONAGEM</p><h1>{character.name}</h1><p>{character.className || "Classe não definida"} · Nível {character.level} · {character.species || "Espécie não definida"}</p></div><div className="sheet-seal">✦</div></div><section className="character-sheet"><form action={save}><SheetTabShell><div data-sheet-tab="identity"><div className="identity-layout"><div className="identity-list"><label>Nome do personagem<input name="name" defaultValue={character.name} required /></label><label>Jogador<select name="ownerUserId" defaultValue={character.ownerUserId || ""} required>{users.map((user) => <option value={user.id} key={user.id}>{user.username}</option>)}</select></label><label>Raça<input name="species" defaultValue={character.species || ""} /></label><label>Classe<input name="className" defaultValue={character.className || ""} /></label><label>Antecedente<input name="background" defaultValue={character.background || ""} /></label><label>Tendência<select name="alignment" defaultValue={typeof sheetValues.alignment === "string" ? sheetValues.alignment : ""}><option value="">Não definida</option><option>Leal e Bom</option><option>Neutro e Bom</option><option>Caótico e Bom</option><option>Leal e Neutro</option><option>Neutro</option><option>Caótico e Neutro</option><option>Leal e Mau</option><option>Neutro e Mau</option><option>Caótico e Mau</option></select></label><label>Arquétipo futuro<input name="futureArchetype" defaultValue={typeof sheetValues.futureArchetype === "string" ? sheetValues.futureArchetype : ""} placeholder="Ex.: Assassino" /></label><label>Família de origem<input name="originFamily" defaultValue={typeof sheetValues.originFamily === "string" ? sheetValues.originFamily : ""} placeholder="Ex.: Casa Valen" /></label><label>Nível<input name="level" type="number" min="1" max="20" defaultValue={character.level} required /></label></div><div className="identity-right"><div className="ability-grid sheet-abilities">{abilityKeys.map(([key, label]) => <label key={key}><b>{label.slice(0, 3).toUpperCase()}</b><small>{label}</small><input name={key} type="number" min="1" max="30" defaultValue={typeof stats[key] === "number" ? stats[key] : 10} required /></label>)}</div><div className="identity-totem"><ProfileImageUpload imageId={character.profileImage?.id || null} name={character.name} saveImage={saveProfileImage} /></div></div></div></div><div data-sheet-tab="condition"><SheetDetailsEditor initial={character.overrides} mode="condition" /></div><div data-sheet-tab="equipment"><EquipmentBoard catalog={catalog.map((item) => ({ ...item, imageId: item.image?.id || null }))} inventory={inventory} assignFromArsenal={assignFromArsenal} equipItem={equipItem} unequipItem={unequipItem} useConsumable={useConsumable} bodyImageId={character.equipmentImage?.id || null} saveEquipmentImage={saveEquipmentImage} armorClass={armorClass} /></div><div data-sheet-tab="features"><FeatureEditor initialFeatures={character!.features.map((feature) => ({ name: feature.name, description: feature.description || "", source: feature.source || "", uses: feature.uses, maxUses: feature.maxUses }))} /></div></SheetTabShell><div className="form-actions"><button className="save-button" type="submit"><span>✦</span> Salvar ficha</button></div></form></section></main></MasterShell>;
}
