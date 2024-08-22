/*
  Warnings:

  - Added the required column `transactionId` to the `subscription_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscription_history" ADD COLUMN     "transactionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "type" "SubscriptionType" NOT NULL;
