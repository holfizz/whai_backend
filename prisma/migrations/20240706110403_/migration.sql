/*
  Warnings:

  - Added the required column `subtopic_id` to the `lesson_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lesson_plans" ADD COLUMN     "subtopic_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_subtopic_id_fkey" FOREIGN KEY ("subtopic_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
