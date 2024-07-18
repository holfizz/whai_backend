/*
  Warnings:

  - Added the required column `course_id` to the `chats_with_ai` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chats_with_ai" ADD COLUMN     "course_id" TEXT NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'New AI Chat';
