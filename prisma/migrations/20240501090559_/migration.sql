/*
  Warnings:

  - You are about to drop the column `quiz_id` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `matching_interaction_id` on the `Quiz` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[matchingInteractionId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[interactionId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `interactionId` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_matching_interaction_id_fkey";

-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "quiz_id";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "matching_interaction_id",
ADD COLUMN     "interactionId" TEXT NOT NULL,
ADD COLUMN     "matchingInteractionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_matchingInteractionId_key" ON "Quiz"("matchingInteractionId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_interactionId_key" ON "Quiz"("interactionId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "Interaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_matchingInteractionId_fkey" FOREIGN KEY ("matchingInteractionId") REFERENCES "MatchingInteraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
