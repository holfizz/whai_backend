-- AlterTable
ALTER TABLE "QuizResult" ADD COLUMN     "correctAnswers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wrongAnswers" INTEGER NOT NULL DEFAULT 0;
