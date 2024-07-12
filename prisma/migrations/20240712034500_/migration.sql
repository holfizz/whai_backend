/*
  Warnings:

  - You are about to drop the column `stimulus` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `subtopic_id` on the `quiz_results` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `quizzes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user_answers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "quiz_results" DROP CONSTRAINT "quiz_results_subtopic_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_results" DROP CONSTRAINT "quiz_results_user_answer_id_fkey";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "stimulus";

-- AlterTable
ALTER TABLE "quiz_results" DROP COLUMN "subtopic_id",
ADD COLUMN     "subtopicId" TEXT;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "user_answers" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "_QuizResultToUserAnswer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_QuizResultToUserAnswer_AB_unique" ON "_QuizResultToUserAnswer"("A", "B");

-- CreateIndex
CREATE INDEX "_QuizResultToUserAnswer_B_index" ON "_QuizResultToUserAnswer"("B");

-- AddForeignKey
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "subtopics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizResultToUserAnswer" ADD CONSTRAINT "_QuizResultToUserAnswer_A_fkey" FOREIGN KEY ("A") REFERENCES "quiz_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizResultToUserAnswer" ADD CONSTRAINT "_QuizResultToUserAnswer_B_fkey" FOREIGN KEY ("B") REFERENCES "user_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
