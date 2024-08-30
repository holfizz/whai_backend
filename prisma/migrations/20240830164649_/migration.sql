/*
  Warnings:

  - You are about to drop the column `is_final_project_completed` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_final_project_completed",
ADD COLUMN     "is_first_lesson_completed" BOOLEAN NOT NULL DEFAULT false;
