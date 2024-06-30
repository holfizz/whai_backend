/*
  Warnings:

  - You are about to drop the column `folder_id` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `folder_id` on the `quiz_results` table. All the data in the column will be lost.
  - You are about to drop the column `folder_id` on the `quizzes` table. All the data in the column will be lost.
  - Added the required column `subtopic_id` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_results" DROP CONSTRAINT "quiz_results_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_folder_id_fkey";

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "folder_id",
ADD COLUMN     "subtopic_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quiz_results" DROP COLUMN "folder_id",
ADD COLUMN     "subtopic_id" TEXT;

-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "folder_id",
ADD COLUMN     "subtopic_id" TEXT;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_results" ADD CONSTRAINT "quiz_results_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "subtopics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
