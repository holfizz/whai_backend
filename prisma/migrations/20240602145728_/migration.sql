/*
  Warnings:

  - You are about to drop the column `quiz-id` on the `Choice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Choice" DROP CONSTRAINT "Choice_quiz-id_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_quizId_fkey";

-- DropIndex
DROP INDEX "Interaction_quizId_key";

-- AlterTable
ALTER TABLE "Choice" DROP COLUMN "quiz-id",
ADD COLUMN     "quiz_id" TEXT;

-- AlterTable
ALTER TABLE "Interaction" ALTER COLUMN "quizId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
