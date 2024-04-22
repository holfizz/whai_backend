/*
  Warnings:

  - The primary key for the `Chat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ChatMembers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ChatWithAI` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MessageWithAI` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `text` on the `MessageWithAI` table. All the data in the column will be lost.
  - The `type` column on the `MessageWithAI` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `from` column on the `MessageWithAI` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `CreatorMode` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `conte` to the `MessageWithAI` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageWithAIRole" AS ENUM ('ASSISTANT', 'USER');

-- CreateEnum
CREATE TYPE "MessageTypeWithAI" AS ENUM ('answer', 'function_cal', 'tool_response', 'follow_up');

-- CreateEnum
CREATE TYPE "LessonTypeEnum" AS ENUM ('TEXT', 'VIDEO', 'QUIZ', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "LessonBlockEnum" AS ENUM ('TEXT', 'VIDEO', 'QUIZ', 'DOCUMENT', 'IMAGE', 'CODE');

-- CreateEnum
CREATE TYPE "CourseLevelEnum" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMembers" DROP CONSTRAINT "ChatMembers_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "ChatMembers" DROP CONSTRAINT "ChatMembers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ChatWithAI" DROP CONSTRAINT "ChatWithAI_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_user_id_fkey";

-- DropForeignKey
ALTER TABLE "MessageWithAI" DROP CONSTRAINT "MessageWithAI_chat_with_ai_id_fkey";

-- DropForeignKey
ALTER TABLE "_ChatMembersToMessage" DROP CONSTRAINT "_ChatMembersToMessage_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatMembersToMessage" DROP CONSTRAINT "_ChatMembersToMessage_B_fkey";

-- DropIndex
DROP INDEX "ChatMembers_user_id_chat_id_key";

-- AlterTable
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "ownerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Chat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Chat_id_seq";

-- AlterTable
ALTER TABLE "ChatMembers" DROP CONSTRAINT "ChatMembers_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "chat_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ChatMembers_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ChatMembers_id_seq";

-- AlterTable
ALTER TABLE "ChatWithAI" DROP CONSTRAINT "ChatWithAI_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ChatWithAI_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ChatWithAI_id_seq";

-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "chat_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Message_id_seq";

-- AlterTable
ALTER TABLE "MessageWithAI" DROP CONSTRAINT "MessageWithAI_pkey",
DROP COLUMN "text",
ADD COLUMN     "conte" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "MessageTypeWithAI",
DROP COLUMN "from",
ADD COLUMN     "from" "MessageWithAIRole" NOT NULL DEFAULT 'USER',
ALTER COLUMN "chat_with_ai_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "MessageWithAI_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MessageWithAI_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "courseId" INTEGER,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "_ChatMembersToMessage" ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "CreatorMode";

-- DropEnum
DROP TYPE "MessageWithAIFrom";

-- CreateTable
CREATE TABLE "LessonBlock" (
    "id" SERIAL NOT NULL,
    "type" "LessonBlockEnum" NOT NULL,
    "code" TEXT,
    "text" TEXT,
    "videoUrl" TEXT,
    "imageUrl" TEXT,
    "document" TEXT,
    "duration" INTEGER,
    "caption" TEXT NOT NULL,
    "language" TEXT,
    "lessonId" INTEGER NOT NULL,
    "quizId" INTEGER,

    CONSTRAINT "LessonBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonTask" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL,
    "lessonId" INTEGER,

    CONSTRAINT "LessonTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "types" "LessonTypeEnum"[],
    "folderId" INTEGER NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressPercents" (
    "id" SERIAL NOT NULL,
    "completedLessons" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,
    "progressPercents" DOUBLE PRECISION NOT NULL,
    "totalLessons" INTEGER NOT NULL,

    CONSTRAINT "ProgressPercents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerID" TEXT NOT NULL,
    "imageUrl" TEXT,
    "publicUrl" TEXT,
    "tags" TEXT[],
    "level" "CourseLevelEnum",
    "progressPercentsId" INTEGER,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgressPercents_courseId_key" ON "ProgressPercents"("courseId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatWithAI" ADD CONSTRAINT "ChatWithAI_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageWithAI" ADD CONSTRAINT "MessageWithAI_chat_with_ai_id_fkey" FOREIGN KEY ("chat_with_ai_id") REFERENCES "ChatWithAI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMembers" ADD CONSTRAINT "ChatMembers_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMembers" ADD CONSTRAINT "ChatMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonBlock" ADD CONSTRAINT "LessonBlock_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonBlock" ADD CONSTRAINT "LessonBlock_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonTask" ADD CONSTRAINT "LessonTask_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_progressPercentsId_fkey" FOREIGN KEY ("progressPercentsId") REFERENCES "ProgressPercents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatMembersToMessage" ADD CONSTRAINT "_ChatMembersToMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatMembers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatMembersToMessage" ADD CONSTRAINT "_ChatMembersToMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
