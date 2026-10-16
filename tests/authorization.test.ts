import { describe, expect, it } from "vitest";
import { canManageCampaign, canViewCampaign, requireCampaignAccess } from "../lib/authorization";

const campaign = { campaignId: "campaign-a", ownerId: "gm-a" };

describe("isolamento entre campanhas", () => {
  it("impede que jogador sem vínculo veja uma campanha", () => {
    expect(canViewCampaign({ ...campaign, userId: "player-b", membership: null })).toBe(false);
    expect(() => requireCampaignAccess({ ...campaign, userId: "player-b", membership: null }, "view")).toThrow("FORBIDDEN_CAMPAIGN_ACCESS");
  });

  it("não concede gestão a jogador autorizado", () => {
    expect(canManageCampaign({ ...campaign, userId: "player-a", membership: { role: "PLAYER", isActive: true } })).toBe(false);
  });

  it("permite mestre proprietário e mestre ativo", () => {
    expect(canManageCampaign({ ...campaign, userId: "gm-a", membership: null })).toBe(true);
    expect(canManageCampaign({ ...campaign, userId: "gm-b", membership: { role: "GM", isActive: true } })).toBe(true);
  });
});
