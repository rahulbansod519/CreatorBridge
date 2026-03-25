import { db } from "@/lib/db";

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
