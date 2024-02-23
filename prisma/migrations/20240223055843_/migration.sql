/*
  Warnings:

  - You are about to drop the column `chat_woth_ai_id` on the `MessageWIthAI` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MessageWIthAI" DROP CONSTRAINT "MessageWIthAI_chat_woth_ai_id_fkey";

-- AlterTable
ALTER TABLE "MessageWIthAI" DROP COLUMN "chat_woth_ai_id",
ADD COLUMN     "chat_with_ai_id" INTEGER;

-- AddForeignKey
ALTER TABLE "MessageWIthAI" ADD CONSTRAINT "MessageWIthAI_chat_with_ai_id_fkey" FOREIGN KEY ("chat_with_ai_id") REFERENCES "ChatWithAI"("id") ON DELETE SET NULL ON UPDATE CASCADE;
