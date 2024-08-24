-- AlterTable
ALTER TABLE "subscription_history" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "is_auto_renewal" SET DEFAULT false;
