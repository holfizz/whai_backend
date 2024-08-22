/*
  Warnings:

  - Added the required column `payment_id` to the `subscription_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `subscription_history` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_status` to the `subscription_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscription_history" ADD COLUMN     "payment_id" TEXT NOT NULL,
ADD COLUMN     "payment_method" TEXT NOT NULL,
ADD COLUMN     "payment_status" TEXT NOT NULL;
