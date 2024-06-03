/*
  Warnings:

  - You are about to drop the `QuizPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuizPlan" DROP CONSTRAINT "QuizPlan_module_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "QuizPlan" DROP CONSTRAINT "QuizPlan_subtopic_plan_id_fkey";

-- DropTable
DROP TABLE "QuizPlan";
