/*
  Warnings:

  - You are about to drop the column `matchingInteractionId` on the `Quiz` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Quiz_matchingInteractionId_key";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "matchingInteractionId";
