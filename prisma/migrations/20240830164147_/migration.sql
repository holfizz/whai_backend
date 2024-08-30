-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_final_project_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_first_course_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_homework_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_quiz_completed" BOOLEAN NOT NULL DEFAULT false;
