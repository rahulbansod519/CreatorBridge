import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { ForbiddenError, ConflictError } from "@/lib/api-auth";
import type { ApplicationInput, ApplicationStatusInput } from "@/lib/validations";

export async function applyToCampaign(creatorId: string, data: ApplicationInput) {
  // Guard: campaign must be ACTIVE
  const campaign = await db.campaign.findUnique({ where: { id: data.campaignId } });
  if (!campaign || campaign.status !== "ACTIVE") {
    throw new Error("Campaign is not accepting applications");
  }

  try {
    return await db.application.create({
      data: { ...data, creatorId },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new ConflictError("Already applied");
    }
    throw e;
  }
}

export async function getApplicationsForCreator(creatorId: string) {
  return db.application.findMany({
    where: { creatorId },
    include: {
      campaign: {
        include: { brand: { include: { brandProfile: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApplicationsForCampaign(campaignId: string) {
  return db.application.findMany({
    where: { campaignId },
    include: {
      creator: { include: { creatorProfile: { include: { platforms: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateApplicationStatus(
  id: string,
  brandId: string,
  data: ApplicationStatusInput
) {
  // Ownership check: brand must own the campaign this application belongs to
  const application = await db.application.findUnique({
    where: { id },
    include: { campaign: { select: { brandId: true } } },
  });
  if (!application || application.campaign.brandId !== brandId) {
    throw new ForbiddenError("You do not own this campaign");
  }

  return db.application.update({ where: { id }, data });
}

export async function getCreatorAppStats(creatorId: string) {
  const apps = await db.application.findMany({
    where: { creatorId },
    select: { status: true },
  });
  return {
    total: apps.length,
    hired: apps.filter((a) => a.status === "HIRED").length,
    pending: apps.filter((a) => a.status === "PENDING").length,
    shortlisted: apps.filter((a) => a.status === "SHORTLISTED").length,
  };
}
