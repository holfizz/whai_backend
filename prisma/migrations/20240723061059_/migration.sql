/*
  Warnings:

  - The primary key for the `interactions` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "courses" ALTER COLUMN "name" SET DEFAULT 'Course';

-- AlterTable
ALTER TABLE "interactions" DROP CONSTRAINT "interactions_pkey";
