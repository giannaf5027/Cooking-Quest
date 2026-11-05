-- AlterTable
-- Streak columns were added to the live DB directly, before this migration
-- was added, so they should already be there. IF NOT EXISTS makes this skip the
-- live DB and only creates the columns on a fresh database
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginDay" TEXT,
ADD COLUMN IF NOT EXISTS "loginStreak" INTEGER NOT NULL DEFAULT 0;

