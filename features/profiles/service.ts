import { db } from "@/lib/db";
import type { CreatorProfileUpdateInput, PlatformInput } from "@/lib/validations";

export async function getCreatorByUsername(username: string) {
  return db.user.findUnique({
    where: { username },
    include: {
      creatorProfile: { include: { platforms: true } },
    },
  });
}

export async function getCreatorByUserId(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      creatorProfile: { include: { platforms: true } },
    },
  });
}

export async function getBrandByUserId(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: { brandProfile: true },
  });
}

// ── Profile update ──────────────────────────────────────────────

export async function updateCreatorProfile(
  userId: string,
  data: CreatorProfileUpdateInput
) {
  return db.$transaction(async (tx) => {
    await tx.creatorProfile.update({
      where: { userId },
      data: {
        bio: data.bio,
        niches: data.niches,
        location: data.location ?? null,
        mediaKitUrl: data.mediaKitUrl ?? null,
      },
    });

    if (data.name) {
      await tx.user.update({
        where: { id: userId },
        data: { name: data.name },
      });
    }

    return getCreatorByUserId(userId);
  });
}

// ── Platform CRUD ───────────────────────────────────────────────

export async function addPlatform(userId: string, data: PlatformInput) {
  return db.platform.create({
    data: {
      creatorId: userId,
      name: data.name,
      handle: data.handle,
      followersRange: data.followersRange,
      engagementRate: data.engagementRate,
    },
  });
}

export async function updatePlatform(
  platformId: string,
  userId: string,
  data: PlatformInput
) {
  // Ownership check
  const existing = await db.platform.findUnique({ where: { id: platformId } });
  if (!existing || existing.creatorId !== userId) {
    throw new Error("Platform not found");
  }

  return db.platform.update({
    where: { id: platformId },
    data: {
      name: data.name,
      handle: data.handle,
      followersRange: data.followersRange,
      engagementRate: data.engagementRate,
    },
  });
}

export async function deletePlatform(platformId: string, userId: string) {
  const existing = await db.platform.findUnique({ where: { id: platformId } });
  if (!existing || existing.creatorId !== userId) {
    throw new Error("Platform not found");
  }

  // Enforce at least 1 platform
  const count = await db.platform.count({ where: { creatorId: userId } });
  if (count <= 1) {
    throw new Error("You must have at least one platform");
  }

  return db.platform.delete({ where: { id: platformId } });
}

// ── Dashboard data ───────────────────────────────────────────────

export async function getCreatorDashboardData(userId: string) {
  const [creator, apps, pendingInvites, recentApplications] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: { include: { platforms: true } } },
    }),
    db.application.findMany({
      where: { creatorId: userId },
      select: { status: true },
    }),
    db.invite.findMany({
      where: { creatorId: userId, status: "PENDING" },
      include: {
        brand: { select: { name: true, brandProfile: { select: { companyName: true } } } },
        campaign: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.application.findMany({
      where: { creatorId: userId },
      include: {
        campaign: {
          select: {
            title: true,
            brand: { select: { brandProfile: { select: { companyName: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const appStats = {
    total: apps.length,
    hired: apps.filter((a) => a.status === "HIRED").length,
    pending: apps.filter((a) => a.status === "PENDING").length,
    shortlisted: apps.filter((a) => a.status === "SHORTLISTED").length,
    rejected: apps.filter((a) => a.status === "REJECTED").length,
  };

  return { creator, appStats, pendingInvites, recentApplications };
}
