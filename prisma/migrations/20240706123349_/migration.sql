/*
  Warnings:

  - You are about to drop the column `planId` on the `courses` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `plans` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_planId_fkey";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "planId";

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "courseId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
