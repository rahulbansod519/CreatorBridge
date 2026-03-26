import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const platformSchema = z.object({
  name: z.string().min(1, "Platform is required"),
  handle: z.string().min(1, "Handle is required"),
  followersRange: z.string().min(1, "Select a follower range"),
  engagementRate: z.coerce.number().min(0).max(100),
});

export const platformWithIdSchema = platformSchema.extend({
  id: z.string().optional(),
});

export const creatorOnboardingSchema = z.object({
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  niches: z.array(z.string()).min(1, "Select at least one niche"),
  location: z.string().optional(),
  platforms: z.array(platformSchema).min(1, "Add at least one platform"),
  mediaKitUrl: z.string().optional(),
});

export const creatorProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  niches: z.array(z.string()).min(1, "Select at least one niche"),
  location: z.string().optional(),
  mediaKitUrl: z.string().optional(),
});

export const brandOnboardingSchema = z.object({
  companyName: z.string().min(2, "Company name required"),
  industry: z.string().min(1, "Industry required"),
  website: z.string().url("Must be a valid URL"),
  logo: z.string().optional(),
});

export const campaignSchema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().min(20, "Description too short"),
  niches: z.array(z.string()).min(1, "Select at least one niche"),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  budgetMin: z.coerce.number().min(0),
  budgetMax: z.coerce.number().min(0),
  deadline: z.coerce.date(),
  status: z.enum(["DRAFT", "ACTIVE"]),
}).refine((d) => d.budgetMax >= d.budgetMin, {
  message: "Max budget must be ≥ min budget",
  path: ["budgetMax"],
}).refine((d) => d.deadline > new Date(), {
  message: "Deadline must be in the future",
  path: ["deadline"],
});

export const applicationSchema = z.object({
  campaignId: z.string().cuid(),
  pitchMessage: z
    .string()
    .min(50, "Pitch must be at least 50 characters")
    .max(1000, "Pitch too long"),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["PENDING", "SHORTLISTED", "HIRED", "REJECTED"]),
  brandResponse: z.string().optional(),
});

export const inviteSchema = z.object({
  creatorId: z.string().cuid(),
  campaignId: z.string().cuid(),
  message: z.string().min(20, "Message too short"),
});

export const creatorFiltersSchema = z.object({
  niche: z.string().optional(),
  platform: z.string().optional(),
  followerRange: z.string().optional(),
  engagementMin: z.coerce.number().optional(),
  location: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreatorOnboardingInput = z.infer<typeof creatorOnboardingSchema>;
export type CreatorProfileUpdateInput = z.infer<typeof creatorProfileUpdateSchema>;
export type PlatformInput = z.infer<typeof platformSchema>;
export type PlatformWithIdInput = z.infer<typeof platformWithIdSchema>;
export type BrandOnboardingInput = z.infer<typeof brandOnboardingSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ApplicationStatusInput = z.infer<typeof applicationStatusSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
export type CreatorFilters = z.infer<typeof creatorFiltersSchema>;
