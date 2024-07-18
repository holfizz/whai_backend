/*
  Warnings:

  - Added the required column `courseAIHistoryId` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "courseAIHistoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_courseAIHistoryId_fkey" FOREIGN KEY ("courseAIHistoryId") REFERENCES "cousre_ai_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
