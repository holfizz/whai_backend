/*
  Warnings:

  - You are about to drop the `user_course_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_course_progress" DROP CONSTRAINT "user_course_progress_course_id_fkey";

-- DropForeignKey
ALTER TABLE "user_course_progress" DROP CONSTRAINT "user_course_progress_user_id_fkey";

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "completion_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "user_course_progress";
