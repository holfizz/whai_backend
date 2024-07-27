/*
  Warnings:

  - The `selectedAnswers` column on the `UserAnswer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserAnswer" DROP COLUMN "selectedAnswers",
ADD COLUMN     "selectedAnswers" TEXT[];
