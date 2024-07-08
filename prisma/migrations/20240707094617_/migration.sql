-- AlterTable
ALTER TABLE "quizzes" ALTER COLUMN "total_questions" DROP NOT NULL,
ALTER COLUMN "isPlan" SET DEFAULT false;
