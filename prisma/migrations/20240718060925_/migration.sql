/*
  Warnings:

  - You are about to drop the column `courseAIHistoryId` on the `courses` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_courseAIHistoryId_fkey";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "courseAIHistoryId";

-- AddForeignKey
ALTER TABLE "cousre_ai_history" ADD CONSTRAINT "cousre_ai_history_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
