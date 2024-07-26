/*
  Warnings:

  - You are about to drop the column `correctAnswersDescription` on the `UserAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `incorrectAnswersDescription` on the `UserAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `selectedAnswer` on the `UserAnswer` table. All the data in the column will be lost.
  - The `correctAnswers` column on the `UserAnswer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserAnswer" DROP COLUMN "correctAnswersDescription",
DROP COLUMN "incorrectAnswersDescription",
DROP COLUMN "selectedAnswer",
ADD COLUMN     "selectedAnswers" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "correctAnswers",
ADD COLUMN     "correctAnswers" TEXT[];
