/*
  Warnings:

  - You are about to drop the column `completion_percentage` on the `subtopics` table. All the data in the column will be lost.
  - You are about to drop the column `completion_time` on the `subtopics` table. All the data in the column will be lost.
  - You are about to drop the column `completion_percentage` on the `topics` table. All the data in the column will be lost.
  - You are about to drop the column `completion_time` on the `topics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subtopics" DROP COLUMN "completion_percentage",
DROP COLUMN "completion_time";

-- AlterTable
ALTER TABLE "topics" DROP COLUMN "completion_percentage",
DROP COLUMN "completion_time";
