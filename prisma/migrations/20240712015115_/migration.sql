/*
  Warnings:

  - Added the required column `userAnswerId` to the `quiz_results` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_answers" DROP CONSTRAINT "user_answers_quiz_result_id_fkey";

-- AlterTable
ALTER TABLE "quiz_results" ADD COLUMN     "userAnswerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_userAnswerId_fkey" FOREIGN KEY ("userAnswerId") REFERENCES "user_answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
