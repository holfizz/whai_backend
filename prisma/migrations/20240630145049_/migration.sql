/*
  Warnings:

  - Made the column `topicId` on table `subtopics` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "subtopics" DROP CONSTRAINT "subtopics_topicId_fkey";

-- AlterTable
ALTER TABLE "subtopics" ALTER COLUMN "topicId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "subtopics" ADD CONSTRAINT "subtopics_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
