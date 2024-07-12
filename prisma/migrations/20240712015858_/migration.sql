/*
  Warnings:

  - The values [OEQ,NRQ] on the enum `QuizQuestionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userAnswerId` on the `quiz_results` table. All the data in the column will be lost.
  - You are about to drop the column `quiz_result_id` on the `user_answers` table. All the data in the column will be lost.
  - Added the required column `user_answer_id` to the `quiz_results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuizQuestionType_new" AS ENUM ('MCQ', 'MRQ', 'CLOZE', 'MATCH');
ALTER TABLE "questions" ALTER COLUMN "question_type" TYPE "QuizQuestionType_new" USING ("question_type"::text::"QuizQuestionType_new");
ALTER TYPE "QuizQuestionType" RENAME TO "QuizQuestionType_old";
ALTER TYPE "QuizQuestionType_new" RENAME TO "QuizQuestionType";
DROP TYPE "QuizQuestionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "quiz_results" DROP CONSTRAINT "quiz_results_userAnswerId_fkey";

-- AlterTable
ALTER TABLE "quiz_results" DROP COLUMN "userAnswerId",
ADD COLUMN     "user_answer_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user_answers" DROP COLUMN "quiz_result_id";

-- AddForeignKey
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_user_answer_id_fkey" FOREIGN KEY ("user_answer_id") REFERENCES "user_answers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
