/*
  Warnings:

  - The values [DOCUMENT] on the enum `LessonBlockEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `document` on the `LessonBlock` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LessonBlockEnum_new" AS ENUM ('TEXT', 'VIDEO', 'QUIZ', 'IMAGE', 'CODE');
ALTER TABLE "LessonBlock" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "LessonBlock" ALTER COLUMN "type" TYPE "LessonBlockEnum_new" USING ("type"::text::"LessonBlockEnum_new");
ALTER TYPE "LessonBlockEnum" RENAME TO "LessonBlockEnum_old";
ALTER TYPE "LessonBlockEnum_new" RENAME TO "LessonBlockEnum";
DROP TYPE "LessonBlockEnum_old";
ALTER TABLE "LessonBlock" ALTER COLUMN "type" SET DEFAULT 'TEXT';
COMMIT;

-- AlterTable
ALTER TABLE "LessonBlock" DROP COLUMN "document",
ALTER COLUMN "type" SET DEFAULT 'TEXT';
