/*
  Warnings:

  - You are about to drop the column `userId` on the `CreatorMode` table. All the data in the column will be lost.
  - You are about to drop the column `userMode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Chats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MessageWIthAIFrom" AS ENUM ('AI', 'USER');

-- CreateEnum
CREATE TYPE "MessageWIthAIType" AS ENUM ('VOICE', 'TEXT');

-- DropForeignKey
ALTER TABLE "Chats" DROP CONSTRAINT "Chats_userId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_creatorModeId_fkey";

-- DropForeignKey
ALTER TABLE "CreatorMode" DROP CONSTRAINT "CreatorMode_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_creatorModeId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatsId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_lesson_id_fkey";

-- DropIndex
DROP INDEX "CreatorMode_userId_key";

-- AlterTable
ALTER TABLE "CreatorMode" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userMode";

-- DropTable
DROP TABLE "Chats";

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "Lesson";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "Quiz";

-- CreateTable
CREATE TABLE "ChatWithAI" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ChatWithAI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageWIthAI" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "type" "MessageWIthAIType" NOT NULL,
    "from" "MessageWIthAIFrom" NOT NULL,
    "chat_woth_ai_id" INTEGER,

    CONSTRAINT "MessageWIthAI_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- AddForeignKey
ALTER TABLE "ChatWithAI" ADD CONSTRAINT "ChatWithAI_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageWIthAI" ADD CONSTRAINT "MessageWIthAI_chat_woth_ai_id_fkey" FOREIGN KEY ("chat_woth_ai_id") REFERENCES "ChatWithAI"("id") ON DELETE SET NULL ON UPDATE CASCADE;
