/*
  Warnings:

  - You are about to drop the `lesson_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subtopic_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `topic_plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "lesson_plans" DROP CONSTRAINT "lesson_plans_subtopic_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_plans" DROP CONSTRAINT "lesson_plans_subtopic_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "plans" DROP CONSTRAINT "plans_courseId_fkey";

-- DropForeignKey
ALTER TABLE "quiz_plans" DROP CONSTRAINT "quiz_plans_subtopic_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_plans" DROP CONSTRAINT "quiz_plans_topic_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "subtopic_plans" DROP CONSTRAINT "subtopic_plans_subtopic_id_fkey";

-- DropForeignKey
ALTER TABLE "subtopic_plans" DROP CONSTRAINT "subtopic_plans_topic_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "topic_plans" DROP CONSTRAINT "topic_plans_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "topic_plans" DROP CONSTRAINT "topic_plans_topic_id_fkey";

-- DropTable
DROP TABLE "lesson_plans";

-- DropTable
DROP TABLE "plans";

-- DropTable
DROP TABLE "quiz_plans";

-- DropTable
DROP TABLE "subtopic_plans";

-- DropTable
DROP TABLE "topic_plans";
