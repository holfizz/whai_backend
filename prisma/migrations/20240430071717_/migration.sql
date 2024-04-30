/*
  Warnings:

  - The values [OPEN_ENDED] on the enum `QuizQuestionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `answer` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `folderId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `lessonBlockId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `pairs` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Quiz` table. All the data in the column will be lost.
  - Added the required column `title` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('MATCHING');

-- AlterEnum
BEGIN;
CREATE TYPE "QuizQuestionType_new" AS ENUM ('MCQ', 'MRQ', 'OEQ', 'NRQ', 'CLOZE', 'MATCH');
ALTER TABLE "Quiz" ALTER COLUMN "questionType" DROP DEFAULT;
ALTER TABLE "Quiz" ALTER COLUMN "questionType" TYPE "QuizQuestionType_new" USING ("questionType"::text::"QuizQuestionType_new");
ALTER TYPE "QuizQuestionType" RENAME TO "QuizQuestionType_old";
ALTER TYPE "QuizQuestionType_new" RENAME TO "QuizQuestionType";
DROP TYPE "QuizQuestionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_folderId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_lessonBlockId_fkey";

-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "answer",
DROP COLUMN "created_at",
DROP COLUMN "description",
DROP COLUMN "folderId",
DROP COLUMN "instructions",
DROP COLUMN "lessonBlockId",
DROP COLUMN "name",
DROP COLUMN "options",
DROP COLUMN "pairs",
DROP COLUMN "question",
DROP COLUMN "updated_at",
ADD COLUMN     "answers" TEXT[],
ADD COLUMN     "folder_id" TEXT,
ADD COLUMN     "lesson_block_id" TEXT,
ADD COLUMN     "matching_interaction_id" TEXT,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "stimulus" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "questionType" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Choice" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "quiz-id" TEXT NOT NULL,
    "interaction_id" TEXT,

    CONSTRAINT "Choice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "placeholder" TEXT NOT NULL,
    "answers" TEXT[],
    "quiz_id" TEXT,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchingInteraction" (
    "id" TEXT NOT NULL,
    "left" JSONB NOT NULL,
    "right" JSONB NOT NULL,
    "answers" TEXT[],

    CONSTRAINT "MatchingInteraction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_lesson_block_id_fkey" FOREIGN KEY ("lesson_block_id") REFERENCES "LessonBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_matching_interaction_id_fkey" FOREIGN KEY ("matching_interaction_id") REFERENCES "MatchingInteraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_quiz-id_fkey" FOREIGN KEY ("quiz-id") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_interaction_id_fkey" FOREIGN KEY ("interaction_id") REFERENCES "Interaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;
