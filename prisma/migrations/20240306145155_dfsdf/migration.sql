/*
  Warnings:

  - You are about to drop the column `is_activated` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_activated",
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false;
