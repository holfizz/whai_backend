/*
  Warnings:

  - You are about to drop the column `isHasSearchImageAI` on the `courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "isHasSearchImageAI",
ADD COLUMN     "isHasAISearchImage" BOOLEAN NOT NULL DEFAULT false;
