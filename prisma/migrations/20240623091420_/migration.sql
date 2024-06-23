/*
  Warnings:

  - You are about to drop the column `duration` on the `LessonBlock` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `LessonBlock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LessonBlock" DROP COLUMN "duration",
DROP COLUMN "language";
