/*
  Warnings:

  - You are about to drop the column `total_percent` on the `quiz_results` table. All the data in the column will be lost.
  - Added the required column `total_percents` to the `quiz_results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quiz_results" DROP COLUMN "total_percent",
ADD COLUMN     "total_percents" INTEGER NOT NULL;
