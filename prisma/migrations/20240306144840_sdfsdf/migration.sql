/*
  Warnings:

  - You are about to drop the column `name` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `is_admin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `_ChatToChatMembers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,chat_id]` on the table `ChatMembers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'STUDENT', 'CREATOR');

-- DropForeignKey
ALTER TABLE "_ChatToChatMembers" DROP CONSTRAINT "_ChatToChatMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatToChatMembers" DROP CONSTRAINT "_ChatToChatMembers_B_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'New chat';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "is_admin",
ADD COLUMN     "roles" "UserRole"[] DEFAULT ARRAY['USER', 'STUDENT']::"UserRole"[];

-- DropTable
DROP TABLE "_ChatToChatMembers";

-- DropEnum
DROP TYPE "UserMode";

-- CreateIndex
CREATE UNIQUE INDEX "ChatMembers_user_id_chat_id_key" ON "ChatMembers"("user_id", "chat_id");

-- AddForeignKey
ALTER TABLE "ChatMembers" ADD CONSTRAINT "ChatMembers_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMembers" ADD CONSTRAINT "ChatMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
