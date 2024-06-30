-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false;
