/*
  Warnings:

  - You are about to drop the column `total_questions` on the `quiz_results` table. All the data in the column will be lost.
  - Added the required column `total_percent` to the `quiz_results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quiz_results" DROP COLUMN "total_questions",
ADD COLUMN     "total_percent" INTEGER NOT NULL;
