import { z } from "zod";

export const usernameSchema = z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_.-]+$/, "Use apenas letras, números, ponto, hífen e sublinhado.");
export const passwordSchema = z.string().min(12).max(128);
export const createAccountSchema = z.object({ username: usernameSchema, password: passwordSchema });
export const createCampaignSchema = z.object({ name: z.string().trim().min(1).max(160), description: z.string().trim().max(10_000).optional() });
export const addPlayerSchema = z.object({ username: usernameSchema });
export const createCharacterSchema = z.object({
  ownerUserId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  species: z.string().trim().max(120).optional(),
  className: z.string().trim().max(120).optional(),
  background: z.string().trim().max(120).optional(),
  level: z.coerce.number().int().min(1).max(20).default(1)
});

export const updateCharacterSchema = createCharacterSchema.extend({
  featuresJson: z.string().max(30_000).default("[]"),
  sheetJson: z.string().max(80_000).default("{}"),
  strength: z.coerce.number().int().min(1).max(30).default(10),
  dexterity: z.coerce.number().int().min(1).max(30).default(10),
  constitution: z.coerce.number().int().min(1).max(30).default(10),
  intelligence: z.coerce.number().int().min(1).max(30).default(10),
  wisdom: z.coerce.number().int().min(1).max(30).default(10),
  charisma: z.coerce.number().int().min(1).max(30).default(10)
});

export const characterFeaturesSchema = z.array(z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4_000).optional(),
  source: z.string().trim().max(160).optional(),
  uses: z.coerce.number().int().min(0).max(999).nullable().optional(),
  maxUses: z.coerce.number().int().min(0).max(999).nullable().optional()
})).max(100);
