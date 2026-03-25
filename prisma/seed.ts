import { PrismaClient, CampaignStatus, ApplicationStatus, InviteStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hash = await bcrypt.hash("password123", 10);

  // ── Brands ──────────────────────────────────────────────────────
  const [techGear, glowUp, fitLife] = await Promise.all([
    prisma.user.upsert({
      where: { email: "brand@techgear.com" },
      update: {},
      create: {
        email: "brand@techgear.com",
        name: "TechGear Co",
        passwordHash: hash,
        role: "BRAND",
        onboarded: true,
        brandProfile: {
          create: {
            companyName: "TechGear Co",
            industry: "Technology",
            website: "https://techgear.com",
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: "brand@glowup.com" },
      update: {},
      create: {
        email: "brand@glowup.com",
        name: "GlowUp Beauty",
        passwordHash: hash,
        role: "BRAND",
        onboarded: true,
        brandProfile: {
          create: {
            companyName: "GlowUp Beauty",
            industry: "Beauty & Cosmetics",
            website: "https://glowupbeauty.com",
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: "brand@fitlife.com" },
      update: {},
      create: {
        email: "brand@fitlife.com",
        name: "FitLife Nutrition",
        passwordHash: hash,
        role: "BRAND",
        onboarded: true,
        brandProfile: {
          create: {
            companyName: "FitLife Nutrition",
            industry: "Health & Wellness",
            website: "https://fitlifenutrition.com",
          },
        },
      },
    }),
  ]);

  // ── Creators ─────────────────────────────────────────────────────
  const [maya, alex, priya, jordan, sam] = await Promise.all([
    prisma.user.upsert({
      where: { email: "maya@example.com" },
      update: {},
      create: {
        email: "maya@example.com",
        name: "Maya Chen",
        username: "mayachen",
        passwordHash: hash,
        role: "CREATOR",
        onboarded: true,
        creatorProfile: {
          create: {
            bio: "Lifestyle & beauty creator passionate about sustainable fashion and skincare routines. Based in NYC.",
            niches: ["Beauty", "Lifestyle", "Fashion"],
            location: "New York, USA",
            platforms: {
              create: [
                { name: "instagram", handle: "@mayachen", followersRange: "100K – 500K", engagementRate: 4.2 },
                { name: "youtube", handle: "MayaChenBeauty", followersRange: "10K – 50K", engagementRate: 3.8 },
              ],
            },
          },
        },
      },
      include: { creatorProfile: { include: { platforms: true } } },
    }),
    prisma.user.upsert({
      where: { email: "alex@example.com" },
      update: {},
      create: {
        email: "alex@example.com",
        name: "Alex Rivera",
        username: "alexrivera",
        passwordHash: hash,
        role: "CREATOR",
        onboarded: true,
        creatorProfile: {
          create: {
            bio: "Tech reviewer and gaming streamer. I break down the latest gadgets and games so you don't have to.",
            niches: ["Tech", "Gaming", "Entertainment"],
            location: "San Francisco, USA",
            platforms: {
              create: [
                { name: "youtube", handle: "AlexTechReviews", followersRange: "100K – 500K", engagementRate: 5.1 },
                { name: "twitter", handle: "@alexrivera_tech", followersRange: "50K – 100K", engagementRate: 3.2 },
              ],
            },
          },
        },
      },
      include: { creatorProfile: { include: { platforms: true } } },
    }),
    prisma.user.upsert({
      where: { email: "priya@example.com" },
      update: {},
      create: {
        email: "priya@example.com",
        name: "Priya Patel",
        username: "priyafit",
        passwordHash: hash,
        role: "CREATOR",
        onboarded: true,
        creatorProfile: {
          create: {
            bio: "Certified personal trainer and nutrition coach. I make fitness accessible and fun for everyone.",
            niches: ["Fitness", "Health", "Lifestyle"],
            location: "Los Angeles, USA",
            platforms: {
              create: [
                { name: "instagram", handle: "@priyafit", followersRange: "100K – 500K", engagementRate: 6.3 },
                { name: "tiktok", handle: "@priyafit", followersRange: "500K – 1M", engagementRate: 8.7 },
              ],
            },
          },
        },
      },
      include: { creatorProfile: { include: { platforms: true } } },
    }),
    prisma.user.upsert({
      where: { email: "jordan@example.com" },
      update: {},
      create: {
        email: "jordan@example.com",
        name: "Jordan Lee",
        username: "jordanexplores",
        passwordHash: hash,
        role: "CREATOR",
        onboarded: true,
        creatorProfile: {
          create: {
            bio: "Full-time traveler documenting hidden gems and budget travel tips across 50+ countries.",
            niches: ["Travel", "Lifestyle", "Food"],
            location: "Nomadic",
            platforms: {
              create: [
                { name: "instagram", handle: "@jordanexplores", followersRange: "50K – 100K", engagementRate: 4.8 },
                { name: "youtube", handle: "JordanExplores", followersRange: "10K – 50K", engagementRate: 5.5 },
              ],
            },
          },
        },
      },
      include: { creatorProfile: { include: { platforms: true } } },
    }),
    prisma.user.upsert({
      where: { email: "sam@example.com" },
      update: {},
      create: {
        email: "sam@example.com",
        name: "Sam Kim",
        username: "samcooks",
        passwordHash: hash,
        role: "CREATOR",
        onboarded: true,
        creatorProfile: {
          create: {
            bio: "Home chef and food explorer. Easy recipes with bold flavors — 30 minutes or less guaranteed.",
            niches: ["Food", "Lifestyle", "Health"],
            location: "Chicago, USA",
            platforms: {
              create: [
                { name: "instagram", handle: "@samcooks", followersRange: "100K – 500K", engagementRate: 5.9 },
                { name: "tiktok", handle: "@samcooks", followersRange: "100K – 500K", engagementRate: 9.2 },
              ],
            },
          },
        },
      },
      include: { creatorProfile: { include: { platforms: true } } },
    }),
  ]);

  // ── Campaigns ────────────────────────────────────────────────────
  const deadline30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const deadline60 = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const deadlinePast = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  const [smartwatch, gamingLaunch, laptopReview, skincareRevamp, summmerGlow, proteinLaunch, fitnessApp, mealPrep] =
    await Promise.all([
      prisma.campaign.create({
        data: {
          brandId: techGear.id,
          title: "SmartWatch Series X Launch",
          description:
            "We're launching our next-gen SmartWatch Series X and need creators to showcase its health-tracking features, sleek design, and seamless app integration. Looking for authentic reviews and lifestyle content.",
          niches: ["Tech", "Fitness", "Lifestyle"],
          platforms: ["instagram", "youtube"],
          budgetMin: 2000,
          budgetMax: 5000,
          deadline: deadline30,
          status: CampaignStatus.ACTIVE,
        },
      }),
      prisma.campaign.create({
        data: {
          brandId: techGear.id,
          title: "Gaming Peripherals Back-to-School",
          description:
            "Promote our new line of gaming keyboards, mice, and headsets targeting student gamers. Content should highlight performance, value, and setup aesthetics.",
          niches: ["Gaming", "Tech", "Education"],
          platforms: ["youtube", "tiktok", "twitter"],
          budgetMin: 1500,
          budgetMax: 4000,
          deadline: deadline60,
          status: CampaignStatus.ACTIVE,
        },
      }),
      prisma.campaign.create({
        data: {
          brandId: techGear.id,
          title: "Ultra Laptop Pro Review Campaign",
          description:
            "Seeking in-depth reviewers for our Ultra Laptop Pro — the thinnest 4K display laptop on the market. Ideal for productivity and creative professionals.",
          niches: ["Tech", "Business", "Education"],
          platforms: ["youtube"],
          budgetMin: 3000,
          budgetMax: 8000,
          deadline: deadlinePast,
          status: CampaignStatus.CLOSED,
        },
      }),
      prisma.campaign.create({
        data: {
          brandId: glowUp.id,
          title: "Skincare Routine Revamp 2024",
          description:
            "Partnering with beauty creators to showcase our new 5-step skincare routine. We want before/after content, honest reviews, and routine demonstrations on camera.",
          niches: ["Beauty", "Lifestyle", "Health"],
          platforms: ["instagram", "tiktok", "youtube"],
          budgetMin: 1000,
          budgetMax: 3500,
          deadline: deadline30,
          status: CampaignStatus.ACTIVE,
        },
      }),
      prisma.campaign.create({
        data: {
          brandId: glowUp.id,
          title: "Summer Glow Collection Drop",
          description:
            "Introducing our Summer Glow makeup collection. Content creators will receive the full collection to unbox, swatch, and create looks for their audience.",
          niches: ["Beauty", "Fashion", "Lifestyle"],
          platforms: ["instagram", "tiktok"],
          budgetMin: 800,
          budgetMax: 2500,
          deadline: deadline60,
          status: CampaignStatus.ACTIVE,
        },
      }),
      prisma.campaign.create({
        data: {
          brandId: fitLife.id,
          title: "Protein Powder Launch — FitLife Whey+",
          description:
            "We need fitness creators to authentically review and integrate our new Whey+ protein into their workout and nutrition routines. Real results, real stories.",
          niches: ["Fitness", "Health", "Food"],
          platforms: ["instagram", "tiktok", "youtube"],
          budgetMin: 500,
          budgetMax: 2000,
          deadline: deadline30,
          status: CampaignStatus.ACTIVE,
        },
      }),
      prisma.campaign.create({
        data: {
          brandId: fitLife.id,
          title: "FitLife App 90-Day Challenge",
          description:
            "Join our 90-day fitness challenge and document your journey using the FitLife app. We'll sponsor your challenge and pay based on engagement and authenticity.",
          niches: ["Fitness", "Lifestyle", "Health"],
          platforms: ["instagram", "tiktok"],
          budgetMin: 1200,
          budgetMax: 3000,
          deadline: deadline60,
          status: CampaignStatus.ACTIVE,
        },
      }),
      prisma.campaign.create({
        data: {
          brandId: fitLife.id,
          title: "Meal Prep & Nutrition Series",
          description:
            "Looking for food and fitness creators to create a weekly meal prep series using FitLife nutrition products. Content should be educational and inspiring.",
          niches: ["Food", "Fitness", "Health"],
          platforms: ["youtube", "instagram"],
          budgetMin: 700,
          budgetMax: 1800,
          deadline: deadlinePast,
          status: CampaignStatus.CLOSED,
        },
      }),
    ]);

  // ── Applications ─────────────────────────────────────────────────
  await Promise.all([
    // Maya → Skincare
    prisma.application.upsert({
      where: { creatorId_campaignId: { creatorId: maya.id, campaignId: skincareRevamp.id } },
      update: {},
      create: {
        creatorId: maya.id,
        campaignId: skincareRevamp.id,
        pitchMessage:
          "I've been a loyal GlowUp customer for 2 years and my audience trusts my honest beauty reviews. I'd love to create a genuine before/after series showing real results over 30 days. My Instagram engagement averages 4.2% and I have a dedicated skincare audience.",
        status: ApplicationStatus.HIRED,
        brandResponse:
          "We love your content style Maya! You're hired. Expect the full product kit within 5 business days.",
      },
    }),
    // Maya → Summer Glow
    prisma.application.upsert({
      where: { creatorId_campaignId: { creatorId: maya.id, campaignId: summmerGlow.id } },
      update: {},
      create: {
        creatorId: maya.id,
        campaignId: summmerGlow.id,
        pitchMessage:
          "Summer Glow collection is exactly my aesthetic — vibrant, fun, and wearable. I'd create a full unboxing + 3 GRWM looks using only the new collection, posted across Instagram and TikTok.",
        status: ApplicationStatus.SHORTLISTED,
        brandResponse: "Hi Maya, we've shortlisted you! We'll be in touch with next steps shortly.",
      },
    }),
    // Alex → SmartWatch
    prisma.application.upsert({
      where: { creatorId_campaignId: { creatorId: alex.id, campaignId: smartwatch.id } },
      update: {},
      create: {
        creatorId: alex.id,
        campaignId: smartwatch.id,
        pitchMessage:
          "My YouTube channel specializes in detailed tech reviews with 224K subscribers. I've reviewed 12 smartwatches in the past year and my audience heavily follows my recommendations. I'd do a 2-week usage review comparing Series X to competitors.",
        status: ApplicationStatus.SHORTLISTED,
      },
    }),
    // Alex → Gaming Launch
    prisma.application.upsert({
      where: { creatorId_campaignId: { creatorId: alex.id, campaignId: gamingLaunch.id } },
      update: {},
      create: {
        creatorId: alex.id,
        campaignId: gamingLaunch.id,
        pitchMessage:
          "Gaming peripherals are my specialty. I'll do an in-depth setup showcase video on YouTube plus Twitter threads covering specs and value. My audience is exactly the student gamer demographic you're targeting.",
        status: ApplicationStatus.HIRED,
        brandResponse:
          "Perfect match Alex! We're sending you the full peripherals kit. Let's schedule a product briefing call.",
      },
    }),
    // Priya → Protein Launch
    prisma.application.upsert({
      where: { creatorId_campaignId: { creatorId: priya.id, campaignId: proteinLaunch.id } },
      update: {},
      create: {
        creatorId: priya.id,
        campaignId: proteinLaunch.id,
        pitchMessage:
          "As a certified personal trainer with 315K Instagram followers and 512K TikTok followers, I'm the perfect advocate for FitLife Whey+. I'll incorporate it into my real training sessions and meal plans, creating authentic content my fitness-focused audience will trust.",
        status: ApplicationStatus.HIRED,
        brandResponse: "Priya, you're exactly who we've been looking for! Welcome to the FitLife family!",
      },
    }),
    // Priya → FitLife App
    prisma.application.upsert({
      where: { creatorId_campaignId: { creatorId: priya.id, campaignId: fitnessApp.id } },
      update: {},
      create: {
        creatorId: priya.id,
        campaignId: fitnessApp.id,
        pitchMessage:
          "I thrive on 90-day challenges and my audience loves following my transformation journeys. I'd document every week using the app, sharing progress, stats, and honest feedback about features.",
        status: ApplicationStatus.PENDING,
      },
    }),
    // Jordan → SmartWatch
    prisma.application.upsert({
      where: { creatorId_campaignId: { creatorId: jordan.id, campaignId: smartwatch.id } },
      update: {},
      create: {
        creatorId: jordan.id,
        campaignId: smartwatch.id,
        pitchMessage:
          "Travel creators are a unique use case for smartwatches — health tracking across time zones, fitness on the road, and navigation features matter to my audience. I'd showcase the Series X on an upcoming 2-week trip.",
        status: ApplicationStatus.REJECTED,
        brandResponse:
          "Hi Jordan, thank you for applying! We're focusing on tech-specific audiences for this campaign. We'll keep you in mind for future travel-adjacent campaigns.",
      },
    }),
    // Sam → Protein
    prisma.application.upsert({
      where: { creatorId_campaignId: { creatorId: sam.id, campaignId: proteinLaunch.id } },
      update: {},
      create: {
        creatorId: sam.id,
        campaignId: proteinLaunch.id,
        pitchMessage:
          "As a food creator with 143K Instagram and 205K TikTok followers, I'd create protein-packed recipe content using FitLife Whey+. Think post-workout smoothies, protein pancakes, and high-protein meal prep content that's actually delicious.",
        status: ApplicationStatus.SHORTLISTED,
      },
    }),
    // Sam → Meal Prep (closed campaign)
    prisma.application.upsert({
      where: { creatorId_campaignId: { creatorId: sam.id, campaignId: mealPrep.id } },
      update: {},
      create: {
        creatorId: sam.id,
        campaignId: mealPrep.id,
        pitchMessage:
          "Meal prep content is my bread and butter. I create weekly meal prep series that get millions of views. I'd love to build a 4-part series showcasing FitLife products in accessible, budget-friendly recipes.",
        status: ApplicationStatus.HIRED,
        brandResponse: "Sam, your meal prep content is exactly what we need. Let's do this!",
      },
    }),
  ]);

  // ── Invites ───────────────────────────────────────────────────────
  await Promise.all([
    prisma.invite.create({
      data: {
        brandId: glowUp.id,
        creatorId: priya.id,
        campaignId: skincareRevamp.id,
        message:
          "Hi Priya! Your fitness content has an amazing health-conscious audience that would love our skincare line. Would you consider joining our Skincare Routine Revamp campaign?",
        status: InviteStatus.PENDING,
      },
    }),
    prisma.invite.create({
      data: {
        brandId: fitLife.id,
        creatorId: jordan.id,
        campaignId: fitnessApp.id,
        message:
          "Hey Jordan! Travel fitness is big and your audience is exactly who would benefit from the FitLife App on the road. Interested in our 90-day challenge?",
        status: InviteStatus.ACCEPTED,
      },
    }),
  ]);

  console.log("✅ Seeding complete!");
  console.log("  Brands: TechGear Co, GlowUp Beauty, FitLife Nutrition");
  console.log("  Creators: Maya Chen, Alex Rivera, Priya Patel, Jordan Lee, Sam Kim");
  console.log(`  Campaigns: 8 (5 active, 2 closed, 1 draft)`);
  console.log(`  Applications: 9 with varied statuses`);
  console.log("\n  Login with any user: password = 'password123'");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
