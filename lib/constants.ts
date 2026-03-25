export const NICHES = [
  "Tech",
  "Beauty",
  "Gaming",
  "Finance",
  "Food",
  "Travel",
  "Fitness",
  "Fashion",
  "Lifestyle",
  "Education",
  "Health",
  "Music",
  "Sports",
  "Entertainment",
  "Business",
];

export const PLATFORMS = [
  "instagram",
  "youtube",
  "tiktok",
  "twitter",
  "linkedin",
];

export const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
};

export const FOLLOWER_RANGES = [
  "Under 1K",
  "1K – 10K",
  "10K – 50K",
  "50K – 100K",
  "100K – 500K",
  "500K – 1M",
  "1M+",
] as const;

export type FollowerRange = (typeof FOLLOWER_RANGES)[number];

// Midpoint numbers used only for mock chart data
export const FOLLOWER_RANGE_MIDPOINT: Record<string, number> = {
  "Under 1K": 500,
  "1K – 10K": 5000,
  "10K – 50K": 30000,
  "50K – 100K": 75000,
  "100K – 500K": 300000,
  "500K – 1M": 750000,
  "1M+": 1500000,
};

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  youtube: "bg-red-500/20 text-red-400 border-red-500/30",
  tiktok: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  twitter: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  linkedin: "bg-blue-600/20 text-blue-400 border-blue-600/30",
};

export const INDUSTRIES = [
  "Technology",
  "Beauty & Cosmetics",
  "Fashion & Apparel",
  "Food & Beverage",
  "Health & Wellness",
  "Finance & Fintech",
  "Gaming",
  "Travel & Hospitality",
  "Sports & Fitness",
  "Entertainment & Media",
  "Education",
  "Retail & E-commerce",
  "Automotive",
  "Home & Lifestyle",
  "Other",
];

export const STATUS_COLORS = {
  // Campaign
  DRAFT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  CLOSED: "bg-red-500/20 text-red-400 border-red-500/30",
  // Application
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  SHORTLISTED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  HIRED: "bg-green-500/20 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
  // Invite
  ACCEPTED: "bg-green-500/20 text-green-400 border-green-500/30",
  DECLINED: "bg-red-500/20 text-red-400 border-red-500/30",
};
