/*
  Warnings:

  - The values [TEXT,QUIZ,DOCUMENT] on the enum `LessonTypeEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `image_url` on the `courses` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LessonTypeEnum_new" AS ENUM ('VIDEO');
ALTER TABLE "lessons" ALTER COLUMN "types" TYPE "LessonTypeEnum_new"[] USING ("types"::text::"LessonTypeEnum_new"[]);
ALTER TYPE "LessonTypeEnum" RENAME TO "LessonTypeEnum_old";
ALTER TYPE "LessonTypeEnum_new" RENAME TO "LessonTypeEnum";
DROP TYPE "LessonTypeEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "image_url";

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "isPlan" BOOLEAN NOT NULL DEFAULT true;

-- DropEnum
DROP TYPE "IconType";
