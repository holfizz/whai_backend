/*
  Warnings:

  - The values [EQUATIONS] on the enum `IconType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `placeholder` on the `Interaction` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IconType_new" AS ENUM ('VIDEO', 'QUIZ', 'TEXT');
ALTER TABLE "LessonPlan" ALTER COLUMN "icons" DROP DEFAULT;
ALTER TABLE "QuizPlan" ALTER COLUMN "icon" DROP DEFAULT;
ALTER TABLE "LessonPlan" ALTER COLUMN "icons" TYPE "IconType_new"[] USING ("icons"::text::"IconType_new"[]);
ALTER TABLE "QuizPlan" ALTER COLUMN "icon" TYPE "IconType_new" USING ("icon"::text::"IconType_new");
ALTER TYPE "IconType" RENAME TO "IconType_old";
ALTER TYPE "IconType_new" RENAME TO "IconType";
DROP TYPE "IconType_old";
ALTER TABLE "LessonPlan" ALTER COLUMN "icons" SET DEFAULT ARRAY['TEXT']::"IconType"[];
ALTER TABLE "QuizPlan" ALTER COLUMN "icon" SET DEFAULT 'QUIZ';
COMMIT;

-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "placeholder";
