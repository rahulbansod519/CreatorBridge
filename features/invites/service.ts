import { db } from "@/lib/db";
import { ForbiddenError } from "@/lib/api-auth";
import type { InviteInput } from "@/lib/validations";
import type { InviteStatus } from "@prisma/client";

export async function sendInvite(brandId: string, data: InviteInput) {
  // Ownership check: brand must own the campaign they're inviting for
  const campaign = await db.campaign.findUnique({ where: { id: data.campaignId } });
  if (!campaign || campaign.brandId !== brandId) {
    throw new ForbiddenError("You do not own this campaign");
  }

  return db.invite.create({ data: { ...data, brandId } });
}

export async function getInvitesForCreator(creatorId: string) {
  return db.invite.findMany({
    where: { creatorId },
    include: {
      brand: { include: { brandProfile: true } },
      campaign: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateInviteStatus(
  id: string,
  creatorId: string,
  status: InviteStatus
) {
  return db.invite.updateMany({ where: { id, creatorId }, data: { status } });
}
