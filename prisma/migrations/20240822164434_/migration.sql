/*
  Warnings:

  - You are about to drop the column `payment_id` on the `subscription_history` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `subscription_history` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscription_history" DROP COLUMN "payment_id",
DROP COLUMN "payment_method";
