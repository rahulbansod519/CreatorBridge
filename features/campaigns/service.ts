import { db } from "@/lib/db";
import type { CampaignInput } from "@/lib/validations";
import type { CampaignStatus } from "@prisma/client";

const BRAND_INCLUDE = {
  brand: { include: { brandProfile: true } },
  _count: { select: { applications: true } },
} as const;

export async function getCampaigns(filters?: {
  niche?: string;
  platform?: string;
  status?: CampaignStatus;
}) {
  return db.campaign.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.niche ? { niches: { has: filters.niche } } : {}),
      ...(filters?.platform ? { platforms: { has: filters.platform } } : {}),
    },
    include: BRAND_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignsForCreator(
  userId: string,
  filters?: { niche?: string; platform?: string }
) {
  // Get creator niches
  const profile = await db.creatorProfile.findUnique({ where: { userId } });
  const creatorNiches = profile?.niches ?? [];

  return db.campaign.findMany({
    where: {
      status: "ACTIVE",
      ...(filters?.platform ? { platforms: { has: filters.platform } } : {}),
      ...(filters?.niche
        ? { niches: { has: filters.niche } }
        : creatorNiches.length > 0
        ? { niches: { hasSome: creatorNiches } }
        : {}),
    },
    include: BRAND_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignsForBrand(brandId: string) {
  return db.campaign.findMany({
    where: { brandId },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignById(id: string) {
  return db.campaign.findUnique({
    where: { id },
    include: {
      ...BRAND_INCLUDE,
      applications: {
        include: {
          creator: {
            include: { creatorProfile: { include: { platforms: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createCampaign(brandId: string, data: CampaignInput) {
  return db.campaign.create({
    data: { ...data, brandId },
  });
}

export async function updateCampaign(
  id: string,
  brandId: string,
  data: { status?: CampaignStatus; title?: string; description?: string }
) {
  return db.campaign.updateMany({
    where: { id, brandId },
    data,
  });
}

export async function getBrandStats(brandId: string) {
  const campaigns = await db.campaign.findMany({
    where: { brandId },
    include: { applications: { select: { status: true } } },
  });

  const totalCampaigns = campaigns.length;
  const totalApplications = campaigns.reduce((s, c) => s + c.applications.length, 0);
  const hiredCount = campaigns.reduce(
    (s, c) => s + c.applications.filter((a) => a.status === "HIRED").length,
    0
  );

  // Top niche by most applications across campaigns
  const nicheCounts: Record<string, number> = {};
  for (const campaign of campaigns) {
    for (const niche of campaign.niches) {
      nicheCounts[niche] = (nicheCounts[niche] ?? 0) + campaign.applications.length;
    }
  }
  const topNiche =
    Object.entries(nicheCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—";

  return { totalCampaigns, totalApplications, hiredCount, topNiche };
}
