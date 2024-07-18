/*
  Warnings:

  - Made the column `lesson_id` on table `chats_with_ai` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "chats_with_ai" ALTER COLUMN "lesson_id" SET NOT NULL;
