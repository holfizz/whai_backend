/*
  Warnings:

  - You are about to drop the column `course_id` on the `subtopics` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "subtopics" DROP CONSTRAINT "subtopics_course_id_fkey";

-- AlterTable
ALTER TABLE "subtopics" DROP COLUMN "course_id",
ADD COLUMN     "courseId" TEXT;

-- AddForeignKey
ALTER TABLE "subtopics" ADD CONSTRAINT "subtopics_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
