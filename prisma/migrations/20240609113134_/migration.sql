/*
  Warnings:

  - Added the required column `updatedAt` to the `LessonPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ModulePlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `QuizPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SubtopicPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LessonPlan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ModulePlan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "QuizPlan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SubtopicPlan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
