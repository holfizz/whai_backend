/*
  Warnings:

  - You are about to drop the column `correctAnswers` on the `QuizResult` table. All the data in the column will be lost.
  - You are about to drop the column `wrongAnswers` on the `QuizResult` table. All the data in the column will be lost.
  - The `selectedAnswer` column on the `UserAnswer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "QuizResult" DROP COLUMN "correctAnswers",
DROP COLUMN "wrongAnswers",
ALTER COLUMN "totalPercents" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "UserAnswer" ADD COLUMN     "matchingAnswers" JSONB[] DEFAULT ARRAY[]::JSONB[],
DROP COLUMN "selectedAnswer",
ADD COLUMN     "selectedAnswer" TEXT[] DEFAULT ARRAY[]::TEXT[];
