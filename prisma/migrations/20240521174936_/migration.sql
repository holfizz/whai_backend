/*
  Warnings:

  - You are about to drop the column `sendToTelegram` on the `Notice` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "IconType" AS ENUM ('VIDEO', 'QUIZ', 'EQUATIONS', 'TEXT');

-- AlterTable
ALTER TABLE "Notice" DROP COLUMN "sendToTelegram";

-- CreateTable
CREATE TABLE "CoursePlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "CoursePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModulePlan" (
    "id" TEXT NOT NULL,
    "course_plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ModulePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubtopicPlan" (
    "id" TEXT NOT NULL,
    "module_plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "SubtopicPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL,
    "subtopic_plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icons" "IconType"[] DEFAULT ARRAY['TEXT']::"IconType"[],

    CONSTRAINT "LessonPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuixPlan" (
    "id" TEXT NOT NULL,
    "subtopic_plan_id" TEXT,
    "module_plan_id" TEXT,
    "description" TEXT,
    "icon" "IconType" NOT NULL DEFAULT 'QUIZ',

    CONSTRAINT "QuixPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModulePlan" ADD CONSTRAINT "ModulePlan_course_plan_id_fkey" FOREIGN KEY ("course_plan_id") REFERENCES "CoursePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtopicPlan" ADD CONSTRAINT "SubtopicPlan_module_plan_id_fkey" FOREIGN KEY ("module_plan_id") REFERENCES "ModulePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonPlan" ADD CONSTRAINT "LessonPlan_subtopic_plan_id_fkey" FOREIGN KEY ("subtopic_plan_id") REFERENCES "SubtopicPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuixPlan" ADD CONSTRAINT "QuixPlan_subtopic_plan_id_fkey" FOREIGN KEY ("subtopic_plan_id") REFERENCES "SubtopicPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuixPlan" ADD CONSTRAINT "QuixPlan_module_plan_id_fkey" FOREIGN KEY ("module_plan_id") REFERENCES "ModulePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
