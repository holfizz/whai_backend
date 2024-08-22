/*
  Warnings:

  - You are about to drop the column `payment_status` on the `subscription_history` table. All the data in the column will be lost.
  - Added the required column `payment_id` to the `subscription_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscription_history" DROP COLUMN "payment_status",
ADD COLUMN     "payment_id" TEXT NOT NULL;
