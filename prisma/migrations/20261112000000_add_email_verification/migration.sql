-- AlterTable
-- already on the live db, only created on fresh databases
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS "verificationToken" TEXT,
ADD COLUMN IF NOT EXISTS "verificationTokenExpiry" TIMESTAMP(3);
