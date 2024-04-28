/*
  Warnings:

  - Made the column `folderId` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lessonId` on table `LessonTask` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_folderId_fkey";

-- DropForeignKey
ALTER TABLE "LessonTask" DROP CONSTRAINT "LessonTask_lessonId_fkey";

-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "folderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LessonTask" ALTER COLUMN "lessonId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "LessonTask" ADD CONSTRAINT "LessonTask_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
