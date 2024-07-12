/*
  Warnings:

  - You are about to drop the column `subtopicId` on the `quiz_results` table. All the data in the column will be lost.
  - You are about to drop the column `user_answer_id` on the `quiz_results` table. All the data in the column will be lost.
  - You are about to drop the `_QuizResultToUserAnswer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quiz_result_id` to the `user_answers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_QuizResultToUserAnswer" DROP CONSTRAINT "_QuizResultToUserAnswer_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuizResultToUserAnswer" DROP CONSTRAINT "_QuizResultToUserAnswer_B_fkey";

-- DropForeignKey
ALTER TABLE "quiz_results" DROP CONSTRAINT "quiz_results_course_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_results" DROP CONSTRAINT "quiz_results_subtopicId_fkey";

-- AlterTable
ALTER TABLE "quiz_results" DROP COLUMN "subtopicId",
DROP COLUMN "user_answer_id",
ADD COLUMN     "subtopic_id" TEXT,
ALTER COLUMN "course_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_answers" ADD COLUMN     "quiz_result_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "_QuizResultToUserAnswer";

-- AddForeignKey
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_answers" ADD CONSTRAINT "user_answers_quiz_result_id_fkey" FOREIGN KEY ("quiz_result_id") REFERENCES "quiz_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
