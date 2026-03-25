-- Add followersRange column with a default, migrate existing rows, then drop followers
ALTER TABLE "Platform" ADD COLUMN "followersRange" TEXT NOT NULL DEFAULT 'Under 1K';
ALTER TABLE "Platform" ALTER COLUMN "followersRange" DROP DEFAULT;
ALTER TABLE "Platform" DROP COLUMN "followers";
