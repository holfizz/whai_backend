/*
  Warnings:

  - You are about to drop the column `quizId` on the `LessonBlock` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `ChatWithAI` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `answer` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuizQuestionType" AS ENUM ('MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'FILL_IN_THE_BLANK', 'DRAG_AND_DROP', 'MATCHING', 'TRUE_FALSE', 'OPEN_ENDED');

-- DropForeignKey
ALTER TABLE "LessonBlock" DROP CONSTRAINT "LessonBlock_quizId_fkey";

-- AlterTable
ALTER TABLE "LessonBlock" DROP COLUMN "quizId";

-- AlterTable
ALTER TABLE "MessageWithAI" ALTER COLUMN "type" SET DEFAULT 'answer';

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "correctIndex" INTEGER,
ADD COLUMN     "folderId" TEXT,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "lessonBlockId" TEXT,
ADD COLUMN     "options" JSONB,
ADD COLUMN     "pairs" JSONB,
ADD COLUMN     "questionType" "QuizQuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE',
ADD COLUMN     "template" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ChatWithAI_id_key" ON "ChatWithAI"("id");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_lessonBlockId_fkey" FOREIGN KEY ("lessonBlockId") REFERENCES "LessonBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
