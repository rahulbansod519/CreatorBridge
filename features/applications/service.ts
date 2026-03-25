import { db } from "@/lib/db";
import type { ApplicationInput, ApplicationStatusInput } from "@/lib/validations";

export async function applyToCampaign(creatorId: string, data: ApplicationInput) {
  return db.application.create({
    data: { ...data, creatorId },
  });
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

export async function updateApplicationStatus(id: string, data: ApplicationStatusInput) {
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
