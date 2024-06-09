/*
  Warnings:

  - You are about to drop the `CoursePlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ModulePlan" DROP CONSTRAINT "ModulePlan_course_plan_id_fkey";

-- AlterTable
ALTER TABLE "ModulePlan" ADD COLUMN     "planId" TEXT;

-- DropTable
DROP TABLE "CoursePlan";

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModulePlan" ADD CONSTRAINT "ModulePlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
