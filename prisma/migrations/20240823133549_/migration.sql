-- AlterTable
ALTER TABLE "subscription_history" ALTER COLUMN "payment_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "transaction" ALTER COLUMN "payment_id" SET DATA TYPE TEXT;
