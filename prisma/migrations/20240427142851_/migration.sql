/*
  Warnings:

  - The values [MULTIPLE_CHOICE,SINGLE_CHOICE,FILL_IN_THE_BLANK,DRAG_AND_DROP,MATCHING,TRUE_FALSE] on the enum `QuizQuestionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuizQuestionType_new" AS ENUM ('MCQ', 'MRQ', 'OEQ', 'NRQ', 'CLOZE', 'MATCH', 'OPEN_ENDED');
ALTER TABLE "Quiz" ALTER COLUMN "questionType" DROP DEFAULT;
ALTER TABLE "Quiz" ALTER COLUMN "questionType" TYPE "QuizQuestionType_new" USING ("questionType"::text::"QuizQuestionType_new");
ALTER TYPE "QuizQuestionType" RENAME TO "QuizQuestionType_old";
ALTER TYPE "QuizQuestionType_new" RENAME TO "QuizQuestionType";
DROP TYPE "QuizQuestionType_old";
ALTER TABLE "Quiz" ALTER COLUMN "questionType" SET DEFAULT 'MCQ';
COMMIT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "studentsId" TEXT[],
ADD COLUMN     "teacherIds" TEXT[];

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "folderId" TEXT;

-- AlterTable
ALTER TABLE "Quiz" ALTER COLUMN "questionType" SET DEFAULT 'MCQ';

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
