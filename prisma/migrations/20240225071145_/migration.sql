/*
  Warnings:

  - You are about to drop the column `userId` on the `ChatWithAI` table. All the data in the column will be lost.
  - The `type` column on the `MessageWIthAI` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('VOICE', 'TEXT');

-- DropForeignKey
ALTER TABLE "ChatWithAI" DROP CONSTRAINT "ChatWithAI_userId_fkey";

-- AlterTable
ALTER TABLE "ChatWithAI" DROP COLUMN "userId",
ADD COLUMN     "user_id" INTEGER,
ALTER COLUMN "title" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MessageWIthAI" DROP COLUMN "type",
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT';

-- DropEnum
DROP TYPE "MessageWIthAIType";

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "name" TEXT DEFAULT 'New chat',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "inviteLink" TEXT,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMembers" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "chat_id" INTEGER NOT NULL,

    CONSTRAINT "ChatMembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "text" TEXT NOT NULL,
    "imgPath" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "chat_id" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatToChatMembers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ChatMembersToMessage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Chat_ownerId_key" ON "Chat"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_inviteLink_key" ON "Chat"("inviteLink");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatToChatMembers_AB_unique" ON "_ChatToChatMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatToChatMembers_B_index" ON "_ChatToChatMembers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatMembersToMessage_AB_unique" ON "_ChatMembersToMessage"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatMembersToMessage_B_index" ON "_ChatMembersToMessage"("B");

-- AddForeignKey
ALTER TABLE "ChatWithAI" ADD CONSTRAINT "ChatWithAI_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatToChatMembers" ADD CONSTRAINT "_ChatToChatMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatToChatMembers" ADD CONSTRAINT "_ChatToChatMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "ChatMembers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatMembersToMessage" ADD CONSTRAINT "_ChatMembersToMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatMembers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatMembersToMessage" ADD CONSTRAINT "_ChatMembersToMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
