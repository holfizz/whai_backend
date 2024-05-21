/*
  Warnings:

  - You are about to drop the `QuixPlan` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `description` on table `LessonPlan` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "QuixPlan" DROP CONSTRAINT "QuixPlan_module_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "QuixPlan" DROP CONSTRAINT "QuixPlan_subtopic_plan_id_fkey";

-- AlterTable
ALTER TABLE "LessonPlan" ALTER COLUMN "description" SET NOT NULL;

-- DropTable
DROP TABLE "QuixPlan";

-- CreateTable
CREATE TABLE "QuizPlan" (
    "id" TEXT NOT NULL,
    "subtopic_plan_id" TEXT,
    "module_plan_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" "IconType" NOT NULL DEFAULT 'QUIZ',

    CONSTRAINT "QuizPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizPlan" ADD CONSTRAINT "QuizPlan_subtopic_plan_id_fkey" FOREIGN KEY ("subtopic_plan_id") REFERENCES "SubtopicPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizPlan" ADD CONSTRAINT "QuizPlan_module_plan_id_fkey" FOREIGN KEY ("module_plan_id") REFERENCES "ModulePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
