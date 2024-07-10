/*
  Warnings:

  - You are about to drop the column `completion_percentage` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `completion_time` on the `courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "completion_percentage",
DROP COLUMN "completion_time";
