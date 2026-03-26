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

export async function getBrandDashboardData(brandId: string) {
  const [campaigns, recentApplications, invites, hiredApps] = await Promise.all([
    db.campaign.findMany({
      where: { brandId },
      include: { applications: { select: { status: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.application.findMany({
      where: { campaign: { brandId } },
      include: {
        creator: { select: { name: true, image: true } },
        campaign: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.invite.findMany({
      where: { brandId },
      select: { status: true },
    }),
    db.application.findMany({
      where: { campaign: { brandId }, status: "HIRED" },
      include: {
        creator: { include: { creatorProfile: { include: { platforms: true } } } },
      },
    }),
  ]);

  const allApps = campaigns.flatMap((c) => c.applications);
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE").length;
  const totalApplications = allApps.length;
  const hired = allApps.filter((a) => a.status === "HIRED").length;
  const shortlisted = allApps.filter((a) => a.status === "SHORTLISTED").length;
  const avgApplicationsPerCampaign = campaigns.length
    ? Math.round(totalApplications / campaigns.length)
    : 0;

  const nicheCounts: Record<string, number> = {};
  for (const c of campaigns) {
    for (const niche of c.niches) {
      nicheCounts[niche] = (nicheCounts[niche] ?? 0) + c.applications.length;
    }
  }
  const niches = Object.entries(nicheCounts)
    .map(([niche, count]) => ({ niche, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const campaignStats = campaigns.map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    budgetMin: c.budgetMin,
    budgetMax: c.budgetMax,
    deadline: c.deadline,
    applied: c.applications.length,
    shortlisted: c.applications.filter((a) => a.status === "SHORTLISTED").length,
    hired: c.applications.filter((a) => a.status === "HIRED").length,
  }));

  // Invite stats
  const inviteSent = invites.length;
  const inviteAccepted = invites.filter((i) => i.status === "ACCEPTED").length;
  const inviteDeclined = invites.filter((i) => i.status === "DECLINED").length;
  const invitePending = invites.filter((i) => i.status === "PENDING").length;
  const inviteAcceptanceRate = inviteSent > 0 ? Math.round((inviteAccepted / inviteSent) * 100) : 0;

  // Creator quality — avg engagement of hired creators
  const allPlatforms = hiredApps.flatMap(
    (a) => a.creator.creatorProfile?.platforms ?? []
  );
  const avgEngagementRate =
    allPlatforms.length > 0
      ? Math.round((allPlatforms.reduce((s, p) => s + p.engagementRate, 0) / allPlatforms.length) * 10) / 10
      : 0;
  const platformCounts: Record<string, number> = {};
  for (const p of allPlatforms) {
    platformCounts[p.name] = (platformCounts[p.name] ?? 0) + 1;
  }
  const platformBreakdown = Object.entries(platformCounts).map(([name, count]) => ({ name, count }));

  // Budget stats — sum budgetMax of active campaigns
  const activeCampaignsList = campaigns.filter((c) => c.status === "ACTIVE");
  const totalCommitted = activeCampaignsList.reduce((s, c) => s + c.budgetMax, 0);
  const estimatedCostPerHire = hired > 0 ? Math.round(totalCommitted / hired) : 0;

  return {
    stats: { activeCampaigns, totalApplications, hired, shortlisted, avgApplicationsPerCampaign },
    funnel: [
      { stage: "Applied", count: totalApplications },
      { stage: "Shortlisted", count: shortlisted },
      { stage: "Hired", count: hired },
    ],
    niches,
    campaignStats,
    recentApplications,
    inviteStats: { sent: inviteSent, accepted: inviteAccepted, declined: inviteDeclined, pending: invitePending, acceptanceRate: inviteAcceptanceRate },
    creatorQuality: { avgEngagementRate, platformBreakdown },
    budgetStats: { totalCommitted, estimatedCostPerHire },
  };
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
