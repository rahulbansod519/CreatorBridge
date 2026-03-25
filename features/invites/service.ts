import { db } from "@/lib/db";
import type { InviteInput } from "@/lib/validations";
import type { InviteStatus } from "@prisma/client";

export async function sendInvite(brandId: string, data: InviteInput) {
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

export async function updateInviteStatus(id: string, creatorId: string, status: InviteStatus) {
  return db.invite.updateMany({ where: { id, creatorId }, data: { status } });
}
