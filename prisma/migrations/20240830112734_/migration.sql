/*
  Warnings:

  - You are about to drop the column `students_id` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_ids` on the `courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "students_id",
DROP COLUMN "teacher_ids";
