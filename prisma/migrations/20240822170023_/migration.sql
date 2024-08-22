/*
  Warnings:

  - Changed the type of `payment_id` on the `subscription_history` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "subscription_history" DROP COLUMN "payment_id",
ADD COLUMN     "payment_id" INTEGER NOT NULL;
