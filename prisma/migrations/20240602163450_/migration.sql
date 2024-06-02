/*
  Warnings:

  - You are about to drop the column `quiz_id` on the `Choice` table. All the data in the column will be lost.
  - You are about to drop the column `quizId` on the `Interaction` table. All the data in the column will be lost.
  - You are about to drop the column `quizId` on the `MatchingInteraction` table. All the data in the column will be lost.
  - You are about to drop the column `answers` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `questionType` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `stimulus` on the `Quiz` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[questionId]` on the table `MatchingInteraction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `question_id` to the `Choice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `MatchingInteraction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Choice" DROP CONSTRAINT "Choice_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_quizId_fkey";

-- DropForeignKey
ALTER TABLE "MatchingInteraction" DROP CONSTRAINT "MatchingInteraction_quizId_fkey";

-- DropIndex
DROP INDEX "MatchingInteraction_quizId_key";

-- AlterTable
ALTER TABLE "Choice" DROP COLUMN "quiz_id",
ADD COLUMN     "question_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "quizId",
ADD COLUMN     "questionId" TEXT;

-- AlterTable
ALTER TABLE "MatchingInteraction" DROP COLUMN "quizId",
ADD COLUMN     "questionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "answers",
DROP COLUMN "prompt",
DROP COLUMN "questionType",
DROP COLUMN "stimulus";

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionType" "QuizQuestionType" NOT NULL,
    "stimulus" TEXT,
    "prompt" TEXT,
    "answers" TEXT[],
    "quiz_id" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchingInteraction_questionId_key" ON "MatchingInteraction"("questionId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingInteraction" ADD CONSTRAINT "MatchingInteraction_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
