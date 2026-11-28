-- AlterTable
-- already on the live db, only created on fresh databases
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mealPlans" JSONB;
