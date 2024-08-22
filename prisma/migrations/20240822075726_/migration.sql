/*
  Warnings:

  - You are about to drop the column `is_auto_renewal` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "is_auto_renewal";
