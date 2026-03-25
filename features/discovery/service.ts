import { db } from "@/lib/db";
import { FOLLOWER_RANGES } from "@/lib/constants";
import type { CreatorFilters } from "@/lib/validations";

// Returns the selected range and all ranges above it
function getRangesAtOrAbove(range: string): string[] {
  const idx = FOLLOWER_RANGES.indexOf(range as (typeof FOLLOWER_RANGES)[number]);
  if (idx === -1) return [];
  return [...FOLLOWER_RANGES.slice(idx)];
}

export async function searchCreators(filters: CreatorFilters) {
  const creators = await db.user.findMany({
    where: {
      role: "CREATOR",
      onboarded: true,
      creatorProfile: {
        ...(filters.niche ? { niches: { has: filters.niche } } : {}),
        ...(filters.location
          ? { location: { contains: filters.location, mode: "insensitive" } }
          : {}),
        platforms: {
          some: {
            ...(filters.platform ? { name: filters.platform } : {}),
            ...(filters.followerRange
              ? { followersRange: { in: getRangesAtOrAbove(filters.followerRange) } }
              : {}),
            ...(filters.engagementMin !== undefined
              ? { engagementRate: { gte: filters.engagementMin } }
              : {}),
          },
        },
      },
    },
    include: {
      creatorProfile: { include: { platforms: true } },
    },
    take: 50,
  });

  return creators;
}
