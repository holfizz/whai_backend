/*
  Warnings:

  - You are about to drop the column `quizId` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `Quiz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "quizId",
DROP COLUMN "template";
