import type {
  User,
  CreatorProfile,
  Platform,
  BrandProfile,
  Campaign,
  Application,
  Invite,
  UserRole,
  CampaignStatus,
  ApplicationStatus,
  InviteStatus,
} from "@prisma/client";

export type { UserRole, CampaignStatus, ApplicationStatus, InviteStatus };

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: UserRole | null;
  onboarded: boolean;
  username?: string | null;
};

export type CreatorWithProfile = User & {
  creatorProfile:
    | (CreatorProfile & {
        platforms: Platform[];
      })
    | null;
};

export type CampaignWithBrand = Campaign & {
  brand: User & { brandProfile: BrandProfile | null };
  _count?: { applications: number };
};

export type ApplicationWithDetails = Application & {
  campaign: CampaignWithBrand;
  creator: User & { creatorProfile: (CreatorProfile & { platforms: Platform[] }) | null };
};

export type InviteWithDetails = Invite & {
  campaign: Campaign;
  brand: User & { brandProfile: BrandProfile | null };
  creator: User & { creatorProfile: (CreatorProfile & { platforms: Platform[] }) | null };
};

export type CreatorSearchResult = User & {
  creatorProfile:
    | (CreatorProfile & {
        platforms: Platform[];
      })
    | null;
};
