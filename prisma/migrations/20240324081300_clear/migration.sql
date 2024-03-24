-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'STUDENT', 'CREATOR');

-- CreateEnum
CREATE TYPE "MessageWithAIFrom" AS ENUM ('AI', 'USER');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('VOICE', 'TEXT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "avatarPath" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" "UserRole"[] DEFAULT ARRAY['USER', 'STUDENT']::"UserRole"[],
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "activation_link" TEXT,
    "reset_password_token" TEXT,
    "reset_password_expiration" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorMode" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CreatorMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatWithAI" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat with ai',
    "user_id" INTEGER,

    CONSTRAINT "ChatWithAI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageWithAI" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "file" TEXT,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "from" "MessageWithAIFrom" NOT NULL DEFAULT 'USER',
    "chat_with_ai_id" INTEGER NOT NULL,

    CONSTRAINT "MessageWithAI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat',
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
    "file" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "chat_id" INTEGER,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatMembersToMessage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_activation_link_key" ON "User"("activation_link");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_inviteLink_key" ON "Chat"("inviteLink");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMembers_user_id_chat_id_key" ON "ChatMembers"("user_id", "chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatMembersToMessage_AB_unique" ON "_ChatMembersToMessage"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatMembersToMessage_B_index" ON "_ChatMembersToMessage"("B");

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
ALTER TABLE "_ChatMembersToMessage" ADD CONSTRAINT "_ChatMembersToMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatMembers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatMembersToMessage" ADD CONSTRAINT "_ChatMembersToMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
