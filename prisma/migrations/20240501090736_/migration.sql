/*
  Warnings:

  - You are about to drop the column `interactionId` on the `Quiz` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[quizId]` on the table `Interaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[quizId]` on the table `MatchingInteraction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `quizId` to the `Interaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizId` to the `MatchingInteraction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_interactionId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_matchingInteractionId_fkey";

-- DropIndex
DROP INDEX "Quiz_interactionId_key";

-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN     "quizId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MatchingInteraction" ADD COLUMN     "quizId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "interactionId";

-- CreateIndex
CREATE UNIQUE INDEX "Interaction_quizId_key" ON "Interaction"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchingInteraction_quizId_key" ON "MatchingInteraction"("quizId");

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingInteraction" ADD CONSTRAINT "MatchingInteraction_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
