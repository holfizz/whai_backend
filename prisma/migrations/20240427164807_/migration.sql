-- DropForeignKey
ALTER TABLE "LessonBlock" DROP CONSTRAINT "LessonBlock_lessonId_fkey";

-- AlterTable
ALTER TABLE "LessonBlock" ALTER COLUMN "caption" DROP NOT NULL,
ALTER COLUMN "lessonId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LessonBlock" ADD CONSTRAINT "LessonBlock_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
