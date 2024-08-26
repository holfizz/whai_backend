-- AlterTable
ALTER TABLE "users" ADD COLUMN     "additional_titles_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_course_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_lesson_count" INTEGER NOT NULL DEFAULT 0;
