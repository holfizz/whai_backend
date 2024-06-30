/*
  Warnings:

  - You are about to drop the column `moduleId` on the `subtopics` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "subtopics" DROP CONSTRAINT "subtopics_moduleId_fkey";

-- AlterTable
ALTER TABLE "subtopics" DROP COLUMN "moduleId",
ADD COLUMN     "topicId" TEXT;

-- AddForeignKey
ALTER TABLE "subtopics" ADD CONSTRAINT "subtopics_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
