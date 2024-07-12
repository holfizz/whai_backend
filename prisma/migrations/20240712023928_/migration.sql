/*
  Warnings:

  - You are about to drop the column `completion_time` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `completion_time` on the `quiz_results` table. All the data in the column will be lost.
  - You are about to drop the column `lesson_id` on the `quiz_results` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "quiz_results" DROP CONSTRAINT "quiz_results_lesson_id_fkey";

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "completion_time";

-- AlterTable
ALTER TABLE "quiz_results" DROP COLUMN "completion_time",
DROP COLUMN "lesson_id";

-- AlterTable
ALTER TABLE "subtopics" ADD COLUMN     "completion_time" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "completion_time" INTEGER NOT NULL DEFAULT 0;
