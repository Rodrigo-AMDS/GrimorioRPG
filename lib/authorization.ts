export type CampaignRole = "GM" | "PLAYER";

export type CampaignAccess = {
  campaignId: string;
  userId: string;
  ownerId: string;
  membership?: { role: CampaignRole; isActive: boolean } | null;
};

export function canViewCampaign(access: CampaignAccess) {
  return access.userId === access.ownerId || Boolean(access.membership?.isActive);
}

export function canManageCampaign(access: CampaignAccess) {
  return access.userId === access.ownerId ||
    (access.membership?.isActive === true && access.membership.role === "GM");
}

export function requireCampaignAccess(access: CampaignAccess, permission: "view" | "manage") {
  const permitted = permission === "view" ? canViewCampaign(access) : canManageCampaign(access);
  if (!permitted) throw new Error("FORBIDDEN_CAMPAIGN_ACCESS");
}
