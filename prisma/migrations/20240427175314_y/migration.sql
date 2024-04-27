/*
  Warnings:

  - Made the column `lessonId` on table `LessonBlock` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "LessonBlock" DROP CONSTRAINT "LessonBlock_lessonId_fkey";

-- AlterTable
ALTER TABLE "LessonBlock" ALTER COLUMN "type" SET DEFAULT 'DOCUMENT',
ALTER COLUMN "lessonId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LessonTask" ALTER COLUMN "isChecked" SET DEFAULT false;

-- AddForeignKey
ALTER TABLE "LessonBlock" ADD CONSTRAINT "LessonBlock_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
