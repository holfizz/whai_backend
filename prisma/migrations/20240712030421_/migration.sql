/*
  Warnings:

  - You are about to drop the column `courseId` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `completion_time` on the `quizzes` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `quizzes` table. All the data in the column will be lost.
  - Added the required column `course_id` to the `subtopics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_courseId_fkey";

-- DropForeignKey
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_courseId_fkey";

-- AlterTable
ALTER TABLE "lessons" DROP COLUMN "courseId";

-- AlterTable
ALTER TABLE "quizzes" DROP COLUMN "completion_time",
DROP COLUMN "courseId";

-- AlterTable
ALTER TABLE "subtopics" ADD COLUMN     "course_id" TEXT NOT NULL,
ALTER COLUMN "completion_time" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "topics" ALTER COLUMN "completion_time" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "subtopics" ADD CONSTRAINT "subtopics_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
