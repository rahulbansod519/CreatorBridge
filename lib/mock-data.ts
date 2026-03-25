// Mock data for charts — deterministic, indexed by creatorId
import { FOLLOWER_RANGE_MIDPOINT } from "@/lib/constants";

export type GrowthDataPoint = {
  month: string;
  [platform: string]: number | string;
};

export type AgeDataPoint = { range: string; value: number };
export type GenderDataPoint = { gender: string; value: number };

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

function pseudoRandom(seed: string, offset: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs((h + offset * 2654435761) | 0) / 2147483647;
}

export function getGrowthData(
  creatorId: string,
  platforms: { name: string; followersRange: string }[]
): GrowthDataPoint[] {
  return MONTHS.map((month, i) => {
    const point: GrowthDataPoint = { month };
    for (const p of platforms) {
      const midpoint = FOLLOWER_RANGE_MIDPOINT[p.followersRange] ?? 10000;
      const variance = 0.92 + pseudoRandom(creatorId + p.name, i) * 0.16;
      const base = midpoint * (0.88 + (i / MONTHS.length) * 0.12);
      point[p.name] = Math.round(base * variance);
    }
    return point;
  });
}

export function getAgeData(creatorId: string): AgeDataPoint[] {
  const r = (offset: number) => Math.round(pseudoRandom(creatorId, offset) * 30 + 5);
  const raw = [r(1), r(2), r(3), r(4), r(5)];
  const total = raw.reduce((a, b) => a + b, 0);
  return [
    { range: "13-17", value: Math.round((raw[0] / total) * 100) },
    { range: "18-24", value: Math.round((raw[1] / total) * 100) },
    { range: "25-34", value: Math.round((raw[2] / total) * 100) },
    { range: "35-44", value: Math.round((raw[3] / total) * 100) },
    { range: "45+", value: Math.round((raw[4] / total) * 100) },
  ];
}

export function getGenderData(creatorId: string): GenderDataPoint[] {
  const male = Math.round(pseudoRandom(creatorId, 99) * 50 + 25);
  const other = Math.round(pseudoRandom(creatorId, 77) * 5 + 2);
  return [
    { gender: "Female", value: 100 - male - other },
    { gender: "Male", value: male },
    { gender: "Other", value: other },
  ];
}
