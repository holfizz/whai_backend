/*
  Warnings:

  - You are about to drop the column `lesson_block_id` on the `quizzes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_lesson_block_id_fkey";

-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "lesson_block_id";
