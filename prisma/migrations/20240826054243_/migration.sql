-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "is_additional" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "is_additional" BOOLEAN NOT NULL DEFAULT false;
